import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';

export default function ModernBrutalistZineUI() {
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

  const boxClass = isDark
    ? 'border-2 border-zinc-100 bg-zinc-900 text-zinc-100 shadow-[5px_5px_0px_#f4f4f5]'
    : 'border-2 border-zinc-950 bg-white text-zinc-950 shadow-[5px_5px_0px_#09090b]';

  const btnBorder = isDark ? 'border-2 border-zinc-100' : 'border-2 border-zinc-950';
  const inactiveTab = isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-950';

  return (
    <div
      data-ui-id="modern-brutalist-zine"
      className={`min-h-screen w-full p-4 sm:p-6 pb-28 sm:pb-28 flex flex-col gap-5 transition-colors ${
        isDark ? 'bg-[#09090B] text-zinc-100' : 'bg-[#F3EFE6] text-zinc-950'
      }`}
    >
      {/* Stark Hard-Border Header */}
      <header className={`max-w-6xl w-full mx-auto p-3 flex flex-wrap items-center justify-between gap-3 ${boxClass}`}>
        <button
          type="button"
          onClick={() => setActiveSection('home')}
          className="font-condensed font-black text-2xl uppercase tracking-tight"
        >
          ZINE/AUDIO
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono-tech font-bold uppercase">
          <span className="px-2 py-0.5 bg-[#FF4D00] text-white">ISSUE #35</span>
          <span>{isPlaying ? 'RAW PLAYBACK' : 'HOLD'}</span>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Poster Hero Block */}
            <div className={`lg:col-span-7 p-5 flex flex-col justify-between gap-5 ${boxClass}`}>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 relative">
                  <ArtworkAura
                    isPlaying={isPlaying}
                    gradientClass="from-[#FF4D00]/45 via-amber-400/25 to-rose-500/40"
                    roundedClass="rounded-none"
                  />
                  <div className={`relative aspect-square overflow-hidden ${btnBorder}`}>
                    <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                  </div>
                </div>
                <div className="sm:col-span-7 space-y-2 min-w-0">
                  <div className="text-xs font-mono-tech font-bold uppercase text-[#FF4D00]">
                    TOCANDO AGORA · {currentTrack?.source?.toUpperCase() || 'STREAM'}
                  </div>
                  <MarqueeText
                    text={currentTrack?.title || 'ZINE AUDIO'}
                    isPlaying={isPlaying}
                    className="font-condensed font-black text-3xl sm:text-4xl uppercase leading-none"
                  />
                  <p className={`text-sm font-bold uppercase truncate ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {currentTrack?.artist || 'Aguardando faixa'}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    {currentTrack && <DownloadButton track={currentTrack} />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <AnimatedEqBars isPlaying={isPlaying} bars={22} barClass="bg-[#FF4D00]" heightClass="h-6" />
                <LedPeakMeter isPlaying={isPlaying} label="GAIN" isDark={isDark} />
              </div>

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                variant="brutalist"
                barBgClass={isDark ? 'bg-zinc-800 border border-zinc-100' : 'bg-zinc-200 border border-zinc-950'}
                barFillClass="bg-[#FF4D00]"
                textClass={isDark ? 'text-zinc-100 font-bold' : 'text-zinc-900 font-bold'}
              />

              {/* Giant Brutalist Transport Blocks */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Anterior"
                  className={`h-14 ${btnBorder} ${inactiveTab} hover:opacity-90 font-condensed font-black uppercase flex items-center justify-center gap-2 ${
                    isDark ? 'shadow-[3px_3px_0px_#f4f4f5]' : 'shadow-[3px_3px_0px_#09090b]'
                  } active:translate-x-0.5 active:translate-y-0.5`}
                >
                  <SkipBack className="w-5 h-5 fill-current" /> PREV
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                  className={`h-14 ${btnBorder} bg-[#FF4D00] text-white font-condensed font-black uppercase flex items-center justify-center gap-2 ${
                    isDark ? 'shadow-[3px_3px_0px_#f4f4f5]' : 'shadow-[3px_3px_0px_#09090b]'
                  } active:translate-x-0.5 active:translate-y-0.5`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Próxima"
                  className={`h-14 ${btnBorder} ${inactiveTab} hover:opacity-90 font-condensed font-black uppercase flex items-center justify-center gap-2 ${
                    isDark ? 'shadow-[3px_3px_0px_#f4f4f5]' : 'shadow-[3px_3px_0px_#09090b]'
                  } active:translate-x-0.5 active:translate-y-0.5`}
                >
                  NEXT <SkipForward className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>

            {/* Right: Hard-Grid Queue + Lyrics */}
            <div className="lg:col-span-5 space-y-5">
              <div className={`p-4 h-64 flex flex-col ${boxClass}`}>
                <div className={`text-xs font-condensed font-black uppercase border-b-2 pb-1.5 mb-2 ${isDark ? 'border-zinc-100' : 'border-zinc-950'}`}>
                  LETRA SINCRONIZADA
                </div>
                <div className="flex-1 overflow-y-auto thin-scroll">
                  <LyricsPanel variant={isDark ? 'dark' : 'light'} />
                </div>
              </div>

              <div className={`p-4 h-64 flex flex-col ${boxClass}`}>
                <div className={`text-xs font-condensed font-black uppercase border-b-2 pb-1.5 mb-2 ${isDark ? 'border-zinc-100' : 'border-zinc-950'}`}>
                  FILA DE FAIXAS ({queue.length})
                </div>
                <div className={`flex-1 overflow-y-auto divide-y thin-scroll ${isDark ? 'divide-zinc-800' : 'divide-zinc-300'}`}>
                  {queue.map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between gap-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className={`text-left text-xs font-bold uppercase truncate flex-1 tabular-nums ${
                          currentTrack?.id === t.id ? 'text-[#FF4D00]' : ''
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')} · {t.title}
                      </button>
                      <DownloadButton track={t} compact />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </main>

      <ThemedDock
        uiId="modern-brutalist-zine"
        activeTab={activeSection}
        onSelectTab={setActiveSection}
      />
    </div>
  );
}
