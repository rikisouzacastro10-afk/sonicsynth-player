import { useState } from 'react';
import { Film, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernAmbientCinemaUI() {
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

  const barSurface = isDark ? 'bg-black text-amber-50' : 'bg-stone-200 text-stone-900';
  const frameSurface = isDark ? 'bg-[#121215] border-zinc-800' : 'bg-white border-stone-300 shadow-lg';

  return (
    <div
      data-ui-id="modern-ambient-cinema"
      className={`min-h-screen w-full pb-28 flex flex-col justify-between transition-colors ${
        isDark ? 'bg-[#09090B] text-amber-50' : 'bg-[#F3F0EA] text-stone-900'
      }`}
    >
      {/* Top Cinema Letterbox Bar */}
      <header className={`w-full px-5 py-3 border-b border-current/10 flex items-center justify-between gap-3 ${barSurface}`}>
        <div className="flex items-center gap-2.5">
          <Film className="w-4 h-4 text-amber-500" />
          <span className="font-mono-tech text-xs font-bold uppercase tracking-widest">
            CINEMA LETTERBOX · 21:9
          </span>
        </div>
        <span className="text-[10px] font-mono-tech opacity-75">
          DOLBY STEREO · {isPlaying ? 'PROJECTING' : 'PAUSED'}
        </span>
      </header>

      {/* Widescreen 21:9 Projection Frame */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex-1 flex flex-col justify-center gap-5">
        <div className={`rounded-2xl border p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center ${frameSurface}`}>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-center gap-5">
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-amber-500/40 via-orange-400/20 to-yellow-300/30"
                roundedClass="rounded-2xl"
              />
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden shadow-2xl border border-amber-500/35">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
              </div>
            </div>
            <div className="text-center sm:text-left lg:text-center min-w-0 w-full">
              <div className="text-[11px] font-mono-tech text-amber-500 uppercase tracking-widest">
                PROJEÇÃO · {currentTrack?.source?.toUpperCase() || 'SCORE'}
              </div>
              <MarqueeText
                text={currentTrack?.title || 'Carregando trilha...'}
                isPlaying={isPlaying}
                className="font-serif-editorial text-2xl sm:text-3xl font-bold mt-1"
              />
              <p className="text-sm opacity-70 truncate">
                {currentTrack?.artist || 'Cinema Widescreen'}
              </p>
              <div className="mt-3 flex justify-center sm:justify-start lg:justify-center">
                {currentTrack && <DownloadButton track={currentTrack} />}
              </div>
            </div>
          </div>

          {/* Subtitle-style Live Lyrics */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className={`rounded-xl border p-4 h-64 overflow-y-auto thin-scroll ${isDark ? 'bg-black/60 border-zinc-800' : 'bg-stone-100 border-stone-200'}`}>
              <LyricsPanel variant={isDark ? 'stage' : 'stage-light'} accentClass="text-amber-500" />
            </div>

            <AnimatedEqBars isPlaying={isPlaying} bars={24} barClass="bg-amber-500/80" heightClass="h-4" />

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass={isDark ? 'bg-zinc-800' : 'bg-stone-200'}
              barFillClass="bg-amber-500"
              textClass={isDark ? 'text-amber-200/80' : 'text-stone-600'}
            />

            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className="w-11 h-11 rounded-full border border-current/20 flex items-center justify-center hover:bg-amber-500/15">
                <SkipBack className="w-4 h-4" />
              </button>
              <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg">
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>
              <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className="w-11 h-11 rounded-full border border-current/20 flex items-center justify-center hover:bg-amber-500/15">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Filmstrip Queue */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono-tech uppercase tracking-widest opacity-65">
            Rolo de Cenas ({queue.length})
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 thin-scroll">
            {queue.slice(0, 12).map((t) => {
              const active = currentTrack?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`w-48 shrink-0 rounded-xl border p-2.5 flex items-center gap-2.5 transition-colors ${
                    active ? 'border-amber-500 bg-amber-500/15' : frameSurface
                  }`}
                >
                  <button type="button" onClick={() => void playTrack(t, queue)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <TrackArtwork src={t.artwork} alt={t.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{t.title}</div>
                      <div className="text-[10px] opacity-65 truncate">{t.artist}</div>
                    </div>
                  </button>
                  <DownloadButton track={t} compact />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <ThemedDock
        uiId="modern-ambient-cinema"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
