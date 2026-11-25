/**
 * Official YouTube IFrame Player API singleton (`https://www.youtube.com/iframe_api`).
 * Mounted in a single off-screen 1px x 1px container to guarantee zero overlapping playback.
 */

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YtPlayerStateValue = (typeof YT_STATE)[keyof typeof YT_STATE] | number;

interface YtPlayerInstance {
  loadVideoById: (arg: string | { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (arg: string | { videoId: string; startSeconds?: number }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YtApiGlobal {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      width?: number | string;
      height?: number | string;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YtPlayerInstance }) => void;
        onStateChange?: (event: { data: number; target: YtPlayerInstance }) => void;
        onError?: (event: { data: number; target: YtPlayerInstance }) => void;
      };
    }
  ) => YtPlayerInstance;
}

declare global {
  interface Window {
    YT?: YtApiGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YouTubePlayerCallbacks {
  onStateChange: (state: number) => void;
  onError: (errorCode: number) => void;
  onReady?: () => void;
}

const GLOBAL_YT_PLAYER_KEY = '__sonicMorphYtPlayer';
const GLOBAL_YT_DISPATCH_KEY = '__sonicMorphYtDispatch';
const CONTAINER_ID = 'sonicmorph-yt-hidden-player';

let apiLoadPromise: Promise<YtApiGlobal> | null = null;

function ensureHiddenContainer(): HTMLElement {
  let host = document.getElementById(CONTAINER_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = CONTAINER_ID;
    host.setAttribute('aria-hidden', 'true');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.style.top = '-9999px';
    host.style.width = '1px';
    host.style.height = '1px';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    host.style.overflow = 'hidden';
    const mount = document.createElement('div');
    mount.id = `${CONTAINER_ID}-frame`;
    host.appendChild(mount);
    document.body.appendChild(host);
  }
  const inner = document.getElementById(`${CONTAINER_ID}-frame`);
  return inner || host;
}

function loadYouTubeIframeApi(): Promise<YtApiGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window unavailable'));
  }
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise<YtApiGlobal>((resolve, reject) => {
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') prevReady();
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error('YouTube IFrame API failed to expose YT.Player'));
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        apiLoadPromise = null;
        reject(new Error('Falha ao carregar YouTube IFrame Player API'));
      };
      document.head.appendChild(script);
    }
  });

  return apiLoadPromise;
}

class YouTubePlayerService {
  private player: YtPlayerInstance | null = null;
  private isReady = false;
  private readyPromise: Promise<YtPlayerInstance> | null = null;
  private callbacks: YouTubePlayerCallbacks | null = null;
  private volume = 0.85;
  private activeVideoId: string | null = null;

  init(callbacks: YouTubePlayerCallbacks) {
    this.callbacks = callbacks;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const g = globalThis as Record<string, unknown>;
    g[GLOBAL_YT_DISPATCH_KEY] = {
      onReady: () => {
        this.isReady = true;
        this.player?.setVolume(Math.round(this.volume * 100));
        this.callbacks?.onReady?.();
      },
      onStateChange: (state: number) => {
        this.callbacks?.onStateChange(state);
      },
      onError: (code: number) => {
        this.callbacks?.onError(code);
      },
    };

    const existing = g[GLOBAL_YT_PLAYER_KEY] as YtPlayerInstance | undefined;
    if (existing) {
      this.player = existing;
      this.isReady = true;
      this.readyPromise = Promise.resolve(existing);
    }
  }

  private async ensurePlayer(): Promise<YtPlayerInstance> {
    if (this.player && this.isReady) return this.player;
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = (async () => {
      const YT = await loadYouTubeIframeApi();
      const mountEl = ensureHiddenContainer();

      return await new Promise<YtPlayerInstance>((resolve) => {
        const instance = new YT.Player(mountEl, {
          width: 1,
          height: 1,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (ev) => {
              this.player = ev.target;
              this.isReady = true;
              (globalThis as Record<string, unknown>)[GLOBAL_YT_PLAYER_KEY] = ev.target;
              ev.target.setVolume(Math.round(this.volume * 100));
              const d = (globalThis as Record<string, unknown>)[GLOBAL_YT_DISPATCH_KEY] as
                | { onReady?: () => void }
                | undefined;
              d?.onReady?.();
              resolve(ev.target);
            },
            onStateChange: (ev) => {
              const d = (globalThis as Record<string, unknown>)[GLOBAL_YT_DISPATCH_KEY] as
                | { onStateChange?: (state: number) => void }
                | undefined;
              d?.onStateChange?.(ev.data);
            },
            onError: (ev) => {
              const d = (globalThis as Record<string, unknown>)[GLOBAL_YT_DISPATCH_KEY] as
                | { onError?: (code: number) => void }
                | undefined;
              d?.onError?.(ev.data);
            },
          },
        });
        this.player = instance;
        (globalThis as Record<string, unknown>)[GLOBAL_YT_PLAYER_KEY] = instance;
      });
    })().catch((err) => {
      this.readyPromise = null;
      throw err;
    });

    return this.readyPromise;
  }

  async loadAndPlay(videoId: string, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return;
    this.activeVideoId = videoId;

    // Immediately silence previous playback before awaiting API initialization
    if (this.player && this.isReady) {
      try {
        this.player.stopVideo();
      } catch {
        // Ignore if uninitialized
      }
    }

    const player = await this.ensurePlayer();
    if (signal?.aborted || this.activeVideoId !== videoId) return;

    try {
      player.stopVideo();
    } catch {
      // Ignore
    }
    player.setVolume(Math.round(this.volume * 100));
    player.loadVideoById({ videoId, startSeconds: 0 });
  }

  play() {
    if (!this.player || !this.isReady) return;
    try {
      this.player.playVideo();
    } catch {
      // Ignore
    }
  }

  pause() {
    if (!this.player || !this.isReady) return;
    try {
      this.player.pauseVideo();
    } catch {
      // Ignore
    }
  }

  stop() {
    this.activeVideoId = null;
    if (!this.player || !this.isReady) return;
    try {
      this.player.stopVideo();
    } catch {
      // Ignore
    }
  }

  seekTo(seconds: number) {
    if (!this.player || !this.isReady) return;
    try {
      this.player.seekTo(Math.max(0, seconds), true);
    } catch {
      // Ignore
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.player && this.isReady) {
      try {
        this.player.setVolume(Math.round(this.volume * 100));
      } catch {
        // Ignore
      }
    }
  }

  getCurrentTime(): number {
    if (!this.player || !this.isReady) return 0;
    try {
      const t = this.player.getCurrentTime();
      return Number.isFinite(t) && t >= 0 ? t : 0;
    } catch {
      return 0;
    }
  }

  getDuration(): number {
    if (!this.player || !this.isReady) return 0;
    try {
      const d = this.player.getDuration();
      return Number.isFinite(d) && d > 0 ? d : 0;
    } catch {
      return 0;
    }
  }

  getPlayerState(): number {
    if (!this.player || !this.isReady) return YT_STATE.UNSTARTED;
    try {
      return this.player.getPlayerState();
    } catch {
      return YT_STATE.UNSTARTED;
    }
  }

  hasActiveTrack(): boolean {
    return Boolean(this.activeVideoId);
  }

  attachVideoHost(hostEl: HTMLElement | null) {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(CONTAINER_ID);
    const frame = document.getElementById(`${CONTAINER_ID}-frame`) || container;
    if (!frame) return;

    if (hostEl) {
      frame.style.width = '100%';
      frame.style.height = '100%';
      const iframe = frame.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
      }
      if (frame.parentElement !== hostEl) {
        hostEl.innerHTML = '';
        hostEl.appendChild(frame);
      }
    } else if (container) {
      frame.style.width = '1px';
      frame.style.height = '1px';
      const iframe = frame.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '1px';
        iframe.style.height = '1px';
      }
      if (frame.parentElement !== container) {
        container.appendChild(frame);
      }
    }
  }
}

export const youtubePlayerService = new YouTubePlayerService();
