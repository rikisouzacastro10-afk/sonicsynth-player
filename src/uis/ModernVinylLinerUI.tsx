import { useState } from 'react';
import { Disc3, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
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

export default function ModernVinylLinerUI() {
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
  const [rightTab, setRightTab] = useState<'tracks' | 'lyrics'>('tracks');

  const btnSurface = isDark
    ? 'bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800'
    : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-100';

  return (
    <div
      data-ui-id="modern-vinyl-liner"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col justify-between transition-colors ${
        isDark ? 'bg-[#111015] text-stone-100' : 'bg-[#FAF8F5] text-stone-900'
      }`}
    >
      {/* Archival Record Label Header */}
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/15">
        <div className="flex items-center gap-2.5">
          <Disc3 className={`w-5 h-5 text-violet-600 dark:text-violet-400 anim-spin-vinyl ${!isPlaying ? 'anim-paused' : ''}`} />
          <span className="font-serif-editorial text-xl font-bold tracking-tight">
            Liner Gallery · Pressing No. 01
          </span>
        </div>

        <div className="text-[11px] font-mono-tech uppercase opacity-65 flex items-center gap-2">
          <span>180G AUDIOPHILE PRESSING</span>
          <span>·</span>
          <span>33⅓ RPM</span>
        </div>
      </header>

      {/* Open Gatefold Sleeve Spread */}
      <main className="max-w-6xl w-full mx-auto my-auto py-6">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 rounded-2xl border overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#18161E] border-zinc-800' : 'bg-white border-stone-300'
          }`}
        >
          {/* Left Gatefold: Sleeve + Peeking Vinyl Record */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col items-center justify-center relative border-b lg:border-b-0 lg:border-r border-current/10">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center">
              {/* Spinning Vinyl Disc peeking out to the right */}
              <div
                className={`absolute right-[-36px] sm:right-[-44px] w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[radial-gradient(circle,#1c1c20_24%,#09090b_25%,#18181b_42%,#09090b_43%,#1a1a1f_62%,#09090b_63%)] border-4 border-zinc-800 shadow-2xl flex items-center justify-center anim-spin-vinyl ${
                  !isPlaying ? 'anim-paused' : ''
                }`}
                aria-hidden="true"
              >
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_40deg,transparent_0deg,rgba(255,255,255,0.08)_28deg,transparent_62deg,transparent_180deg,rgba(255,255,255,0.06)_212deg,transparent_245deg)]" />
                <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center border-2 border-violet-300/60">
                  <div className="w-3 h-3 rounded-full bg-zinc-950" />
                </div>
              </div>

              {/* Front Cover Sleeve */}
              <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass="from-violet-600/40 via-fuchsia-500/20 to-indigo-500/40"
                  roundedClass="rounded-xl"
                />
                <div className="relative w-full h-full rounded-lg overflow-hidden shadow-xl border border-black/15">
                  <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa do Álbum'} />
                </div>
              </div>
            </div>

            <div className="w-full max-w-md mt-7 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-mono-tech uppercase tracking-widest text-violet-500">
                    {currentTrack?.source?.toUpperCase() || 'MASTER'} · {currentTrack?.genre || 'ED. ESPECIAL'}
                  </div>
                  <MarqueeText
                    text={currentTrack?.title || 'Carregando álbum...'}
                    isPlaying={isPlaying}
                    className="font-serif-editorial text-2xl sm:text-3xl font-bold leading-tight mt-1"
                  />
                  <p className="text-sm opacity-70 truncate">
                    {currentTrack ? `${currentTrack.artist} — ${currentTrack.album}` : 'Liner Gallery'}
                  </p>
                </div>
                {currentTrack && <DownloadButton track={currentTrack} />}
              </div>

              <AnimatedEqBars isPlaying={isPlaying} bars={22} barClass="bg-violet-500/80" heightClass="h-4" />

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass={isDark ? 'bg-zinc-800' : 'bg-stone-200'}
                barFillClass="bg-violet-600"
                textClass={isDark ? 'text-stone-400' : 'text-stone-600'}
              />

              <div className="flex items-center justify-center gap-4 pt-1">
                <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-11 h-11 rounded-full flex items-center justify-center ${btnSurface}`}>
                  <SkipBack className="w-4 h-4" />
                </button>
                <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95">
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
                <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-11 h-11 rounded-full flex items-center justify-center ${btnSurface}`}>
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Gatefold: Technical Liner Sheet & Libretti */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-current/15 pb-3 mb-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setRightTab('tracks')}
                  className={`text-xs font-mono-tech uppercase tracking-wider pb-1 border-b-2 transition-colors ${
                    rightTab === 'tracks' ? 'border-violet-500 text-violet-500 font-bold' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  Lado A / Faixas ({queue.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab('lyrics')}
                  className={`text-xs font-mono-tech uppercase tracking-wider pb-1 border-b-2 transition-colors ${
                    rightTab === 'lyrics' ? 'border-violet-500 text-violet-500 font-bold' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  Encarte & Letras
                </button>
              </div>
              <span className="text-[11px] font-mono-tech opacity-55 tabular-nums">STEREO LP</span>
            </div>

            {rightTab === 'tracks' ? (
              <div className="flex-1 overflow-y-auto divide-y divide-current/10 thin-scroll">
                {queue.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[42px]"
                      >
                        <span className={`font-mono-tech text-xs w-6 tabular-nums ${active ? 'text-violet-500 font-bold' : 'opacity-50'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-serif-editorial truncate ${active ? 'text-violet-500 font-bold' : ''}`}>
                            {t.title}
                          </div>
                          <div className="text-xs opacity-60 truncate">{t.artist}</div>
                        </div>
                        <span className="text-xs font-mono-tech opacity-55 tabular-nums">
                          {formatDuration(t.duration)}
                        </span>
                      </button>
                      <DownloadButton track={t} compact />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto thin-scroll font-serif-editorial">
                <LyricsPanel variant={isDark ? 'dark' : 'light'} />
              </div>
            )}
          </div>
        </div>
      </main>

      <ThemedDock
        uiId="modern-vinyl-liner"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
