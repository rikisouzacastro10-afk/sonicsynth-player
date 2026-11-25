import { audioClock } from './audioClock';
import {
  initMediaSessionHandlers,
  updateMediaSessionMetadata,
  updateMediaSessionPlaybackState,
} from './mediaSession';
import { youtubePlayerService, YT_STATE } from './youtubePlayerService';
import { getOfflineAudioBlob, getOfflineTrackRecord } from '../services/offlineStorage';
import { fetchSponsorSegments, fetchSyncedLyrics } from '../services/streamingService';
import type { SponsorSegment, Track } from '../types/music';
import { findActiveSponsorSegment, formatSponsorCategory } from '../utils/sponsorBlock';

import { dspProcessor } from './dspProcessor';
import { evaluateCrossfadeTrigger, type AudioFxSettings } from '../utils/settingsAndFx';

interface EngineCallbacks {
  onTrackEnded: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onTrackMetadataLoaded: (trackId: string, lyricsLrc: string | null, segments: SponsorSegment[]) => void;
  onSponsorSkipped: (label: string) => void;
  onStreamError: (message: string) => void;
  onCrossfadeNext?: () => void;
}

const GLOBAL_AUDIO_KEY = '__sonicMorphSingletonAudio';
const GLOBAL_DISPATCHER_KEY = '__sonicMorphAudioDispatcher';

type AudioEventName =
  | 'play'
  | 'playing'
  | 'pause'
  | 'waiting'
  | 'ended'
  | 'loadedmetadata'
  | 'durationchange'
  | 'timeupdate'
  | 'error';

type PlaybackBackend = 'youtube' | 'offline' | 'none';

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private rafId: number | null = null;
  private ytPollTimer: number | null = null;
  private objectUrl: string | null = null;
  private currentTrack: Track | null = null;
  private activeBackend: PlaybackBackend = 'none';
  private sponsorSegments: SponsorSegment[] = [];
  private skippedIds = new Set<string>();
  private sponsorBlockEnabled = true;
  private callbacks: EngineCallbacks | null = null;
  private loadSeq = 0;
  private activeAbortController: AbortController | null = null;
  private volume = 0.85;
  private sleepMultiplier = 1;
  private smoothFadeEnabled = true;
  private crossfadeSeconds = 0;
  private crossfadeTriggeredForSeq = -1;
  private isCrossfading = false;
  private ignoreEndedForSeq = -1;
  private incomingCrossfadeMs = 0;
  private fadeTimer: number | null = null;
  private isClearingSource = false;

  getActiveBackend(): PlaybackBackend {
    return this.activeBackend;
  }

  init(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
    if (typeof document === 'undefined') return;

    const g = globalThis as Record<string, unknown>;
    g[GLOBAL_DISPATCHER_KEY] = (eventName: AudioEventName) => {
      this.handleNativeAudioEvent(eventName);
    };

    youtubePlayerService.init({
      onStateChange: (state) => this.handleYouTubeStateChange(state),
      onError: (code) => this.handleYouTubeError(code),
    });

    if (!this.audio) {
      let el = g[GLOBAL_AUDIO_KEY] as HTMLAudioElement | undefined;
      if (!el) {
        el = new Audio();
        el.preload = 'auto';
        el.crossOrigin = 'anonymous';
        el.volume = this.volume;
        g[GLOBAL_AUDIO_KEY] = el;

        const events: AudioEventName[] = [
          'play',
          'playing',
          'pause',
          'waiting',
          'ended',
          'loadedmetadata',
          'durationchange',
          'timeupdate',
          'error',
        ];
        for (const evt of events) {
          el.addEventListener(evt, () => {
            const dispatch = (globalThis as Record<string, unknown>)[GLOBAL_DISPATCHER_KEY] as
              | ((name: AudioEventName) => void)
              | undefined;
            dispatch?.(evt);
          });
        }
      }
      this.audio = el;
    }

    this.audio.volume = this.volume;
    youtubePlayerService.setVolume(this.volume);

    initMediaSessionHandlers({
      onPlay: () => void this.play(),
      onPause: () => this.pause(),
      onNext: () => this.callbacks?.onNext(),
      onPrevious: () => this.callbacks?.onPrevious(),
      onSeekTo: (t) => this.seek(t),
      onSeekBy: (offset) => {
        const cur =
          this.activeBackend === 'youtube'
            ? youtubePlayerService.getCurrentTime()
            : this.audio?.currentTime || 0;
        this.seek(cur + offset);
      },
    });
  }

  private handleNativeAudioEvent(eventName: AudioEventName) {
    if (this.activeBackend !== 'offline') return;

    switch (eventName) {
      case 'play':
      case 'playing': {
        this.callbacks?.onPlayStateChange(true);
        this.startOfflineTickLoop();
        this.syncClockFromOffline();
        break;
      }
      case 'pause': {
        if (!this.isClearingSource) {
          this.callbacks?.onPlayStateChange(false);
        }
        this.stopTickLoops();
        this.syncClockFromOffline();
        break;
      }
      case 'waiting': {
        this.syncClockFromOffline();
        break;
      }
      case 'ended': {
        this.stopTickLoops();
        this.syncClockFromOffline();
        if (this.ignoreEndedForSeq === this.loadSeq || this.isCrossfading) {
          return;
        }
        this.callbacks?.onPlayStateChange(false);
        this.callbacks?.onTrackEnded();
        break;
      }
      case 'loadedmetadata':
      case 'durationchange': {
        this.syncClockFromOffline();
        break;
      }
      case 'timeupdate': {
        if (!this.rafId) this.syncClockFromOffline();
        break;
      }
      case 'error': {
        if (this.isClearingSource) return;
        const rawSrc = this.audio?.getAttribute('src');
        if (!rawSrc) return;
        this.stopTickLoops();
        this.callbacks?.onPlayStateChange(false);
        if (this.currentTrack) {
          this.callbacks?.onStreamError(
            `Erro ao reproduzir arquivo local de "${this.currentTrack.title}".`
          );
        }
        break;
      }
    }
  }

  private handleYouTubeStateChange(state: number) {
    if (this.activeBackend !== 'youtube') return;

    if (state === YT_STATE.PLAYING) {
      this.callbacks?.onPlayStateChange(true);
      this.startYouTubeTickLoop();
      this.syncClockFromYouTube(true);
    } else if (state === YT_STATE.PAUSED) {
      this.stopTickLoops();
      this.callbacks?.onPlayStateChange(false);
      this.syncClockFromYouTube(false);
    } else if (state === YT_STATE.ENDED) {
      this.stopTickLoops();
      if (this.ignoreEndedForSeq === this.loadSeq || this.isCrossfading) {
        return;
      }
      this.callbacks?.onPlayStateChange(false);
      const duration = youtubePlayerService.getDuration() || this.currentTrack?.duration || 0;
      audioClock.update({ currentTime: duration, duration, isPlaying: false });
      updateMediaSessionPlaybackState(false, duration, duration);
      this.callbacks?.onTrackEnded();
    } else if (state === YT_STATE.BUFFERING) {
      this.syncClockFromYouTube(false);
    }
  }

  private handleYouTubeError(code: number) {
    if (this.activeBackend !== 'youtube') return;
    this.stopTickLoops();
    this.callbacks?.onPlayStateChange(false);
    const label = this.currentTrack?.title ? `"${this.currentTrack.title}"` : 'esta faixa';
    if (code === 101 || code === 150) {
      this.callbacks?.onStreamError(
        `Incorporação bloqueada pelo canal para ${label}. Tentando outra versão ou próxima faixa...`
      );
    } else {
      this.callbacks?.onStreamError(`Falha no player do YouTube (código ${code}) para ${label}.`);
    }
  }

  private clearActiveMediaElement() {
    if (!this.audio) return;
    this.isClearingSource = true;
    try {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.src = '';
      this.audio.load();
    } finally {
      this.isClearingSource = false;
    }
    this.revokeObjectUrl();
  }

  private revokeObjectUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private abortPendingRequests() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  setSponsorBlockEnabled(enabled: boolean) {
    this.sponsorBlockEnabled = enabled;
  }

  setSmoothFade(enabled: boolean) {
    this.smoothFadeEnabled = enabled;
  }

  setCrossfadeSeconds(seconds: number) {
    this.crossfadeSeconds = Math.max(0, Math.min(12, Math.round(seconds)));
  }

  setAudioFx(fx: AudioFxSettings) {
    dspProcessor.applySettings(fx);
  }

  setSleepVolumeMultiplier(mult: number) {
    this.sleepMultiplier = Math.max(0, Math.min(1, mult));
    this.applyEffectiveVolume(this.volume * this.sleepMultiplier);
  }

  private applyEffectiveVolume(target: number) {
    const clamped = Math.max(0, Math.min(1, target));
    if (this.audio) {
      this.audio.volume = clamped;
    }
    youtubePlayerService.setVolume(clamped);
  }

  private rampVolume(
    from: number,
    to: number,
    durationMs = 280,
    onDone?: () => void,
    forceRamp = false
  ) {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if ((!this.smoothFadeEnabled && !forceRamp) || durationMs <= 0) {
      this.applyEffectiveVolume(to);
      onDone?.();
      return;
    }
    const steps = Math.max(10, Math.min(36, Math.round(durationMs / 65)));
    const stepMs = Math.max(20, Math.round(durationMs / steps));
    let currentStep = 0;
    this.applyEffectiveVolume(from);
    this.fadeTimer = window.setInterval(() => {
      currentStep++;
      const ratio = currentStep / steps;
      const val = from + (to - from) * ratio;
      this.applyEffectiveVolume(val);
      if (currentStep >= steps) {
        if (this.fadeTimer !== null) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
        }
        onDone?.();
      }
    }, stepMs);
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.applyEffectiveVolume(this.volume * this.sleepMultiplier);
  }

  hasSource(): boolean {
    if (this.activeBackend === 'offline') {
      return Boolean(this.audio?.getAttribute('src'));
    }
    if (this.activeBackend === 'youtube') {
      return youtubePlayerService.hasActiveTrack();
    }
    return false;
  }

  async loadAndPlay(track: Track, autoPlay = true, isOnline = true) {
    const seq = ++this.loadSeq;
    const incomingFadeMs = this.incomingCrossfadeMs;
    this.incomingCrossfadeMs = 0;
    this.isCrossfading = false;
    this.crossfadeTriggeredForSeq = -1;

    // 1. Immediately abort any pending operations and silence BOTH backends (zero overlap)
    this.abortPendingRequests();
    const controller = new AbortController();
    this.activeAbortController = controller;

    this.stopTickLoops();
    this.clearActiveMediaElement();
    youtubePlayerService.stop();
    this.activeBackend = 'none';

    this.currentTrack = track;
    this.skippedIds.clear();
    this.sponsorSegments = track.sponsorSegments || [];

    this.callbacks?.onPlayStateChange(false);
    audioClock.update({ currentTime: 0, duration: track.duration || 0, isPlaying: false });
    updateMediaSessionMetadata(track);

    // 2. Hybrid Check: prioritize local IndexedDB Blob when downloaded OR offline
    try {
      const offlineBlob = await getOfflineAudioBlob(track.id);
      if (controller.signal.aborted || seq !== this.loadSeq) return;

      if (offlineBlob && this.audio) {
        this.activeBackend = 'offline';
        dspProcessor.attachAudioElement(this.audio);
        this.objectUrl = URL.createObjectURL(offlineBlob);
        this.audio.src = this.objectUrl;
        const targetVol = this.volume * this.sleepMultiplier;
        const shouldFadeIn = incomingFadeMs > 0 || this.smoothFadeEnabled;
        const startVol = incomingFadeMs > 0 ? 0 : this.smoothFadeEnabled ? 0.05 : targetVol;
        this.audio.volume = startVol;
        this.audio.load();

        if (autoPlay) {
          try {
            await this.audio.play();
            if (controller.signal.aborted || seq !== this.loadSeq) {
              this.clearActiveMediaElement();
              return;
            }
            if (shouldFadeIn) {
              this.rampVolume(
                startVol,
                targetVol,
                incomingFadeMs > 0 ? incomingFadeMs : 320,
                undefined,
                incomingFadeMs > 0
              );
            }
          } catch {
            // Autoplay blocked until user interaction
          }
        }
      } else if (!isOnline) {
        this.callbacks?.onPlayStateChange(false);
        this.callbacks?.onStreamError(`"${track.title}" não foi baixada para reprodução offline.`);
        return;
      } else {
        // 3. Online Playback via official YouTube IFrame Player API singleton
        this.activeBackend = 'youtube';
        const targetVol = this.volume * this.sleepMultiplier;
        const shouldFadeIn = incomingFadeMs > 0 || this.smoothFadeEnabled;
        const startVol = incomingFadeMs > 0 ? 0 : this.smoothFadeEnabled ? 0.1 : targetVol;
        youtubePlayerService.setVolume(startVol);
        if (autoPlay) {
          await youtubePlayerService.loadAndPlay(track.id, controller.signal);
          if (controller.signal.aborted || seq !== this.loadSeq) {
            youtubePlayerService.stop();
            return;
          }
          if (shouldFadeIn) {
            this.rampVolume(
              startVol,
              targetVol,
              incomingFadeMs > 0 ? incomingFadeMs : 350,
              undefined,
              incomingFadeMs > 0
            );
          }
        }
      }
    } catch (err) {
      if ((err instanceof DOMException && err.name === 'AbortError') || controller.signal.aborted) {
        return;
      }
      this.callbacks?.onPlayStateChange(false);
      this.callbacks?.onStreamError(`Não foi possível iniciar "${track.title}".`);
      return;
    }

    // 4. Async LRCLIB lyrics & SponsorBlock segments
    try {
      const offlineRecord = await getOfflineTrackRecord(track.id);
      if (controller.signal.aborted || seq !== this.loadSeq) return;

      let lyrics = offlineRecord?.lyricsLrc || track.lyricsLrc || null;
      let segments = this.sponsorSegments;

      if (isOnline) {
        const [fetchedLyrics, fetchedSegments] = await Promise.all([
          lyrics ? Promise.resolve(lyrics) : fetchSyncedLyrics(track, controller.signal),
          segments.length > 0
            ? Promise.resolve(segments)
            : fetchSponsorSegments(track, controller.signal),
        ]);
        if (controller.signal.aborted || seq !== this.loadSeq) return;
        lyrics = fetchedLyrics;
        segments = fetchedSegments;
      }

      this.sponsorSegments = segments;
      this.callbacks?.onTrackMetadataLoaded(track.id, lyrics, segments);
    } catch {
      // Ignore cancelled metadata requests
    }
  }

  async play() {
    if (!this.hasSource() && this.currentTrack) {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      await this.loadAndPlay(this.currentTrack, true, isOnline);
      return;
    }
    const targetVol = this.volume * this.sleepMultiplier;
    if (this.activeBackend === 'youtube') {
      if (this.smoothFadeEnabled) {
        this.applyEffectiveVolume(0.1);
        youtubePlayerService.play();
        this.rampVolume(0.1, targetVol, 260);
      } else {
        this.applyEffectiveVolume(targetVol);
        youtubePlayerService.play();
      }
      return;
    }
    if (this.activeBackend === 'offline' && this.audio) {
      try {
        dspProcessor.attachAudioElement(this.audio);
        if (this.smoothFadeEnabled) {
          this.applyEffectiveVolume(0.05);
          await this.audio.play();
          this.rampVolume(0.05, targetVol, 260);
        } else {
          this.applyEffectiveVolume(targetVol);
          await this.audio.play();
        }
      } catch {
        // Playback blocked
      }
    }
  }

  pause() {
    const performPause = () => {
      if (this.activeBackend === 'youtube') {
        youtubePlayerService.pause();
      } else {
        this.audio?.pause();
      }
      this.applyEffectiveVolume(this.volume * this.sleepMultiplier);
    };

    if (this.smoothFadeEnabled) {
      this.rampVolume(this.volume * this.sleepMultiplier, 0.02, 180, performPause);
      return;
    }
    performPause();
  }

  seek(time: number) {
    if (this.isCrossfading) {
      this.isCrossfading = false;
      this.crossfadeTriggeredForSeq = -1;
      this.ignoreEndedForSeq = -1;
      this.incomingCrossfadeMs = 0;
      this.applyEffectiveVolume(this.volume * this.sleepMultiplier);
    }

    if (this.activeBackend === 'youtube') {
      const duration = youtubePlayerService.getDuration() || this.currentTrack?.duration || 0;
      const clamped = Math.max(0, duration > 0 ? Math.min(time, duration) : time);
      youtubePlayerService.seekTo(clamped);
      const isPlaying = youtubePlayerService.getPlayerState() === YT_STATE.PLAYING;
      audioClock.update({ currentTime: clamped, duration, isPlaying });
      updateMediaSessionPlaybackState(isPlaying, clamped, duration);
      return;
    }

    if (this.activeBackend === 'offline' && this.audio) {
      const rawDuration =
        Number.isFinite(this.audio.duration) && this.audio.duration > 0
          ? this.audio.duration
          : this.currentTrack?.duration || 0;
      const clamped = Math.max(0, rawDuration > 0 ? Math.min(time, rawDuration) : time);
      this.audio.currentTime = clamped;
      this.syncClockFromOffline();
    }
  }

  private startOfflineTickLoop() {
    this.stopTickLoops();
    const tick = () => {
      this.syncClockFromOffline();
      if (this.activeBackend === 'offline' && this.audio && !this.audio.paused) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private startYouTubeTickLoop() {
    this.stopTickLoops();
    // Clean interval strictly while playerState === PLAYING
    this.ytPollTimer = window.setInterval(() => {
      if (this.activeBackend !== 'youtube') {
        this.stopTickLoops();
        return;
      }
      const state = youtubePlayerService.getPlayerState();
      if (state !== YT_STATE.PLAYING) {
        this.stopTickLoops();
        return;
      }
      this.syncClockFromYouTube(true);
    }, 100);
  }

  private stopTickLoops() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.ytPollTimer !== null) {
      clearInterval(this.ytPollTimer);
      this.ytPollTimer = null;
    }
  }

  private applySponsorSkip(currentTime: number, duration: number, isPlaying: boolean): number {
    if (this.sponsorBlockEnabled && isPlaying && this.sponsorSegments.length > 0) {
      const hit = findActiveSponsorSegment(currentTime, this.sponsorSegments, this.skippedIds);
      if (hit) {
        this.skippedIds.add(hit.UUID);
        const target = Math.min(hit.segment[1], duration > 0 ? duration - 0.1 : hit.segment[1]);
        if (this.activeBackend === 'youtube') {
          youtubePlayerService.seekTo(target);
        } else if (this.audio) {
          this.audio.currentTime = target;
        }
        this.callbacks?.onSponsorSkipped(formatSponsorCategory(hit.category));
        return target;
      }
    }
    return currentTime;
  }

  private checkCrossfade(currentTime: number, duration: number, isPlaying: boolean) {
    const decision = evaluateCrossfadeTrigger({
      isPlaying,
      currentTime,
      duration,
      crossfadeSeconds: this.crossfadeSeconds,
      alreadyTriggered: this.isCrossfading || this.crossfadeTriggeredForSeq === this.loadSeq,
    });
    if (!decision.shouldTrigger) return;

    const seq = this.loadSeq;
    this.isCrossfading = true;
    this.crossfadeTriggeredForSeq = seq;
    this.ignoreEndedForSeq = seq;
    this.incomingCrossfadeMs = decision.fadeInMs;

    this.rampVolume(
      this.volume * this.sleepMultiplier,
      0,
      decision.fadeOutMs,
      () => {
        if (this.loadSeq === seq && this.isCrossfading) {
          this.isCrossfading = false;
          this.callbacks?.onCrossfadeNext?.();
        }
      },
      true
    );
  }

  private syncClockFromYouTube(isPlaying: boolean) {
    const rawTime = youtubePlayerService.getCurrentTime();
    const rawDur = youtubePlayerService.getDuration();
    const duration = rawDur > 0 ? rawDur : this.currentTrack?.duration || 0;
    const currentTime = this.applySponsorSkip(rawTime, duration, isPlaying);
    this.checkCrossfade(currentTime, duration, isPlaying);
    audioClock.update({ currentTime, duration, isPlaying });
    updateMediaSessionPlaybackState(isPlaying, currentTime, duration);
  }

  private syncClockFromOffline() {
    if (!this.audio) return;
    const rawTime = this.audio.currentTime || 0;
    const duration =
      Number.isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : this.currentTrack?.duration || 0;
    const isPlaying = !this.audio.paused && !this.audio.ended;
    const currentTime = this.applySponsorSkip(rawTime, duration, isPlaying);
    this.checkCrossfade(currentTime, duration, isPlaying);

    audioClock.update({ currentTime, duration, isPlaying });
    updateMediaSessionPlaybackState(isPlaying, currentTime, duration);
  }
}

export const audioEngine = new AudioEngine();
