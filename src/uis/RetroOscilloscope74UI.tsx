import { useState } from 'react';
import { Activity, Mic2, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroOscilloscope74UI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [beamMode, setBeamMode] = useState<'WAVE' | 'XY'>('WAVE');
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-oscilloscope-tektronix-74"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 font-mono-tech transition-colors ${
        isDark ? 'bg-[#091215] text-teal-100' : 'bg-[#DAE4E7] text-slate-900'
      }`}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Lab Oscilloscope Tektronix Chassis */}
        <div
          className={`lg:col-span-7 rounded-2xl border-4 p-4 sm:p-5 flex flex-col justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-b from-[#1E2E35] to-[#132026] border-teal-700/60 shadow-2xl'
              : 'bg-gradient-to-b from-[#C6D5DB] to-[#AEBFC7] border-slate-500 shadow-xl'
          }`}
        >
          {/* Instrument Header */}
          <div className="flex items-center justify-between text-[10px] border-b border-current/20 pb-2">
            <span className="flex items-center gap-1.5 font-bold tracking-widest">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              TEK-74 STORAGE OSCILLOSCOPE · 1974
            </span>
            <button
              type="button"
              onClick={() => setBeamMode((m) => (m === 'WAVE' ? 'XY' : 'WAVE'))}
              className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 font-bold border border-teal-400/40"
            >
              MODE: {beamMode}
            </button>
          </div>

          {/* Glowing Teal Phosphor Graticule Screen */}
          <div className="relative rounded-2xl bg-[#021411] border-4 border-zinc-800 p-4 overflow-hidden shadow-[inset_0_0_40px_rgba(20,184,166,0.22)] space-y-3">
            {/* Calibration Etched Grid */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(45,212,191,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,212,191,0.14)_1px,transparent_1px)] bg-[size:28px_28px]"
            />

            {/* Animated SVG Sine / Lissajous Beam */}
            <div className="relative z-10 h-20 rounded-xl border border-teal-500/30 bg-black/35 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 320 72" className="w-full h-full" aria-hidden="true">
                <path
                  d={
                    beamMode === 'WAVE'
                      ? 'M 0 36 Q 20 8 40 36 T 80 36 T 120 36 T 160 36 T 200 36 T 240 36 T 280 36 T 320 36'
                      : 'M 40 36 C 80 6, 240 66, 280 36 C 240 6, 80 66, 40 36 Z'
                  }
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.4"
                  className={isPlaying ? 'anim-aura-pulse' : 'opacity-45'}
                />
              </svg>
              <span className="absolute top-1.5 left-2 text-[9px] text-teal-400">
                CH1: 500mV/DIV · TIME: 2ms
              </span>
              <span className="absolute top-1.5 right-2 text-[9px] text-teal-300">
                {isPlaying ? 'TRIG: AUTO' : 'HOLD'}
              </span>
            </div>

            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-teal-400/50 shrink-0">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Scope'} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <MarqueeText
                  text={currentTrack?.title || 'Calibrando feixe...'}
                  isPlaying={isPlaying}
                  className="text-sm font-bold text-teal-200"
                />
                <div className="text-xs text-teal-400/80 truncate">{currentTrack?.artist}</div>
                <AnimatedEqBars isPlaying={isPlaying} bars={16} barClass="bg-teal-400" heightClass="h-5" />
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <LedPeakMeter isPlaying={isPlaying} label="SIG" />
              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass="bg-teal-950"
                barFillClass="bg-teal-400"
                textClass="text-teal-300"
                compact
              />
            </div>
          </div>

          {/* Metallic Lab Rotary & Toggle Controls */}
          <div className="rounded-xl bg-black/25 border border-current/15 p-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Anterior"
                className="w-10 h-10 rounded bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-zinc-600 flex items-center justify-center"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="w-12 h-10 rounded bg-teal-400 hover:bg-teal-300 text-zinc-950 font-bold flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima"
                className="w-10 h-10 rounded bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-zinc-600 flex items-center justify-center"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                className={`h-10 px-3 rounded border text-xs font-bold inline-flex items-center gap-1 ${
                  showLyrics ? 'bg-teal-400 text-zinc-950 border-teal-200' : 'bg-zinc-800 text-teal-300 border-zinc-600'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>READOUT</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[180px]">
              <Volume2 className="w-4 h-4 text-teal-400 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume Osciloscópio"
                className="w-full accent-teal-400"
              />
            </div>

            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>
        </div>

        {/* Right: Waveform Catalog / Lyrics */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-5 flex flex-col max-h-[480px] ${
            isDark ? 'bg-[#0C181C] border-teal-800/50' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-teal-400">
              {showLyrics ? 'TELEMETRY LYRICS' : `SIGNAL BANK (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showLyrics ? 'Sinais' : 'Letras'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {showLyrics ? (
              <LyricsPanel variant="crt" />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                        active ? 'bg-teal-500/20 border border-teal-400/50' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <span className="text-[10px] font-bold text-teal-400 w-6">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{t.title}</div>
                          <div className="text-[11px] opacity-65 truncate">{t.artist}</div>
                        </div>
                      </button>
                      <DownloadButton track={t} compact />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ThemedDock
        uiId="retro-oscilloscope-tektronix-74"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
