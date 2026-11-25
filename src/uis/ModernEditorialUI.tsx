import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';

export default function ModernEditorialUI() {
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  return (
    <div
      data-ui-id="modern-editorial-broadsheet"
      className={`min-h-screen w-full flex flex-col pb-28 transition-colors ${
        isDark ? 'bg-[#141210] text-[#F3EFE6]' : 'bg-[#F9F7F2] text-zinc-900'
      }`}
    >
      {/* Broadsheet Masthead */}
      <header
        className={`border-b-2 px-6 py-4 max-w-6xl w-full mx-auto flex flex-wrap items-baseline justify-between gap-4 ${
          isDark ? 'border-stone-600' : 'border-zinc-900'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveSection('home')}
          className="font-serif-editorial text-2xl sm:text-3xl font-bold tracking-tight"
        >
          The Sonic Gazette
        </button>

        <div className="flex items-center gap-3 text-[11px] font-mono-tech uppercase tracking-widest opacity-75">
          <span>EDIÇÃO Nº {String(queue.length).padStart(2, '0')}</span>
          <span>·</span>
          <span>{isPlaying ? 'NO AR AGORA' : 'PAUSADO'}</span>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Lead Editorial Column */}
            <div className={`lg:col-span-5 lg:border-r lg:pr-8 space-y-5 ${isDark ? 'lg:border-stone-700' : 'lg:border-zinc-300'}`}>
              <div className={`text-xs uppercase tracking-widest font-semibold flex items-center justify-between ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                <span>Em Destaque · {currentTrack?.genre || 'Audição'}</span>
                <span className="font-mono-tech text-[10px] opacity-70">
                  {currentTrack?.source?.toUpperCase() || 'AO VIVO'}
                </span>
              </div>
              <MarqueeText
                text={currentTrack?.title || 'Carregando edição sonora...'}
                isPlaying={isPlaying}
                className="font-serif-editorial text-3xl sm:text-4xl font-bold leading-tight"
              />
              <p className={`font-serif-editorial italic text-lg truncate ${isDark ? 'text-stone-400' : 'text-zinc-600'}`}>
                {currentTrack ? `por ${currentTrack.artist} — ${currentTrack.album}` : 'Conectando às paradas globais'}
              </p>

              <div className="relative">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass={isDark ? 'from-red-500/35 via-amber-500/20 to-stone-500/30' : 'from-red-600/25 via-amber-500/15 to-zinc-400/20'}
                  roundedClass="rounded-none"
                />
                <div className={`relative aspect-square border overflow-hidden ${isDark ? 'border-stone-600' : 'border-zinc-900'}`}>
                  <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                </div>
              </div>

              <AnimatedEqBars
                isPlaying={isPlaying}
                bars={22}
                barClass={isDark ? 'bg-red-500/80' : 'bg-red-700/80'}
                heightClass="h-4"
              />

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                variant="eink"
                barBgClass={isDark ? 'bg-stone-800' : 'bg-zinc-300'}
                barFillClass={isDark ? 'bg-red-500' : 'bg-red-700'}
                textClass={isDark ? 'text-stone-400' : 'text-zinc-600'}
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void prevTrack()}
                    aria-label="Anterior"
                    className={`w-11 h-11 border flex items-center justify-center ${
                      isDark ? 'border-stone-600 hover:bg-stone-800' : 'border-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                    className="px-6 h-11 bg-red-700 text-white font-semibold text-sm inline-flex items-center gap-2 hover:bg-red-600"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying ? 'Pausar' : 'Ouvir'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void nextTrack()}
                    aria-label="Próxima"
                    className={`w-11 h-11 border flex items-center justify-center ${
                      isDark ? 'border-stone-600 hover:bg-stone-800' : 'border-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
                {currentTrack && <DownloadButton track={currentTrack} />}
              </div>
            </div>

            {/* Middle: Libretti / Synced Lyrics */}
            <div className={`lg:col-span-4 lg:border-r lg:pr-8 ${isDark ? 'lg:border-stone-700' : 'lg:border-zinc-300'}`}>
              <h2 className={`font-serif-editorial text-lg font-bold border-b pb-2 mb-4 ${isDark ? 'border-stone-600' : 'border-zinc-900'}`}>
                Libreto & Letra Sincronizada
              </h2>
              <div className="max-h-[460px] overflow-y-auto font-serif-editorial thin-scroll">
                <LyricsPanel variant={isDark ? 'dark' : 'light'} />
              </div>
            </div>

            {/* Right: Numbered Editorial Index */}
            <div className="lg:col-span-3">
              <h2 className={`font-serif-editorial text-lg font-bold border-b pb-2 mb-4 ${isDark ? 'border-stone-600' : 'border-zinc-900'}`}>
                Índice da Sessão
              </h2>
              <div className={`divide-y ${isDark ? 'divide-stone-800' : 'divide-zinc-300'}`}>
                {queue.map((t, i) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void playTrack(t, queue)}
                      className={`text-left flex-1 min-w-0 ${
                        currentTrack?.id === t.id
                          ? 'text-red-500 font-bold'
                          : isDark
                            ? 'hover:text-red-400'
                            : 'hover:text-red-700'
                      }`}
                    >
                      <div className="text-xs font-mono-tech opacity-60 tabular-nums">
                        {String(i + 1).padStart(2, '0')}.
                      </div>
                      <div className="text-sm font-serif-editorial truncate">{t.title}</div>
                      <div className="text-xs opacity-60 truncate">{t.artist}</div>
                    </button>
                    <DownloadButton track={t} compact />
                  </div>
                ))}
              </div>
            </div>
          </div>
      </main>

      <ThemedDock
        uiId="modern-editorial-broadsheet"
        activeTab={activeSection}
        onSelectTab={setActiveSection}
      />
    </div>
  );
}
