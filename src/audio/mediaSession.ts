import type { Track } from '../types/music';

interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeekTo: (time: number) => void;
  onSeekBy: (offset: number) => void;
}

export function initMediaSessionHandlers(callbacks: MediaSessionCallbacks) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  const ms = navigator.mediaSession;
  const safeSet = (action: MediaSessionAction, handler: MediaSessionActionHandler) => {
    try {
      ms.setActionHandler(action, handler);
    } catch {
      // Action not supported on current platform
    }
  };

  safeSet('play', () => callbacks.onPlay());
  safeSet('pause', () => callbacks.onPause());
  safeSet('previoustrack', () => callbacks.onPrevious());
  safeSet('nexttrack', () => callbacks.onNext());
  safeSet('seekto', (details) => {
    if (typeof details.seekTime === 'number') {
      callbacks.onSeekTo(details.seekTime);
    }
  });
  safeSet('seekbackward', (details) => {
    callbacks.onSeekBy(-(details.seekOffset ?? 10));
  });
  safeSet('seekforward', (details) => {
    callbacks.onSeekBy(details.seekOffset ?? 10);
  });
  safeSet('stop', () => callbacks.onPause());
}

export function updateMediaSessionMetadata(track: Track | null) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !track) return;

  try {
    const artworkUrl = track.artwork.startsWith('/')
      ? `${window.location.origin}${track.artwork}`
      : track.artwork;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'SonicMorph',
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });
  } catch {
    // Ignore MediaMetadata errors in unsupported browsers
  }
}

export function updateMediaSessionPlaybackState(isPlaying: boolean, position: number, duration: number) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  try {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    if ('setPositionState' in navigator.mediaSession && duration > 0 && Number.isFinite(duration)) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(Math.max(0, position), duration),
      });
    }
  } catch {
    // Ignore position state errors
  }
}
