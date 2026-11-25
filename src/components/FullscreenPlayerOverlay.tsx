import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import {
  ChevronDown,
  Clock3,
  Disc3,
  Flame,
  Heart,
  Layers,
  ListMusic,
  Maximize2,
  Mic2,
  Moon,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Check,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Sun,
  UserRound,
  Video,
} from 'lucide-react';
import { youtubePlayerService } from '../audio/youtubePlayerService';
import { useArtworkPalette } from '../hooks/useArtworkPalette';
import { useAppStore } from '../stores/useAppStore';
import { UI_CATALOG, type UIId } from '../types/music';
import { normalizeArtistName } from '../utils/listeningHistory';
import { formatSleepCountdown } from '../utils/settingsAndFx';
import { PlayerEmbedContext } from '../uis/shared/PlayerEmbedContext';
import { ArtworkAura } from '../uis/shared/RetroAnimatedParts';
import { getThemePalette } from '../uis/shared/themePalette';
import { DownloadButton } from './DownloadButton';
import { IsolatedProgress } from './IsolatedProgress';
import { LyricsPanel } from './LyricsPanel';
import { TrackArtwork } from './TrackArtwork';

interface FullscreenPlayerOverlayProps {
  uiId: UIId;
  ActiveUIComponent: ComponentType;
}

export function FullscreenPlayerOverlay({
  uiId,
  ActiveUIComponent,
}: FullscreenPlayerOverlayProps) {
  const isPlayerExpanded = useAppStore((s) => s.isPlayerExpanded);
  const setPlayerExpanded = useAppStore((s) => s.setPlayerExpanded);
  const setUISwitcherOpen = useAppStore((s) => s.setUISwitcherOpen);
  const toggleThemeMode = useAppStore((s) => s.toggleThemeMode);
  const themeMode = useAppStore((s) => s.themeMode);

  const currentTrack = useAppStore((s) => s.currentTrack);
  const playlists = useAppStore((s) => s.playlists);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const shuffle = useAppStore((s) => s.shuffle);
  const repeatMode = useAppStore((s) => s.repeatMode);
  const favoriteTracks = useAppStore((s) => s.favoriteTracks);
  const preferences = useAppStore((s) => s.preferences);
  const showVideoMode = useAppStore((s) => s.showVideoMode);
  const sleepTimerMode = useAppStore((s) => s.sleepTimerMode);
  const sleepRemainingSec = useAppStore((s) => s.sleepRemainingSec);

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const toggleShuffle = useAppStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useAppStore((s) => s.cycleRepeatMode);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const openArtistView = useAppStore((s) => s.openArtistView);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const setShowVideoMode = useAppStore((s) => s.setShowVideoMode);
  const setAudioFxOpen = useAppStore((s) => s.setAudioFxOpen);
  const setQueueModalOpen = useAppStore((s) => s.setQueueModalOpen);
  const setSpicyFullscreen = useAppStore((s) => s.setSpicyFullscreen);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsSectionRef = useRef<HTMLElement | null>(null);
  const lyricsSectionRef = useRef<HTMLElement | null>(null);
  const lyricsScrollRef = useRef<HTMLDivElement | null>(null);
  const videoHostRef = useRef<HTMLDivElement | null>(null);

  const [showStickyMiniPlayer, setShowStickyMiniPlayer] = useState(false);
  const [showDeckStage, setShowDeckStage] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showAmbientBackdrop = Boolean(
    currentTrack && (preferences.ambientGlow || preferences.liquidGlass !== 'off')
  );
  const glowPalette = useArtworkPalette(currentTrack, showAmbientBackdrop);

  useEffect(() => {
    if (isPlayerExpanded && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setShowStickyMiniPlayer(false);
      setIsMenuOpen(false);
    }
  }, [isPlayerExpanded, uiId]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  // Attach/detach singleton YouTube iframe between visible video host and off-screen 1px container
  useEffect(() => {
    if (isPlayerExpanded && showVideoMode && videoHostRef.current) {
      youtubePlayerService.attachVideoHost(videoHostRef.current);
      return () => {
        youtubePlayerService.attachVideoHost(null);
      };
    }
    youtubePlayerService.attachVideoHost(null);
    return undefined;
  }, [isPlayerExpanded, showVideoMode, currentTrack?.id]);

  const originName = useMemo(() => {
    if (!currentTrack) return null;
    const matched = playlists.find((pl) => pl.tracks.some((t) => t.id === currentTrack.id));
    return matched?.title || null;
  }, [currentTrack, playlists]);

  if (!isPlayerExpanded) return null;

  const isDark = themeMode === 'dark';
  const palette = getThemePalette(uiId);
  const isFav = currentTrack ? favoriteTracks.some((t) => t.id === currentTrack.id) : false;
  const artistName = currentTrack ? normalizeArtistName(currentTrack.artist) : '';
  const canShowOfficialVideo = Boolean(currentTrack && currentTrack.source !== 'offline');

  const handleOverlayScroll = () => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;
    const scrolledDown = scroller.scrollTop > 110;
    if (!scrolledDown) {
      setShowStickyMiniPlayer(false);
      return;
    }
    const controlsRect = controlsSectionRef.current?.getBoundingClientRect();
    const lyricsRect = lyricsSectionRef.current?.getBoundingClientRect();
    const pastControls = controlsRect
      ? controlsRect.top <= 96 || controlsRect.bottom <= 150
      : scroller.scrollTop > 320;
    const readingLyrics = Boolean(
      lyricsRect && lyricsRect.top <= scroller.clientHeight * 0.56
    );
    setShowStickyMiniPlayer(pastControls || readingLyrics);
  };

  const scrollBackToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleOverlayScroll}
      role="dialog"
      aria-modal="true"
      aria-label="Player Principal em Tela Cheia"
      data-fullscreen-player={uiId}
      className={`fixed inset-0 z-[45] overflow-y-auto thin-scroll transition-colors ${palette.shell(
        isDark
      )}`}
    >
      {/* Smooth Dynamic Translucent Album-Color Ambient Backdrop */}
      {showAmbientBackdrop && (
        <div
          aria-hidden="true"
          data-album-backdrop="player"
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            opacity: preferences.liquidGlass === 'high' ? 0.45 : 0.32,
            background: `radial-gradient(circle at 24% 18%, ${glowPalette.primary}bb, transparent 56%), radial-gradient(circle at 78% 36%, ${glowPalette.secondary}99, transparent 58%), radial-gradient(circle at 50% 85%, ${glowPalette.tertiary}80, transparent 60%)`,
            transition: 'background 0.8s ease, opacity 0.8s ease',
          }}
        />
      )}

      {/* Top Spotify Fullscreen Header: v left | TOCANDO AGORA + origin center | options (⋮) right */}
      <header
        data-lg-surface="true"
        className={`sticky top-0 z-30 backdrop-blur-md border-b ${
          isDark
            ? 'bg-black/45 border-white/10 text-white'
            : 'bg-white/75 border-black/10 text-zinc-900'
        }`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 relative">
          <button
            type="button"
            onClick={() => setPlayerExpanded(false)}
            aria-label="Minimizar player"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center min-w-0 flex-1 px-2">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest opacity-70 flex items-center justify-center gap-2">
              <span>TOCANDO AGORA</span>
              {sleepTimerMode !== 'off' && (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                  <Clock3 className="w-3 h-3" />
                  {sleepTimerMode === 'end_of_track'
                    ? 'FIM'
                    : formatSleepCountdown(sleepRemainingSec)}
                </span>
              )}
            </div>
            <div className="text-xs font-bold truncate">
              {originName || palette.labelTag}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-label="Opções e fila do player"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                data-lg-surface="true"
                className={`absolute right-0 top-12 w-60 rounded-xl border shadow-2xl p-1.5 z-40 space-y-0.5 text-xs ${
                  isDark
                    ? 'bg-zinc-900/95 border-zinc-700 text-zinc-100'
                    : 'bg-white/95 border-zinc-300 text-zinc-900'
                }`}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setQueueModalOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-current/10 flex items-center gap-2.5 font-medium text-left"
                >
                  <ListMusic className="w-4 h-4 shrink-0" />
                  <span>Fila de Reprodução</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setAudioFxOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-current/10 flex items-center gap-2.5 font-medium text-left"
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Audio FX Studio (DSP)</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowVideoMode(false);
                    setShowDeckStage((v) => !v);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-current/10 flex items-center gap-2.5 font-medium text-left"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{showDeckStage ? 'Mostrar Capa Spotify' : `Mostrar Deck ${palette.labelTag}`}</span>
                </button>
                {canShowOfficialVideo && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowVideoMode(!showVideoMode);
                    }}
                    className="w-full px-3 py-2.5 rounded-lg hover:bg-current/10 flex items-center gap-2.5 font-medium text-left"
                  >
                    <Video className="w-4 h-4 shrink-0" />
                    <span>{showVideoMode ? 'Fechar Vídeo Oficial' : 'Assistir Vídeo Oficial'}</span>
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    toggleThemeMode();
                  }}
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-current/10 flex items-center gap-2.5 font-medium text-left"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
                  <span>{isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setUISwitcherOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg hover:bg-current/10 flex items-center gap-2.5 font-bold text-left"
                >
                  <Layers className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Trocar Interface ({UI_CATALOG.length} UIs)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auto Sticky Mini-Player Appearing Smoothly When Scrolled Down To Lyrics */}
      {currentTrack && (
        <div
          data-sticky-player-mini="true"
          data-lg-surface="true"
          aria-hidden={!showStickyMiniPlayer}
          className={`fixed top-[62px] left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-2xl overflow-hidden border shadow-2xl backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            palette.radius
          } ${palette.miniPlayer(isDark)} ${
            showStickyMiniPlayer
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <IsolatedProgress
            trackDuration={currentTrack.duration}
            variant="minimal"
            showTimes={false}
            barBgClass={palette.progressBg(isDark)}
            barFillClass={palette.progressFill}
          />
          <div className="flex items-center justify-between gap-2.5 px-3 py-2">
            <button
              type="button"
              onClick={scrollBackToTop}
              aria-label={`Voltar ao topo do player: ${currentTrack.title}`}
              className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-current/20">
                <TrackArtwork src={currentTrack.artwork} alt={currentTrack.title} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold truncate">{currentTrack.title}</div>
                <div className="text-[11px] opacity-75 truncate">{artistName}</div>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
                className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full shadow-md active:scale-90 transition-transform ${palette.accentBg}`}
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
                aria-label="Próxima música"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Vertical Spotify Flow */}
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 pb-32 space-y-6 relative z-10">
        {/* Stage Switcher Chips (Capa Spotify / Deck UI / Vídeo) */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowVideoMode(false);
              setShowDeckStage(false);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 border transition-colors ${
              !showVideoMode && !showDeckStage
                ? `${palette.accentBg} border-transparent`
                : 'border-current/20 opacity-80 hover:opacity-100'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Capa</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowVideoMode(false);
              setShowDeckStage(true);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 border transition-colors ${
              !showVideoMode && showDeckStage
                ? `${palette.accentBg} border-transparent`
                : 'border-current/20 opacity-80 hover:opacity-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deck {palette.labelTag}</span>
          </button>

          {canShowOfficialVideo && (
            <button
              type="button"
              onClick={() => setShowVideoMode(!showVideoMode)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 border transition-colors ${
                showVideoMode
                  ? `${palette.accentBg} border-transparent`
                  : 'border-current/20 opacity-80 hover:opacity-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vídeo Oficial</span>
            </button>
          )}
        </div>

        {/* Centerpiece: Video OR Custom UI Deck OR Centered Spotify Prominent Artwork */}
        {showVideoMode && canShowOfficialVideo ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl">
            <div ref={videoHostRef} className="w-full h-full" />
          </div>
        ) : showDeckStage ? (
          <PlayerEmbedContext.Provider value={true}>
            <div className="embedded-player-stage relative z-10 rounded-2xl overflow-hidden">
              <ActiveUIComponent />
            </div>
          </PlayerEmbedContext.Provider>
        ) : (
          <div className="relative w-64 sm:w-80 mx-auto my-2">
            <ArtworkAura
              isPlaying={isPlaying}
              gradientClass="from-indigo-500/45 via-rose-500/25 to-sky-500/45"
              roundedClass="rounded-3xl"
            />
            <div
              className={`relative aspect-square w-full overflow-hidden border shadow-[0_24px_60px_rgba(0,0,0,0.48)] transition-transform duration-500 ${
                palette.radius === 'rounded-none' ? 'rounded-xl' : 'rounded-2xl'
              } ${isDark ? 'border-white/15' : 'border-black/10'} ${
                isPlaying ? 'scale-100' : 'scale-[0.97]'
              }`}
            >
              <TrackArtwork
                src={currentTrack?.artwork}
                alt={currentTrack?.title || 'Capa do álbum'}
              />
            </div>
          </div>
        )}

        {/* Main Spotify Controls Card */}
        {currentTrack && (
          <section
            ref={controlsSectionRef}
            data-lg-card="true"
            aria-label="Controles principais do player"
            className={`p-5 sm:p-6 space-y-5 ${palette.radius} ${palette.card(isDark)}`}
          >
            {/* Title & Artist Left + Favorite (+ / Heart) & Download Right */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className={`text-xl sm:text-2xl font-extrabold truncate ${palette.headingFont}`}>
                  {currentTrack.title}
                </h2>
                <button
                  type="button"
                  onClick={() => openArtistView(artistName, currentTrack.artwork)}
                  className={`mt-1 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline ${palette.accentText(
                    isDark
                  )}`}
                >
                  <UserRound className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{artistName}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(currentTrack)}
                  aria-label={isFav ? 'Remover dos favoritos' : 'Curtir / Salvar faixa'}
                  aria-pressed={isFav}
                  className={`min-h-[42px] px-2.5 flex items-center justify-center gap-1 rounded-full border transition-transform active:scale-90 ${
                    isFav
                      ? 'border-rose-500/45 bg-rose-500/15 text-rose-500'
                      : 'border-current/20 hover:bg-current/10 opacity-85'
                  }`}
                >
                  {isFav ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <Heart
                    className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'opacity-80'}`}
                  />
                </button>
                <DownloadButton track={currentTrack} compact />
              </div>
            </div>

            {/* Thin Responsive Progress Bar with Timestamps */}
            <IsolatedProgress
              trackDuration={currentTrack.duration}
              barBgClass={palette.progressBg(isDark)}
              barFillClass={palette.progressFill}
              textClass="opacity-75"
            />

            {/* 5 Classic Spaced Spotify Transport Buttons */}
            <div className="flex items-center justify-between max-w-md mx-auto pt-1">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label="Ordem aleatória"
                aria-pressed={shuffle}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-transform active:scale-90 ${
                  shuffle ? palette.accentText(isDark) : 'opacity-65 hover:opacity-100'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Faixa anterior"
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform ${palette.accentBg}`}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima faixa"
                className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full hover:bg-current/10 active:scale-90 transition-transform"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={cycleRepeatMode}
                aria-label={`Repetir: ${repeatMode}`}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-transform active:scale-90 ${
                  repeatMode !== 'off' ? palette.accentText(isDark) : 'opacity-65 hover:opacity-100'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Quick-Access Row: Audio FX / Estúdio & Fila */}
            <div className="pt-2.5 border-t border-current/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setAudioFxOpen(true)}
                aria-label="Abrir Audio FX Studio"
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-current/15 hover:bg-current/10 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Sliders className="w-4 h-4" />
                <span>Audio FX / Estúdio</span>
              </button>

              <button
                type="button"
                onClick={() => setQueueModalOpen(true)}
                aria-label="Abrir Fila de Reprodução"
                className="min-h-[38px] px-3 py-1.5 rounded-lg border border-current/15 hover:bg-current/10 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <ListMusic className="w-4 h-4" />
                <span>Fila</span>
              </button>
            </div>
          </section>
        )}

        {/* Spotify-Style Colored Synced Lyrics Card with Isolated Inner Scroll & SpicyLyrics Quick-Toggle */}
        <section
          ref={lyricsSectionRef}
          data-lg-card="true"
          aria-label="Card de Letra Sincronizada"
          className={`p-5 sm:p-6 shadow-2xl space-y-4 ${palette.radius} ${palette.lyricsCard(
            isDark
          )}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mic2 className="w-5 h-5 shrink-0" />
              <h3 className={`text-lg font-extrabold ${palette.headingFont}`}>
                {preferences.spicyLyrics ? 'SpicyLyrics' : 'Letra Sincronizada'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updatePreferences({ spicyLyrics: !preferences.spicyLyrics })}
                aria-pressed={preferences.spicyLyrics}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-colors ${
                  preferences.spicyLyrics
                    ? 'bg-orange-500 text-white border-orange-300'
                    : 'border-current/25 hover:bg-current/10'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>SpicyLyrics</span>
              </button>

              <button
                type="button"
                onClick={() => setSpicyFullscreen(true)}
                aria-label="Expandir letra em tela cheia"
                className="min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border border-current/25 hover:bg-current/10"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Tela Cheia</span>
              </button>
            </div>
          </div>

          <div
            ref={lyricsScrollRef}
            data-lyrics-scroll-container="true"
            className="max-h-96 overflow-y-auto thin-scroll pr-1"
          >
            <LyricsPanel
              variant={palette.lyricsVariant(isDark)}
              scrollContainerRef={lyricsScrollRef}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
