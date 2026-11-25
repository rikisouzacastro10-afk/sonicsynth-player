import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernCyberSamplerUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  const padColors = [
    'bg-rose-400',
    'bg-sky-400',
    'bg-amber-400',
    'bg-emerald-400',
    'bg-violet-400',
    'bg-orange-400',
    'bg-teal-400',
    'bg-pink-400',
  ];

  return (
    <div
      data-ui-id="modern-cyber-sampler"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col items-center justify-center font-mono-tech transition-colors ${
        isDark ? 'bg-[#121316] text-zinc-100' : 'bg-[#D8D8DC] text-zinc-900'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)'
          : 'radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    >
      {/* Hardware Shell */}
      <div
        className={`w-full max-w-5xl rounded-3xl border-2 shadow-2xl p-5 sm:p-7 space-y-5 relative ${
          isDark ? 'bg-[#1D1E22] border-zinc-700' : 'bg-[#EAEAEF] border-zinc-400'
        }`}
      >
        {/* Corner Field Screws */}
        <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-zinc-500/70" aria-hidden="true" />
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-500/70" aria-hidden="true" />
        <span className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-zinc-500/70" aria-hidden="true" />
        <span className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-zinc-500/70" aria-hidden="true" />

        {/* Top Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-zinc-500'}`} aria-hidden="true" />
            <span className="font-bold text-sm tracking-tight">OP-SAMPLER FIELD UNIT</span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold">SEQ 120 BPM</span>
            <span className="opacity-65">8-PAD BANK</span>
          </div>
        </div>

        {/* High-Contrast OLED Screen + Lyrics Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 rounded-2xl bg-zinc-950 text-white p-5 border-2 border-zinc-700 flex flex-col justify-between gap-3.5">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass="from-rose-500/45 via-amber-400/20 to-sky-400/35"
                  roundedClass="rounded-xl"
                />
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-700">
                  <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Track'} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-rose-400">
                  CH-01 · {currentTrack?.source?.toUpperCase() || 'AUDIO ENGINE'}
                </div>
                <MarqueeText
                  text={currentTrack?.title || 'EMPTY PAD'}
                  isPlaying={isPlaying}
                  className="text-lg font-bold"
                />
                <div className="text-xs text-zinc-400 truncate">
                  {currentTrack?.artist || 'Select a sample'}
                </div>
              </div>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>

            <AnimatedEqBars isPlaying={isPlaying} bars={20} barClass="bg-rose-400" heightClass="h-12" />
            <LedPeakMeter isPlaying={isPlaying} label="OLED" isDark />

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass="bg-zinc-800"
              barFillClass="bg-rose-400"
              textClass="text-zinc-400"
            />
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-zinc-950 text-white p-4 border-2 border-zinc-700 h-64 flex flex-col">
            <div className="text-[11px] text-sky-400 mb-2 flex justify-between">
              <span>SYNCED LYRICS TAPE</span>
              <span className="opacity-65">CH-02</span>
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll">
              <LyricsPanel variant="dark" />
            </div>
          </div>
        </div>

        {/* Tactile Mechanical Key Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {queue.slice(0, 8).map((track, idx) => {
            const active = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => void playTrack(track, queue)}
                className={`p-3 rounded-xl border-2 text-left transition-transform active:translate-y-0.5 flex flex-col justify-between h-24 ${
                  active
                    ? 'bg-rose-500 text-white border-rose-600 shadow-inner'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-[0_4px_0_#09090b]'
                      : 'bg-white text-zinc-900 border-zinc-300 shadow-[0_4px_0_#a1a1aa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-3 h-3 rounded-full ${active ? 'bg-white' : padColors[idx % padColors.length]}`} />
                  <span className="text-[10px] opacity-70 tabular-nums">P{idx + 1}</span>
                </div>
                <div>
                  <div className="text-xs font-bold truncate">{track.title}</div>
                  <div className="text-[10px] opacity-75 truncate">{track.artist}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mechanical Transport Keys */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => void prevTrack()}
            aria-label="Anterior"
            className={`h-12 px-6 rounded-xl border active:translate-y-0.5 flex items-center justify-center ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-[0_3px_0_#09090b]'
                : 'bg-white border-zinc-300 text-zinc-900 shadow-[0_3px_0_#a1a1aa]'
            }`}
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            className="h-12 px-10 rounded-xl bg-rose-500 text-white border border-rose-600 shadow-[0_3px_0_#be123c] active:translate-y-0.5 flex items-center justify-center gap-2 font-bold"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
          </button>
          <button
            type="button"
            onClick={() => void nextTrack()}
            aria-label="Próxima"
            className={`h-12 px-6 rounded-xl border active:translate-y-0.5 flex items-center justify-center ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-[0_3px_0_#09090b]'
                : 'bg-white border-zinc-300 text-zinc-900 shadow-[0_3px_0_#a1a1aa]'
            }`}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      <ThemedDock
        uiId="modern-cyber-sampler"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
