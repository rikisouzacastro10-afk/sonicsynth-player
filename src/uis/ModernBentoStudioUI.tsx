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

export default function ModernBentoStudioUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const offlineTracks = useAppStore((s) => s.offlineTracks);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  const cardClass = isDark
    ? 'bg-[#161920] border-zinc-800'
    : 'bg-white border-zinc-200 shadow-sm';
  const pillBtnClass = isDark
    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900';

  return (
    <div
      data-ui-id="modern-bento-studio"
      className={`min-h-screen w-full p-4 sm:p-6 pb-28 sm:pb-28 flex flex-col gap-4 transition-colors ${
        isDark ? 'bg-[#0F1115] text-zinc-100' : 'bg-[#EFF2F7] text-zinc-900'
      }`}
    >
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 flex-1">
        {/* Tile 1: Brand + Studio Status Telemetry */}
        <div className={`md:col-span-12 rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${cardClass}`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-sky-400 shadow-[0_0_8px_#38bdf8]' : 'bg-zinc-500'}`} />
            <span className="font-display font-bold text-lg">Bento Studio</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono-tech">
            <span className={`px-2.5 py-1 rounded-lg ${isDark ? 'bg-zinc-800 text-sky-400' : 'bg-sky-50 text-sky-700'}`}>
              QUEUE: {queue.length}
            </span>
            <span className={`px-2.5 py-1 rounded-lg ${isDark ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              OFFLINE: {offlineTracks.length}
            </span>
          </div>
        </div>

        {/* Tile 2: Hero Cover Tile */}
        <div className={`md:col-span-4 rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardClass}`}>
          <div className="relative">
            <ArtworkAura
              isPlaying={isPlaying}
              gradientClass="from-sky-500/40 via-cyan-400/20 to-indigo-500/40"
              roundedClass="rounded-2xl"
            />
            <div className={`relative aspect-square rounded-xl overflow-hidden border ${isDark ? 'border-white/15' : 'border-zinc-200'}`}>
              <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <MarqueeText
                text={currentTrack?.title || 'Carregando...'}
                isPlaying={isPlaying}
                className="font-display text-lg font-bold"
              />
              <p className="text-xs opacity-65 truncate">
                {currentTrack?.artist || 'Bento Audio Engine'}
              </p>
            </div>
            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>
        </div>

        {/* Tile 3: Transport & Spectrum Tile */}
        <div className={`md:col-span-4 rounded-2xl border p-5 flex flex-col justify-between gap-4 ${cardClass}`}>
          <div className="text-xs font-mono-tech text-sky-500 flex items-center justify-between">
            <span>TRANSPORT & SPECTRUM</span>
            <span className="text-[10px] opacity-70">{currentTrack?.source?.toUpperCase() || 'LIVE'}</span>
          </div>
          <AnimatedEqBars isPlaying={isPlaying} bars={16} barClass="bg-sky-500" heightClass="h-24" />
          <LedPeakMeter isPlaying={isPlaying} label="BUS" isDark={isDark} />
          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
            barFillClass="bg-sky-500"
            textClass={isDark ? 'text-zinc-400' : 'text-zinc-600'}
          />
          <div className="flex items-center justify-center gap-4">
            <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-12 h-12 rounded-xl flex items-center justify-center ${pillBtnClass}`}>
              <SkipBack className="w-5 h-5" />
            </button>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-16 h-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 flex items-center justify-center font-bold">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-12 h-12 rounded-xl flex items-center justify-center ${pillBtnClass}`}>
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tile 4: Synced Lyrics Tile */}
        <div className={`md:col-span-4 rounded-2xl border p-5 flex flex-col h-[390px] ${cardClass}`}>
          <div className="text-xs font-mono-tech text-sky-500 mb-3 flex justify-between">
            <span>LRCLIB SYNC</span>
            <span className="opacity-65">VOCAL TRACK</span>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            <LyricsPanel variant={isDark ? 'dark' : 'light'} />
          </div>
        </div>

        {/* Tile 5: Full-Width Horizontal Queue Strip */}
        <div className={`md:col-span-12 rounded-2xl border p-4 ${cardClass}`}>
          <div className="text-xs font-mono-tech opacity-65 mb-3">FILA RÁPIDA ({queue.length})</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {queue.slice(0, 8).map((t) => {
              const active = currentTrack?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
                    active
                      ? 'border-sky-500 bg-sky-500/10'
                      : isDark
                        ? 'border-zinc-800 hover:border-zinc-600'
                        : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <button type="button" onClick={() => void playTrack(t, queue)} className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <TrackArtwork src={t.artwork} alt={t.title} />
                    </div>
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
        </div>
      </div>

      <ThemedDock
        uiId="modern-bento-studio"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
