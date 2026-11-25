import type { ArtistSummary, HistoryEntry, Playlist, Track } from '../types/music';

export const HISTORY_STORAGE_KEY = 'sonicmorph_history_v1';
export const FAVORITES_STORAGE_KEY = 'sonicmorph_favorites_v1';
const MAX_HISTORY_ITEMS = 40;

export function getTimeGreeting(hour: number = new Date().getHours()): string {
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function normalizeArtistName(rawArtist: string): string {
  return (rawArtist || 'Artista')
    .replace(/\s*-\s*topic$/i, '')
    .replace(/\s+vevo$/i, '')
    .replace(/\s+official$/i, '')
    .trim();
}

export function loadHistoryFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is HistoryEntry =>
        Boolean(entry && entry.track && typeof entry.track.id === 'string' && typeof entry.playedAt === 'number')
    );
  } catch {
    return [];
  }
}

export function saveHistoryToStorage(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadFavoritesFromStorage(): Track[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is Track => Boolean(t && typeof t.id === 'string' && typeof t.title === 'string'));
  } catch {
    return [];
  }
}

export function saveFavoritesToStorage(favorites: Track[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore storage quota errors
  }
}

export function recordTrackPlay(
  history: HistoryEntry[],
  track: Track,
  now: number = Date.now()
): HistoryEntry[] {
  if (!track?.id) return history;
  const existing = history.find((item) => item.track.id === track.id);
  const nextEntry: HistoryEntry = {
    track,
    playedAt: now,
    playCount: (existing?.playCount || 0) + 1,
  };
  const rest = history.filter((item) => item.track.id !== track.id);
  return [nextEntry, ...rest].slice(0, MAX_HISTORY_ITEMS);
}

export function toggleFavoriteTrack(favorites: Track[], track: Track): Track[] {
  if (!track?.id) return favorites;
  const exists = favorites.some((t) => t.id === track.id);
  if (exists) {
    return favorites.filter((t) => t.id !== track.id);
  }
  return [track, ...favorites];
}

export function extractUserArtists(
  history: HistoryEntry[],
  fallbackTracks: Track[] = [],
  limit: number = 12
): ArtistSummary[] {
  const sourceEntries: Array<{ track: Track; weight: number }> =
    history.length > 0
      ? history.map((h) => ({ track: h.track, weight: h.playCount }))
      : fallbackTracks.map((t) => ({ track: t, weight: 1 }));

  const map = new Map<string, ArtistSummary>();

  for (const { track, weight } of sourceEntries) {
    const cleanName = normalizeArtistName(track.artist);
    if (!cleanName || cleanName === 'Artista Desconhecido') continue;
    const key = cleanName.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.playCount += weight;
      if (!existing.tracks.some((t) => t.id === track.id)) {
        existing.tracks.push(track);
      }
      if (!existing.artwork && track.artwork) {
        existing.artwork = track.artwork;
      }
    } else {
      map.set(key, {
        name: cleanName,
        artwork: track.artwork,
        playCount: weight,
        tracks: [track],
      });
    }
  }

  // Enrich artist track pools from fallbackTracks when artist also appears there
  for (const track of fallbackTracks) {
    const cleanName = normalizeArtistName(track.artist).toLowerCase();
    const existing = map.get(cleanName);
    if (existing && !existing.tracks.some((t) => t.id === track.id)) {
      existing.tracks.push(track);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit);
}

export interface QuickShortcutItem {
  id: string;
  title: string;
  subtitle: string;
  artwork?: string;
  kind: 'track' | 'playlist' | 'favorites';
  track?: Track;
  playlist?: Playlist;
  tracks: Track[];
}

export function buildQuickShortcuts(
  history: HistoryEntry[],
  favorites: Track[],
  playlists: Playlist[],
  fallbackTracks: Track[]
): QuickShortcutItem[] {
  const items: QuickShortcutItem[] = [];
  const usedKeys = new Set<string>();

  if (favorites.length > 0) {
    items.push({
      id: 'shortcut-favorites',
      title: 'Músicas Curtidas',
      subtitle: `${favorites.length} faixas`,
      artwork: favorites[0]?.artwork,
      kind: 'favorites',
      track: favorites[0],
      tracks: favorites,
    });
    usedKeys.add('shortcut-favorites');
  }

  for (const entry of history.slice(0, 4)) {
    const key = `track-${entry.track.id}`;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    items.push({
      id: key,
      title: entry.track.title,
      subtitle: normalizeArtistName(entry.track.artist),
      artwork: entry.track.artwork,
      kind: 'track',
      track: entry.track,
      tracks: history.map((h) => h.track),
    });
    if (items.length >= 4) break;
  }

  for (const pl of playlists) {
    if (items.length >= 6) break;
    if (pl.tracks.length === 0) continue;
    const key = `pl-${pl.id}`;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    items.push({
      id: key,
      title: pl.title,
      subtitle: `${pl.tracks.length} faixas`,
      artwork: pl.coverArt || pl.tracks[0]?.artwork,
      kind: 'playlist',
      playlist: pl,
      track: pl.tracks[0],
      tracks: pl.tracks,
    });
  }

  for (const track of fallbackTracks) {
    if (items.length >= 6) break;
    const key = `track-${track.id}`;
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    items.push({
      id: key,
      title: track.title,
      subtitle: normalizeArtistName(track.artist),
      artwork: track.artwork,
      kind: 'track',
      track,
      tracks: fallbackTracks,
    });
  }

  return items.slice(0, 6);
}

export interface HomeRecommendations {
  recentlyPlayed: Track[];
  isHistorySeeded: boolean;
  listenAgain: Track[];
  officialHits: Track[];
}

export function buildHomeRecommendations(
  history: HistoryEntry[],
  trendingTracks: Track[],
  playlists: Playlist[]
): HomeRecommendations {
  const isHistorySeeded = history.length > 0;
  const recentTracks = history.map((h) => h.track);
  const recentlyPlayed = isHistorySeeded
    ? recentTracks.slice(0, 12)
    : trendingTracks.slice(0, 12);

  // Para Ouvir de Novo: prioritize tracks played more than once or deeper in history + artist matches
  const historyArtists = new Set(
    history.map((h) => normalizeArtistName(h.track.artist).toLowerCase())
  );

  const replaySorted = [...history]
    .sort((a, b) => {
      if (b.playCount !== a.playCount) return b.playCount - a.playCount;
      return a.playedAt - b.playedAt;
    })
    .map((h) => h.track);

  const artistMatchedFromCatalog = trendingTracks.filter((t) =>
    historyArtists.has(normalizeArtistName(t.artist).toLowerCase())
  );

  const poolTracks = [...trendingTracks, ...playlists.flatMap((p) => p.tracks)];

  const dedupe = (list: Track[]) => {
    const seen = new Set<string>();
    const out: Track[] = [];
    for (const t of list) {
      if (!t?.id || seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
    }
    return out;
  };

  const listenAgain = dedupe([
    ...replaySorted,
    ...artistMatchedFromCatalog,
    ...poolTracks.slice(2),
  ]).slice(0, 12);

  const officialHits = dedupe(
    [...poolTracks].sort((a, b) => {
      const verifiedScore = (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      if (verifiedScore !== 0) return verifiedScore;
      return (b.views || 0) - (a.views || 0);
    })
  ).slice(0, 12);

  return {
    recentlyPlayed,
    isHistorySeeded,
    listenAgain,
    officialHits,
  };
}
