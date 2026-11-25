import { Disc3, Heart, Maximize2, Play, Sparkles, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import type { Track, UIId } from '../types/music';
import {
  buildHomeRecommendations,
  buildQuickShortcuts,
  extractUserArtists,
  getTimeGreeting,
  normalizeArtistName,
} from '../utils/listeningHistory';
import { DownloadButton } from './DownloadButton';
import { TrackArtwork } from './TrackArtwork';
import { AnimatedEqBars } from '../uis/shared/RetroAnimatedParts';
import { getThemePalette } from '../uis/shared/themePalette';

interface HorizontalTrackCarouselProps {
  title: string;
  subtitle?: string;
  tracks: Track[];
  uiId: UIId;
  isDark: boolean;
  onPlay: (track: Track, list: Track[]) => void;
  onArtistClick: (artist: string, artwork?: string) => void;
  currentTrackId?: string;
}

function HorizontalTrackCarousel({
  title,
  subtitle,
  tracks,
  uiId,
  isDark,
  onPlay,
  onArtistClick,
  currentTrackId,
}: HorizontalTrackCarouselProps) {
  const palette = getThemePalette(uiId);
  if (tracks.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={title}>
      <div className="flex items-baseline justify-between gap-3 px-0.5">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${palette.headingFont}`}>
            {title}
          </h2>
          {subtitle && <p className="text-xs opacity-65 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-mono-tech opacity-60 shrink-0 tabular-nums">
          {tracks.length} faixas
        </span>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-2 snap-x thin-scroll">
        {tracks.map((track) => {
          const active = currentTrackId === track.id;
          const artistLabel = normalizeArtistName(track.artist);
          return (
            <div
              key={track.id}
              data-lg-card="true"
              className={`w-38 sm:w-44 shrink-0 snap-start p-2.5 flex flex-col gap-2.5 transition-colors ${palette.radius} ${palette.card(
                isDark
              )} ${active ? 'ring-2 ring-current/60' : ''}`}
            >
              <button
                type="button"
                onClick={() => onPlay(track, tracks)}
                aria-label={`Tocar ${track.title}`}
                className={`group relative aspect-square w-full overflow-hidden text-left ${
                  palette.radius === 'rounded-none' ? 'rounded-none' : 'rounded-xl'
                }`}
              >
                <TrackArtwork src={track.artwork} alt={track.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${palette.accentBg}`}>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </span>
                </div>
              </button>

              <div className="min-w-0 flex-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => onPlay(track, tracks)}
                  className={`w-full text-left text-sm font-semibold truncate hover:underline ${
                    active ? palette.accentText(isDark) : ''
                  }`}
                >
                  {track.title}
                </button>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => onArtistClick(artistLabel, track.artwork)}
                    className="text-xs opacity-70 hover:opacity-100 hover:underline truncate text-left"
                  >
                    {artistLabel}
                  </button>
                  <DownloadButton track={track} compact />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SpotifyHomeView({ uiId }: { uiId: UIId }) {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const queue = useAppStore((s) => s.queue);
  const playlists = useAppStore((s) => s.playlists);
  const recentHistory = useAppStore((s) => s.recentHistory);
  const favoriteTracks = useAppStore((s) => s.favoriteTracks);
  const accountPlaylists = useAppStore((s) => s.accountPlaylists);
  const accountLikedTracks = useAppStore((s) => s.accountLikedTracks);
  const isLoadingTrending = useAppStore((s) => s.isLoadingTrending);

  const playTrack = useAppStore((s) => s.playTrack);
  const openArtistView = useAppStore((s) => s.openArtistView);
  const setPlayerExpanded = useAppStore((s) => s.setPlayerExpanded);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const isDark = themeMode === 'dark';
  const palette = getThemePalette(uiId);
  const greeting = getTimeGreeting();

  const shortcuts = useMemo(
    () => buildQuickShortcuts(recentHistory, favoriteTracks, playlists, queue),
    [recentHistory, favoriteTracks, playlists, queue]
  );

  const artists = useMemo(
    () => extractUserArtists(recentHistory, queue, 12),
    [recentHistory, queue]
  );

  const recs = useMemo(
    () => buildHomeRecommendations(recentHistory, queue, playlists),
    [recentHistory, queue, playlists]
  );

  return (
    <div className="max-w-6xl w-full mx-auto space-y-7">
      {/* Top Greeting & Quick Theme Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <p className={`text-[11px] font-mono-tech uppercase tracking-wider ${palette.accentText(isDark)}`}>
            {palette.labelTag} · INÍCIO
          </p>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 ${palette.headingFont}`}>
            {greeting}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {favoriteTracks.length > 0 && (
            <button
              type="button"
              onClick={() => favoriteTracks[0] && void playTrack(favoriteTracks[0], favoriteTracks)}
              className={`min-h-[40px] px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 transition-transform active:scale-95 ${palette.radius} ${palette.card(
                isDark
              )}`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Curtidas ({favoriteTracks.length})</span>
            </button>
          )}
          {currentTrack && (
            <button
              type="button"
              onClick={() => setPlayerExpanded(true)}
              aria-label="Abrir Player Principal"
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 transition-transform active:scale-95 ${palette.radius} ${palette.accentBg}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Abrir Player</span>
            </button>
          )}
        </div>
      </header>

      {/* 1. Spotify-style 2-Column Quick Access Grid */}
      <section aria-label="Atalhos rápidos">
        {shortcuts.length === 0 && isLoadingTrending ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-14 animate-pulse ${palette.radius} ${palette.card(isDark)}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {shortcuts.map((item) => {
              const isActiveTrack = item.track && currentTrack?.id === item.track.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-lg-card="true"
                  onClick={() => {
                    if (item.track) {
                      void playTrack(item.track, item.tracks);
                    }
                  }}
                  className={`group flex items-center gap-2.5 sm:gap-3 overflow-hidden pr-2.5 text-left min-h-[56px] transition-transform active:scale-[0.98] ${palette.radius} ${palette.card(
                    isDark
                  )} ${palette.cardHover(isDark)} ${isActiveTrack ? 'ring-2 ring-current/50' : ''}`}
                >
                  <div className="w-14 h-14 shrink-0 overflow-hidden bg-black/20 flex items-center justify-center relative">
                    {item.kind === 'favorites' && !item.artwork ? (
                      <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                    ) : (
                      <TrackArtwork src={item.artwork} alt={item.title} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <div className={`text-xs sm:text-sm font-bold truncate ${isActiveTrack ? palette.accentText(isDark) : ''}`}>
                      {item.title}
                    </div>
                    <div className="text-[11px] opacity-65 truncate">{item.subtitle}</div>
                  </div>
                  {isActiveTrack && isPlaying ? (
                    <div className="w-6 shrink-0 hidden sm:block">
                      <AnimatedEqBars isPlaying={true} bars={4} barClass="bg-current" heightClass="h-4" />
                    </div>
                  ) : (
                    <span
                      className={`w-7 h-7 rounded-full items-center justify-center shrink-0 hidden sm:group-hover:flex ${palette.accentBg}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Tocados Recentemente (Horizontal Carousel) */}
      <HorizontalTrackCarousel
        title="Tocados Recentemente"
        subtitle={
          recs.isHistorySeeded
            ? 'Seu histórico real salvo automaticamente neste dispositivo'
            : 'Sugestões iniciais ao vivo — toque qualquer faixa para personalizar'
        }
        tracks={recs.recentlyPlayed}
        uiId={uiId}
        isDark={isDark}
        onPlay={(track, list) => void playTrack(track, list)}
        onArtistClick={(name, artwork) => openArtistView(name, artwork)}
        currentTrackId={currentTrack?.id}
      />

      {/* 3. Seus Artistas (Circular Carousel) */}
      {artists.length > 0 && (
        <section className="space-y-3" aria-label="Seus Artistas">
          <div className="flex items-baseline justify-between gap-3 px-0.5">
            <div>
              <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${palette.headingFont}`}>
                Seus Artistas
              </h2>
              <p className="text-xs opacity-65 mt-0.5">
                Toque para abrir as músicas oficiais mais populares do artista
              </p>
            </div>
            <span className="text-[11px] font-mono-tech opacity-60 shrink-0 tabular-nums">
              {artists.length} artistas
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x thin-scroll">
            {artists.map((artist) => (
              <button
                key={artist.name}
                type="button"
                onClick={() => openArtistView(artist.name, artist.artwork)}
                className="group w-28 sm:w-32 shrink-0 snap-start flex flex-col items-center text-center gap-2 transition-transform active:scale-95"
              >
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 shadow-lg transition-transform duration-200 group-hover:scale-[1.04] ${
                    isDark ? 'border-white/20' : 'border-black/15'
                  }`}
                >
                  <TrackArtwork src={artist.artwork} alt={artist.name} />
                </div>
                <div className="w-full min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate">{artist.name}</div>
                  <div className="text-[11px] opacity-65 truncate">
                    {artist.playCount > 1 ? `${artist.playCount} reproduções` : 'Artista'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Para Ouvir de Novo */}
      <HorizontalTrackCarousel
        title="Para Ouvir de Novo"
        subtitle="Faixas e artistas recorrentes no seu gosto musical"
        tracks={recs.listenAgain}
        uiId={uiId}
        isDark={isDark}
        onPlay={(track, list) => void playTrack(track, list)}
        onArtistClick={(name, artwork) => openArtistView(name, artwork)}
        currentTrackId={currentTrack?.id}
      />

      {/* 5. Sucessos Oficiais & Mixes */}
      <HorizontalTrackCarousel
        title="Sucessos Oficiais"
        subtitle="Lançamentos e canais verificados ranqueados por popularidade"
        tracks={recs.officialHits}
        uiId={uiId}
        isDark={isDark}
        onPlay={(track, list) => void playTrack(track, list)}
        onArtistClick={(name, artwork) => openArtistView(name, artwork)}
        currentTrackId={currentTrack?.id}
      />

      {/* Imported YouTube Account Liked Tracks */}
      {accountLikedTracks.length > 0 && (
        <HorizontalTrackCarousel
          title="Músicas Curtidas no YouTube"
          subtitle="Sincronizadas diretamente da sua conta Google conectada"
          tracks={accountLikedTracks}
          uiId={uiId}
          isDark={isDark}
          onPlay={(track, list) => void playTrack(track, list)}
          onArtistClick={(name, artwork) => openArtistView(name, artwork)}
          currentTrackId={currentTrack?.id}
        />
      )}

      {/* Imported YouTube Account Playlists */}
      {accountPlaylists.length > 0 && (
        <section className="space-y-3" aria-label="Playlists da sua Conta YouTube">
          <div className="flex items-center justify-between gap-2">
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${palette.headingFont}`}>
              Suas Playlists do YouTube
            </h2>
            <span className="text-[11px] font-mono-tech opacity-60">
              {accountPlaylists.length} importadas
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accountPlaylists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                data-lg-card="true"
                onClick={() => pl.tracks[0] && void playTrack(pl.tracks[0], pl.tracks)}
                className={`p-3 flex items-center gap-3 text-left transition-transform active:scale-[0.98] ${palette.radius} ${palette.card(
                  isDark
                )} ${palette.cardHover(isDark)}`}
              >
                <div
                  className={`w-14 h-14 shrink-0 overflow-hidden bg-black/20 flex items-center justify-center ${
                    palette.radius === 'rounded-none' ? 'rounded-none' : 'rounded-xl'
                  }`}
                >
                  <TrackArtwork src={pl.coverArt || pl.tracks[0]?.artwork} alt={pl.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate">{pl.title}</div>
                  <div className="text-xs opacity-65 line-clamp-1 mt-0.5">{pl.description}</div>
                  <div className="text-[11px] font-mono-tech opacity-60 mt-1">
                    {pl.tracks.length} faixas · Conta YouTube
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Playlists & AI Discovery Banner */}
      {playlists.length > 0 && (
        <section className="space-y-3" aria-label="Mixes e Playlists">
          <div className="flex items-center justify-between gap-2">
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2 ${palette.headingFont}`}>
              <TrendingUp className={`w-4 h-4 ${palette.accentText(isDark)}`} />
              <span>Playlists &amp; Mixes para Você</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveSection('ai')}
              className={`text-xs font-semibold inline-flex items-center gap-1 hover:underline ${palette.accentText(
                isDark
              )}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Criar com IA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.slice(0, 6).map((pl) => (
              <button
                key={pl.id}
                type="button"
                data-lg-card="true"
                onClick={() => pl.tracks[0] && void playTrack(pl.tracks[0], pl.tracks)}
                className={`p-3 flex items-center gap-3 text-left transition-transform active:scale-[0.98] ${palette.radius} ${palette.card(
                  isDark
                )} ${palette.cardHover(isDark)}`}
              >
                <div
                  className={`w-14 h-14 shrink-0 overflow-hidden bg-black/20 flex items-center justify-center ${
                    palette.radius === 'rounded-none' ? 'rounded-none' : 'rounded-xl'
                  }`}
                >
                  {pl.coverArt || pl.tracks[0]?.artwork ? (
                    <TrackArtwork src={pl.coverArt || pl.tracks[0]?.artwork} alt={pl.title} />
                  ) : (
                    <Disc3 className="w-6 h-6 opacity-60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate">{pl.title}</div>
                  <div className="text-xs opacity-65 line-clamp-1 mt-0.5">{pl.description}</div>
                  <div className="text-[11px] font-mono-tech opacity-60 mt-1">
                    {pl.tracks.length} faixas · Tocar agora
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
