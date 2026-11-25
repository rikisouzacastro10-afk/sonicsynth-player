import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernNordicCatalogUI() {
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

  const cardSurface = isDark
    ? 'bg-[#141817] border-zinc-800'
    : 'bg-white border-zinc-200';

  return (
    <div
      data-ui-id="modern-nordic-catalog"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col gap-6 transition-colors ${
        isDark ? 'bg-[#0D100F] text-stone-100' : 'bg-[#F7F8F7] text-stone-900'
      }`}
    >
      {/* Clean Nordic Architectural Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4 border-b border-current/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-6 bg-teal-700 dark:bg-teal-400 rounded-sm" aria-hidden="true" />
          <span className="font-display text-lg font-semibold tracking-tight">Nordic Archive Index</span>
        </div>
        <span className="text-[11px] font-mono-tech uppercase opacity-60">
          ARCHIVAL INDEX · {queue.length} ITEMS
        </span>
      </header>

      {/* Architectural Two-Column Catalog + Showcase */}
      <main className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Crisp Tabular Track Catalog (65%) */}
        <section className={`lg:col-span-7 rounded-2xl border overflow-hidden ${cardSurface}`}>
          <div className="px-5 py-3.5 border-b border-current/10 flex items-center justify-between">
            <span className="text-xs font-mono-tech uppercase tracking-wider opacity-65">
              Catálogo da Sessão ({queue.length})
            </span>
            <span className="text-xs font-mono-tech opacity-50">SELEÇÃO ATUAL</span>
          </div>

          <div className="divide-y divide-current/10 max-h-[540px] overflow-y-auto thin-scroll">
            {queue.map((t, idx) => {
              const active = currentTrack?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`px-5 py-3 flex items-center justify-between gap-3 transition-colors ${
                    active ? 'bg-teal-700/10' : 'hover:bg-current/5'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void playTrack(t, queue)}
                    className="flex items-center gap-3.5 flex-1 min-w-0 text-left"
                  >
                    <span className={`text-xs font-mono-tech w-6 tabular-nums ${active ? 'text-teal-600 dark:text-teal-400 font-bold' : 'opacity-45'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-current/10">
                      <TrackArtwork src={t.artwork} alt={t.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${active ? 'text-teal-700 dark:text-teal-300 font-semibold' : ''}`}>
                        {t.title}
                      </div>
                      <div className="text-xs opacity-60 truncate">
                        {t.artist} · {t.album}
                      </div>
                    </div>
                    <span className="text-xs font-mono-tech opacity-55 tabular-nums hidden sm:block">
                      {formatDuration(t.duration)}
                    </span>
                  </button>
                  <DownloadButton track={t} compact />
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Quiet Gallery Exhibit & Lyrics (35%) */}
        <aside className={`lg:col-span-5 rounded-2xl border p-6 space-y-5 ${cardSurface}`}>
          <div className="relative max-w-[260px] mx-auto">
            <ArtworkAura
              isPlaying={isPlaying}
              gradientClass="from-teal-500/35 via-emerald-400/15 to-cyan-500/30"
              roundedClass="rounded-2xl"
            />
            <div className="relative aspect-square rounded-xl overflow-hidden border border-current/15 shadow-sm">
              <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Obra'} />
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-mono-tech uppercase tracking-widest text-teal-600 dark:text-teal-400">
                {currentTrack?.source?.toUpperCase() || 'ARQUIVO'}
              </div>
              <MarqueeText
                text={currentTrack?.title || 'Selecione uma faixa'}
                isPlaying={isPlaying}
                className="font-display text-xl font-semibold mt-0.5"
              />
              <p className="text-xs opacity-65 truncate">
                {currentTrack?.artist || 'Nordic Archive'}
              </p>
            </div>
            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>

          <AnimatedEqBars isPlaying={isPlaying} bars={18} barClass="bg-teal-600 dark:bg-teal-400" heightClass="h-4" />

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-zinc-800' : 'bg-stone-200'}
            barFillClass="bg-teal-600"
            textClass={isDark ? 'text-stone-400' : 'text-stone-600'}
          />

          <div className="flex items-center justify-center gap-4">
            <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-11 h-11 rounded-xl border flex items-center justify-center ${cardSurface}`}>
              <SkipBack className="w-4 h-4" />
            </button>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-14 h-12 rounded-xl bg-teal-700 hover:bg-teal-600 text-white flex items-center justify-center shadow-sm">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-11 h-11 rounded-xl border flex items-center justify-center ${cardSurface}`}>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="border-t border-current/10 pt-4">
            <div className="text-xs font-mono-tech uppercase tracking-wider opacity-60 mb-2">Letras</div>
            <div className="max-h-44 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </aside>
      </main>

      <ThemedDock
        uiId="modern-nordic-catalog"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
