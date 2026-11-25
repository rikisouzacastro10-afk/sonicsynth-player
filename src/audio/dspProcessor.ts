import { DEFAULT_AUDIO_FX, type AudioFxSettings } from '../utils/settingsAndFx';

const EQ_FREQUENCIES = [60, 230, 910, 3600, 14000] as const;

interface GlobalDspRegistry {
  ctx?: AudioContext;
  sources?: WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>;
}

const GLOBAL_DSP_KEY = '__sonicMorphAudioDsp';

function getGlobalRegistry(): GlobalDspRegistry {
  const g = globalThis as Record<string, unknown>;
  if (!g[GLOBAL_DSP_KEY]) {
    g[GLOBAL_DSP_KEY] = {
      sources: new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>(),
    } satisfies GlobalDspRegistry;
  }
  return g[GLOBAL_DSP_KEY] as GlobalDspRegistry;
}

function buildSyntheticImpulse(ctx: AudioContext, seconds = 2.4, decay = 2.1): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * seconds));
  const buffer = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let prev = 0;
    for (let i = 0; i < length; i++) {
      const progress = i / length;
      const env = Math.pow(1 - progress, decay);
      // Warm early reflections + stereo decorrelated tail
      const white = Math.random() * 2 - 1;
      prev = prev * 0.35 + white * 0.65;
      const earlyBoost = i < rate * 0.045 ? 1.25 : 1.0;
      data[i] = prev * env * earlyBoost;
    }
  }
  return buffer;
}

class AudioDspProcessor {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private compressor: DynamicsCompressorNode | null = null;
  private dryGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private panner: StereoPannerNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoDepth: GainNode | null = null;
  private currentSettings: AudioFxSettings = DEFAULT_AUDIO_FX;
  private isAttached = false;

  attachAudioElement(audio: HTMLAudioElement): void {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const reg = getGlobalRegistry();
    if (!reg.ctx) {
      reg.ctx = new AudioCtx();
    }
    this.ctx = reg.ctx;

    if (!this.isAttached) {
      let source = reg.sources?.get(audio);
      if (!source) {
        try {
          source = this.ctx.createMediaElementSource(audio);
          reg.sources?.set(audio, source);
        } catch {
          return;
        }
      }
      this.sourceNode = source;
      this.buildGraph();
      this.isAttached = true;
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    this.applySettings(this.currentSettings);
  }

  private buildGraph() {
    if (!this.ctx || !this.sourceNode) return;

    this.eqFilters = EQ_FREQUENCIES.map((freq, idx) => {
      const filter = this.ctx!.createBiquadFilter();
      filter.type =
        idx === 0
          ? 'lowshelf'
          : idx === EQ_FREQUENCIES.length - 1
            ? 'highshelf'
            : 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.05;
      filter.gain.value = 0;
      return filter;
    });

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 3.5;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.22;

    this.panner = this.ctx.createStereoPanner();
    this.panner.pan.value = 0;

    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.value = 0.18;
    this.lfoDepth = this.ctx.createGain();
    this.lfoDepth.gain.value = 0;
    this.lfoOsc.connect(this.lfoDepth);
    this.lfoDepth.connect(this.panner.pan);
    this.lfoOsc.start();

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 1;

    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = buildSyntheticImpulse(this.ctx, 2.4, 2.1);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.value = 0;

    this.delayNode = this.ctx.createDelay(1.5);
    this.delayNode.delayTime.value = 0.36;
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.value = 0.42;
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.value = 0;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1;

    // Wire EQ chain: Source -> 5-Band EQ -> Compressor -> Spatial 8D Panner
    let head: AudioNode = this.sourceNode;
    try {
      head.disconnect();
    } catch {
      // Ignore if not connected yet
    }
    for (const eq of this.eqFilters) {
      head.connect(eq);
      head = eq;
    }

    head.connect(this.compressor);
    this.compressor.connect(this.panner);

    // Parallel Dry + Delay + Reverb buses into Master Gain -> Destination
    this.panner.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.panner.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    this.panner.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);
  }

  applySettings(settings: AudioFxSettings): void {
    this.currentSettings = settings;
    if (!this.ctx || !this.isAttached) return;

    const now = this.ctx.currentTime;
    const fxActive = settings.enabled;

    this.eqFilters.forEach((filter, i) => {
      const targetDb = fxActive ? settings.eqBands[i] ?? 0 : 0;
      filter.gain.setTargetAtTime(targetDb, now, 0.04);
    });

    if (this.compressor) {
      const useNorm = fxActive && settings.normalizerEnabled;
      this.compressor.ratio.setTargetAtTime(useNorm ? 4 : 1, now, 0.05);
      this.compressor.threshold.setTargetAtTime(useNorm ? -18 : 0, now, 0.05);
    }

    const reverbWet = fxActive ? Math.max(0, Math.min(1, settings.reverbMix)) : 0;
    const delayWet = fxActive ? Math.max(0, Math.min(1, settings.delayMix)) : 0;

    if (this.dryGain) {
      const targetDry = fxActive ? Math.max(0.55, 1 - (reverbWet + delayWet) * 0.2) : 1;
      this.dryGain.gain.setTargetAtTime(targetDry, now, 0.05);
    }

    if (this.reverbGain) {
      this.reverbGain.gain.setTargetAtTime(reverbWet * 1.1, now, 0.05);
    }

    if (this.delayGain) {
      this.delayGain.gain.setTargetAtTime(delayWet * 0.9, now, 0.05);
    }

    if (this.delayFeedback) {
      this.delayFeedback.gain.setTargetAtTime(delayWet > 0 ? 0.42 : 0, now, 0.05);
    }

    if (this.lfoOsc && this.lfoDepth) {
      this.lfoOsc.frequency.setTargetAtTime(settings.spatial8dSpeed || 0.18, now, 0.05);
      this.lfoDepth.gain.setTargetAtTime(
        fxActive && settings.spatial8dEnabled ? 0.85 : 0,
        now,
        0.08
      );
    }
  }
}

export const dspProcessor = new AudioDspProcessor();
