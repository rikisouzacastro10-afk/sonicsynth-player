import { useEffect, useRef } from 'react';
import { Flame, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { normalizeArtistName } from '../utils/listeningHistory';
import { IsolatedProgress } from './IsolatedProgress';
import { SpicyLyricsView } from './SpicyLyricsView';
import { TrackArtwork } from './TrackArtwork';

export function SpicyLyricsFullscreenModal() {
  const isOpen = useAppStore((s) => s.isSpicyFullscreen);
  const setOpen = useAppStore((s) => s.setSpicyFullscreen);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="SpicyLyrics em Tela Cheia"
      data-spicy-fullscreen="true"
      className={`fixed inset-0 z-[62] flex flex-col ${
        isDark ? 'bg-zinc-950 text-white' : 'bg-stone-100 text-zinc-950'
      }`}
    >
      {/* Top Bar */}
      <header
        data-lg-surface="true"
        className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-3 ${
          isDark ? 'border-white/10 bg-zinc-950/80' : 'border-black/10 bg-white/80'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {currentTrack && (
            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-current/20">
              <TrackArtwork src={currentTrack.artwork} alt={currentTrack.title} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-tech uppercase tracking-wider text-orange-500 font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>SPICYLYRICS FULLSCREEN</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold truncate">
              {currentTrack?.title || 'Nenhuma faixa carregada'}
            </h2>
            <p className="text-xs opacity-70 truncate">
              {currentTrack ? normalizeArtistName(currentTrack.artist) : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar SpicyLyrics tela cheia"
          className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-current/10 shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Immersive Lyrics Stage */}
      <div
        ref={lyricsScrollRef}
        data-lyrics-scroll-container="true"
        className="flex-1 overflow-y-auto thin-scroll p-3 sm:p-6"
      >
        <SpicyLyricsView
          variant={isDark ? 'stage' : 'stage-light'}
          fullscreen
          scrollContainerRef={lyricsScrollRef}
        />
      </div>

      {/* Bottom Compact Transport Bar */}
      {currentTrack && (
        <footer
          data-lg-surface="true"
          className={`px-4 sm:px-6 py-3 border-t pb-safe ${
            isDark ? 'border-white/10 bg-zinc-950/90' : 'border-black/10 bg-white/90'
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-2.5">
            <IsolatedProgress
              trackDuration={currentTrack.duration}
              barBgClass={isDark ? 'bg-white/15' : 'bg-black/15'}
              barFillClass="bg-orange-500"
              compact
            />
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Faixa anterior"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-current/10"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima faixa"
                className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-current/10"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
