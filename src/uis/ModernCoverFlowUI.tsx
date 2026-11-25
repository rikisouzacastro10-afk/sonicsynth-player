import { useState } from 'react';
import { Mic2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernCoverFlowUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const queueIndex = useAppStore((s) => s.queueIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [showLyrics, setShowLyrics] = useState(false);

  const btnBg = isDark
    ? 'bg-white/10 hover:bg-white/15 text-white'
    : 'bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 shadow-xs';

  return (
    <div
      data-ui-id="modern-spatial-vinyl-shelf"
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 pb-28 sm:pb-28 overflow-hidden transition-colors ${
        isDark ? 'bg-[#121016] text-white' : 'bg-[#F5F2F7] text-zinc-900'
      }`}
    >
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
        <span className="font-display text-lg font-bold tracking-tight text-rose-500">CoverFlow 3D</span>
        <span className="text-[11px] font-mono-tech opacity-65">
          FAIXA {queueIndex + 1} / {Math.max(1, queue.length)}
        </span>
      </header>

      {/* 3D Perspective Shelf Stage */}
      <main className="my-auto py-6 flex flex-col items-center justify-center gap-7">
        <div
          className="relative w-full max-w-4xl h-64 sm:h-72 flex items-center justify-center"
          style={{ perspective: '1100px' }}
        >
          {queue.slice(0, 9).map((track, idx) => {
            const offset = idx - queueIndex;
            if (Math.abs(offset) > 3) return null;

            const isCenter = offset === 0;
            const translateX = offset * 145;
            const translateZ = isCenter ? 70 : -Math.abs(offset) * 85;
            const rotateY = offset === 0 ? 0 : offset < 0 ? 38 : -38;
            const opacity = isCenter ? 1 : Math.max(0.35, 1 - Math.abs(offset) * 0.25);

            return (
              <button
                key={track.id}
                type="button"
                onClick={() => void playTrack(track, queue)}
                aria-label={`Tocar ${track.title}`}
                className={`absolute w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 ease-out ${
                  isDark ? 'border-white/25' : 'border-zinc-300'
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  zIndex: 20 - Math.abs(offset),
                  opacity,
                }}
              >
                {isCenter && (
                  <ArtworkAura
                    isPlaying={isPlaying}
                    gradientClass="from-rose-500/45 via-fuchsia-500/20 to-amber-400/35"
                    roundedClass="rounded-2xl"
                  />
                )}
                <TrackArtwork src={track.artwork} alt={track.title} />
              </button>
            );
          })}
        </div>

        {/* Center Stage Metadata + Controls */}
        <div
          className={`w-full max-w-xl border rounded-2xl p-5 space-y-4 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <MarqueeText
                text={currentTrack?.title || 'Carregando estante...'}
                isPlaying={isPlaying}
                className="font-display text-xl font-bold"
              />
              <p className={`text-xs truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'CoverFlow 3D'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 min-h-[38px] ${
                  showLyrics ? 'bg-rose-500 text-white' : btnBg
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" /> Letras
              </button>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>

          <AnimatedEqBars isPlaying={isPlaying} bars={22} barClass="bg-rose-500/80" heightClass="h-4" />

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-white/10' : 'bg-zinc-200'}
            barFillClass="bg-rose-500"
            textClass={isDark ? 'text-zinc-400' : 'text-zinc-600'}
          />

          <div className="flex items-center justify-center gap-5">
            <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-12 h-12 rounded-full flex items-center justify-center ${btnBg}`}>
              <SkipBack className="w-5 h-5" />
            </button>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-lg">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-12 h-12 rounded-full flex items-center justify-center ${btnBg}`}>
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {showLyrics && (
            <div className={`max-h-48 overflow-y-auto border-t pt-3 thin-scroll ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          )}
        </div>
      </main>

      <ThemedDock
        uiId="modern-spatial-vinyl-shelf"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
