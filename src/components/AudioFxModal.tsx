import { useEffect } from 'react';
import {
  AudioWaveform,
  CheckCircle2,
  Download,
  Headphones,
  Play,
  Sliders,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';
import { useAppStore } from '../stores/useAppStore';
import {
  EQ_BAND_LABELS,
  EQ_PRESETS,
  type EqPresetId,
} from '../utils/settingsAndFx';

export function AudioFxModal() {
  const isOpen = useAppStore((s) => s.isAudioFxOpen);
  const setOpen = useAppStore((s) => s.setAudioFxOpen);
  const themeMode = useAppStore((s) => s.themeMode);
  const fx = useAppStore((s) => s.preferences.audioFx);
  const updateAudioFx = useAppStore((s) => s.updateAudioFx);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const offlineTracks = useAppStore((s) => s.offlineTracks);
  const downloadQueue = useAppStore((s) => s.downloadQueue);
  const downloadTrack = useAppStore((s) => s.downloadTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10';
  const isCurrentOfflineSaved = currentTrack
    ? offlineTracks.some((r) => r.id === currentTrack.id)
    : false;
  const activeBackend = audioEngine.getActiveBackend();
  const currentDownloadTask = currentTrack ? downloadQueue[currentTrack.id] : undefined;
  const isDownloadingNow =
    currentDownloadTask?.status === 'downloading' || currentDownloadTask?.status === 'queued';

  const applyPreset = (presetId: EqPresetId) => {
    const preset = EQ_PRESETS[presetId];
    updateAudioFx({
      eqPreset: presetId,
      eqBands: [...preset.bands],
    });
  };

  const handleBandChange = (idx: number, val: number) => {
    const nextBands: [number, number, number, number, number] = [...fx.eqBands];
    nextBands[idx] = val;
    updateAudioFx({ eqBands: nextBands });
  };

  const toggleEffectMix = (key: 'reverbMix' | 'delayMix') => {
    const cur = fx[key];
    updateAudioFx({ [key]: cur > 0 ? 0 : 0.55 });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Audio FX Studio"
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        data-lg-surface="true"
        className={`w-full max-w-2xl max-h-[88vh] rounded-t-2xl sm:rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-stone-50 border-zinc-300 text-zinc-900'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold">Audio FX Studio (DSP)</h2>
              <p className="text-[11px] opacity-70">
                Equalizador 5 bandas, Áudio 8D espacial, Reverb, Delay e Normalizador
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateAudioFx({ enabled: !fx.enabled })}
              aria-pressed={fx.enabled}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] ${
                fx.enabled ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-200'
              }`}
            >
              {fx.enabled ? 'DSP Ativo' : 'Bypass'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar Audio FX Studio"
              className="min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center hover:bg-current/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 thin-scroll">
          {/* DSP Offline / Live Status Notice + Quick Action */}
          <div className="p-3 rounded-xl border border-indigo-500/35 bg-indigo-500/10 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  activeBackend === 'offline' ? 'text-emerald-400' : 'text-indigo-400'
                }`}
              />
              <div className="min-w-0">
                <div className="font-semibold">
                  {activeBackend === 'offline'
                    ? 'DSP Web Audio API ativo em tempo real (Faixa Offline)'
                    : 'Processamento DSP atua em faixas baixadas (áudio local)'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {activeBackend === 'offline'
                    ? 'Reverb, Delay, Equalizador 5 bandas e 8D aplicados diretamente no fluxo de áudio.'
                    : 'No YouTube IFrame o navegador isola o áudio; baixe ou toque a versão offline para ouvir os efeitos.'}
                </div>
              </div>
            </div>

            {currentTrack && activeBackend !== 'offline' && (
              isCurrentOfflineSaved ? (
                <button
                  type="button"
                  onClick={() => void playTrack(currentTrack)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1.5 shrink-0 min-h-[34px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tocar Baixada com FX</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isDownloadingNow}
                  onClick={() => void downloadTrack(currentTrack)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold inline-flex items-center gap-1.5 shrink-0 min-h-[34px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isDownloadingNow
                      ? `Baixando ${currentDownloadTask?.progress || 0}%`
                      : 'Baixar para usar FX'}
                  </span>
                </button>
              )
            )}
          </div>

          {/* EQ Presets */}
          <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Presets de Equalização
              </span>
              <span className="text-[11px] font-mono-tech text-indigo-400">
                {EQ_PRESETS[fx.eqPreset]?.label || 'Personalizado'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EQ_PRESETS) as EqPresetId[]).map((pid) => {
                const active = fx.eqPreset === pid;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => applyPreset(pid)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[34px] transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : isDark
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    {EQ_PRESETS[pid].label}
                  </button>
                );
              })}
            </div>

            {/* 5-Band Sliders */}
            <div className="grid grid-cols-5 gap-3 pt-2">
              {EQ_BAND_LABELS.map((label, idx) => {
                const val = fx.eqBands[idx] ?? 0;
                return (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <span className="text-[11px] font-mono-tech font-bold">
                      {val > 0 ? `+${val}` : val}dB
                    </span>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={val}
                      aria-label={`Banda ${label}`}
                      onChange={(e) => handleBandChange(idx, Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono-tech opacity-65">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8D Spatial Audio */}
          <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-sm font-semibold">Áudio 8D (Auto-Pan Espacial)</div>
                  <div className="text-xs opacity-70">
                    Oscilador estéreo LFO girando o palco sonoro ao redor dos fones
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateAudioFx({ spatial8dEnabled: !fx.spatial8dEnabled })}
                aria-pressed={fx.spatial8dEnabled}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold min-h-[36px] ${
                  fx.spatial8dEnabled ? 'bg-sky-500 text-zinc-950' : 'bg-zinc-700 text-zinc-200'
                }`}
              >
                {fx.spatial8dEnabled ? '8D Ligado' : 'Desligado'}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="opacity-70 w-24 shrink-0">Velocidade 8D</span>
              <input
                type="range"
                min={0.05}
                max={0.6}
                step={0.01}
                value={fx.spatial8dSpeed}
                aria-label="Velocidade do áudio 8D"
                onChange={(e) => updateAudioFx({ spatial8dSpeed: Number(e.target.value) })}
                className="flex-1 accent-sky-500"
              />
              <span className="font-mono-tech w-14 text-right">{fx.spatial8dSpeed.toFixed(2)} Hz</span>
            </div>
          </div>

          {/* Reverb, Delay & Normalizer */}
          <div className={`p-4 rounded-xl border space-y-3.5 ${cardBg}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ambiência &amp; Dinâmica (Reverb Sala / Eco Delay)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => toggleEffectMix('reverbMix')}
                aria-pressed={fx.reverbMix > 0}
                aria-label="Alternar Reverb Sala"
                className={`px-2.5 py-1 rounded-lg font-bold min-w-[54px] min-h-[32px] shrink-0 transition-colors ${
                  fx.reverbMix > 0
                    ? 'bg-indigo-600 text-white'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-white border border-zinc-300 text-zinc-800'
                }`}
              >
                {fx.reverbMix > 0 ? 'ON' : 'OFF'}
              </button>
              <span className="opacity-85 w-24 shrink-0 font-medium">Reverb Sala</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={fx.reverbMix}
                aria-label="Mix de Reverb"
                onChange={(e) => updateAudioFx({ reverbMix: Number(e.target.value) })}
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono-tech font-bold w-11 text-right tabular-nums">
                {Math.round(fx.reverbMix * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => toggleEffectMix('delayMix')}
                aria-pressed={fx.delayMix > 0}
                aria-label="Alternar Eco Delay"
                className={`px-2.5 py-1 rounded-lg font-bold min-w-[54px] min-h-[32px] shrink-0 transition-colors ${
                  fx.delayMix > 0
                    ? 'bg-indigo-600 text-white'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-white border border-zinc-300 text-zinc-800'
                }`}
              >
                {fx.delayMix > 0 ? 'ON' : 'OFF'}
              </button>
              <span className="opacity-85 w-24 shrink-0 font-medium">Eco / Delay</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={fx.delayMix}
                aria-label="Mix de Delay"
                onChange={(e) => updateAudioFx({ delayMix: Number(e.target.value) })}
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono-tech font-bold w-11 text-right tabular-nums">
                {Math.round(fx.delayMix * 100)}%
              </span>
            </div>

            <div className="pt-2 border-t border-current/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <span>Normalizador de Volume</span>
                    <AudioWaveform className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <div className="text-xs opacity-70">
                    Compressor dinâmico para nivelar faixas baixas e altas
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateAudioFx({ normalizerEnabled: !fx.normalizerEnabled })}
                aria-pressed={fx.normalizerEnabled}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold min-h-[36px] ${
                  fx.normalizerEnabled ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-200'
                }`}
              >
                {fx.normalizerEnabled ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
