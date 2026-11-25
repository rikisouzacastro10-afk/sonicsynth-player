import { ChevronUp, Heart, Pause, Play, SkipForward } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { UIId } from '../types/music';
import { normalizeArtistName } from '../utils/listeningHistory';
import { getThemePalette } from '../uis/shared/themePalette';
import { IsolatedProgress } from './IsolatedProgress';
import { TrackArtwork } from './TrackArtwork';

export function MiniPlayerBar({ uiId }: { uiId: UIId }) {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const favoriteTracks = useAppStore((s) => s.favoriteTracks);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setPlayerExpanded = useAppStore((s) => s.setPlayerExpanded);

  if (!currentTrack) return null;

  const isDark = themeMode === 'dark';
  const palette = getThemePalette(uiId);
  const isFav = favoriteTracks.some((t) => t.id === currentTrack.id);

  return (
    <div
      role="region"
      aria-label="Mini-player persistente"
      data-mini-player={uiId}
      className={`pointer-events-auto overflow-hidden transition-all duration-200 ${palette.radius} ${palette.miniPlayer(
        isDark
      )}`}
    >
      {/* Thin 60fps progress bar along top edge */}
      <IsolatedProgress
        trackDuration={currentTrack.duration}
        variant="minimal"
        showTimes={false}
        barBgClass={palette.progressBg(isDark)}
        barFillClass={palette.progressFill}
      />

      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        {/* Tap info area to expand Fullscreen Player */}
        <button
          type="button"
          onClick={() => setPlayerExpanded(true)}
          aria-label={`Expandir player: ${currentTrack.title}`}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left group min-h-[44px]"
        >
          <div className="relative w-10 h-10 shrink-0">
            <div
              className={`w-full h-full overflow-hidden border border-current/20 ${
                palette.isRetro
                  ? `rounded-full anim-spin-vinyl ${!isPlaying ? 'anim-paused' : ''}`
                  : palette.radius === 'rounded-none'
                    ? 'rounded-none'
                    : 'rounded-lg'
              }`}
              style={palette.isRetro ? { animationDuration: '9s' } : undefined}
            >
              <TrackArtwork src={currentTrack.artwork} alt={currentTrack.title} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
              <span className="truncate">{currentTrack.title}</span>
              <ChevronUp className="w-3.5 h-3.5 opacity-55 group-hover:opacity-100 shrink-0 transition-transform group-hover:-translate-y-0.5" />
            </div>
            <div className="text-[11px] opacity-70 truncate">
              {normalizeArtistName(currentTrack.artist)}
            </div>
          </div>
        </button>

        {/* Quick Mini-Player Transport */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => toggleFavorite(currentTrack)}
            aria-label={isFav ? 'Remover dos favoritos' : 'Favoritar música'}
            className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
          >
            <Heart
              className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'opacity-75'}`}
            />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full active:scale-90 transition-transform shadow-sm ${palette.accentBg}`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => void nextTrack()}
            aria-label="Próxima faixa"
            className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
