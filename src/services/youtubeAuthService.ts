import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Playlist, Track } from '../types/music';
import { parseIsoDuration } from '../utils/youtubeFormatters';

const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

// Strictly in-memory OAuth access token (never stored in localStorage/sessionStorage)
let memoryAccessToken: string | null = null;

function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export interface YouTubeAuthProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

function mapFirebaseUser(user: User): YouTubeAuthProfile {
  return {
    uid: user.uid,
    displayName: user.displayName || 'Usuário YouTube',
    email: user.email || '',
    photoURL: user.photoURL || '',
  };
}

export function getInMemoryYouTubeAccessToken(): string | null {
  return memoryAccessToken;
}

export function subscribeYouTubeAuthState(
  onChange: (profile: YouTubeAuthProfile | null, hasAccessToken: boolean) => void
): () => void {
  try {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      if (!user) {
        memoryAccessToken = null;
        onChange(null, false);
        return;
      }
      onChange(mapFirebaseUser(user), Boolean(memoryAccessToken));
    });
  } catch {
    return () => {};
  }
}

export async function connectYouTubeGoogleAccount(): Promise<{
  profile: YouTubeAuthProfile;
  accessToken: string;
}> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope(YOUTUBE_READONLY_SCOPE);
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    if (!token) {
      throw new Error(
        'Token de leitura do YouTube não foi concedido. Autorize a permissão youtube.readonly para importar suas playlists.'
      );
    }
    memoryAccessToken = token;
    return {
      profile: mapFirebaseUser(result.user),
      accessToken: token,
    };
  } catch (err) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/popup-blocked') {
      throw new Error(
        'O navegador bloqueou a janela de login do Google. Permita pop-ups para este site e tente novamente.'
      );
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new Error('Login com Google cancelado antes da conclusão.');
    }
    if (code === 'auth/unauthorized-domain') {
      throw new Error(
        'Domínio não autorizado no Firebase Authentication. Adicione este domínio nas configurações do console Firebase.'
      );
    }
    throw err instanceof Error ? err : new Error('Não foi possível conectar a conta Google.');
  }
}

export async function disconnectYouTubeGoogleAccount(): Promise<void> {
  memoryAccessToken = null;
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } catch {
    // Ignore sign-out errors
  }
}

interface YtPlaylistsResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      description?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: { itemCount?: number };
  }>;
}

interface YtPlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      videoOwnerChannelTitle?: string;
      channelTitle?: string;
      resourceId?: { videoId?: string };
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
      };
    };
  }>;
}

interface YtLikedVideosResponse {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
      };
    };
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
  }>;
}

async function fetchAuthorizedYouTubeJson<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `YouTube API HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed?.error?.message) msg = parsed.error.message;
    } catch {
      // Keep status message
    }
    if (res.status === 401) {
      memoryAccessToken = null;
    }
    throw new Error(msg);
  }
  return JSON.parse(text) as T;
}

export async function fetchUserYouTubePlaylists(accessToken: string): Promise<Playlist[]> {
  const listData = await fetchAuthorizedYouTubeJson<YtPlaylistsResponse>(
    'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=8',
    accessToken
  );

  const rawPlaylists = listData.items || [];
  const results: Playlist[] = [];

  for (const item of rawPlaylists) {
    const title = item.snippet?.title?.trim() || 'Playlist do YouTube';
    const cover =
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url;

    try {
      const itemsData = await fetchAuthorizedYouTubeJson<YtPlaylistItemsResponse>(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=15&playlistId=${encodeURIComponent(
          item.id
        )}`,
        accessToken
      );

      const tracks: Track[] = [];
      for (const entry of itemsData.items || []) {
        const videoId = entry.snippet?.resourceId?.videoId;
        const vidTitle = entry.snippet?.title?.trim();
        if (!videoId || !vidTitle || vidTitle === 'Deleted video' || vidTitle === 'Private video') {
          continue;
        }
        tracks.push({
          id: videoId,
          title: vidTitle,
          artist:
            entry.snippet?.videoOwnerChannelTitle ||
            entry.snippet?.channelTitle ||
            'YouTube',
          album: title,
          duration: 210,
          artwork:
            entry.snippet?.thumbnails?.high?.url ||
            entry.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          source: 'youtube-v3',
          verified: true,
        });
      }

      if (tracks.length > 0) {
        results.push({
          id: `yt-acc-${item.id}`,
          title,
          description: item.snippet?.description?.trim() || `Playlist importada da sua conta Google`,
          tracks,
          createdAt: Date.now(),
          coverArt: cover || tracks[0].artwork,
        });
      }
    } catch {
      // Skip unreadable playlist cleanly
    }
  }

  return results;
}

export async function fetchUserYouTubeLikedTracks(accessToken: string): Promise<Track[]> {
  const likedData = await fetchAuthorizedYouTubeJson<YtLikedVideosResponse>(
    'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&myRating=like&maxResults=25',
    accessToken
  );

  const tracks: Track[] = [];
  for (const item of likedData.items || []) {
    if (!item.id || !item.snippet?.title) continue;
    tracks.push({
      id: item.id,
      title: item.snippet.title.trim(),
      artist: item.snippet.channelTitle || 'YouTube',
      album: 'Curtidas do YouTube',
      duration: parseIsoDuration(item.contentDetails?.duration) || 210,
      artwork:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
      source: 'youtube-v3',
      views: Number(item.statistics?.viewCount || 0) || undefined,
      verified: true,
    });
  }
  return tracks;
}
