import { create } from 'zustand';
import { audioEngine } from '../audio/audioEngine';
import { startNetworkMonitor } from '../services/networkMonitor';
import {
  clearAllOfflineStorage,
  deleteOfflineTrack,
  deleteSavedPlaylist,
  getStorageMetrics,
  listOfflineTracks,
  listSavedPlaylists,
  saveOfflineTrack,
  savePlaylistToStorage,
} from '../services/offlineStorage';
import {
  fetchSyncedLyrics,
  fetchTrackAudioBlob,
  fetchTrendingMusic,
  generateAiPlaylist,
  getSavedYouTubeApiKey,
  searchMusic,
  searchYouTubeDirectForAi,
  setSavedYouTubeApiKey,
} from '../services/streamingService';
import {
  connectYouTubeGoogleAccount,
  disconnectYouTubeGoogleAccount,
  fetchUserYouTubeLikedTracks,
  fetchUserYouTubePlaylists,
  getInMemoryYouTubeAccessToken,
  subscribeYouTubeAuthState,
  type YouTubeAuthProfile,
} from '../services/youtubeAuthService';
import type {
  AppSection,
  DownloadTask,
  HistoryEntry,
  OfflineTrackRecord,
  Playlist,
  RepeatMode,
  SponsorSegment,
  ThemeMode,
  Track,
  UIId,
} from '../types/music';
import {
  loadFavoritesFromStorage,
  loadHistoryFromStorage,
  normalizeArtistName,
  recordTrackPlay,
  saveFavoritesToStorage,
  saveHistoryToStorage,
  toggleFavoriteTrack,
} from '../utils/listeningHistory';
import {
  buildBackupPayload,
  clampLyricOffsetMs,
  computeSleepFadeMultiplier,
  loadPreferencesFromStorage,
  loadTrackLyricOffset,
  parseAndValidateBackup,
  reorderListItem,
  sanitizePreferences,
  savePreferencesToStorage,
  saveTrackLyricOffset,
  type AppPreferences,
  type AudioFxSettings,
  type SleepTimerOption,
} from '../utils/settingsAndFx';

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }
}

function getInitialThemeMode(): ThemeMode {
  try {
    const saved = localStorage.getItem('sonicmorph_theme');
    if (saved === 'light' || saved === 'dark') {
      applyThemeToDocument(saved);
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  applyThemeToDocument('dark');
  return 'dark';
}

interface AppState {
  // UI & Navigation
  activeUI: UIId;
  themeMode: ThemeMode;
  activeSection: AppSection;
  isPlayerExpanded: boolean;
  isUISwitcherOpen: boolean;
  isLyricsOpen: boolean;
  selectedArtist: { name: string; artwork?: string } | null;

  // Extended Features & Modals
  preferences: AppPreferences;
  sleepTimerMode: SleepTimerOption;
  sleepRemainingSec: number | null;
  showVideoMode: boolean;
  isAudioFxOpen: boolean;
  isQueueModalOpen: boolean;
  isSpicyFullscreen: boolean;
  isYtPremiumModalOpen: boolean;

  // YouTube Account OAuth (token kept strictly in memory)
  ytAuthUser: YouTubeAuthProfile | null;
  ytHasAccessToken: boolean;
  ytAuthLoading: boolean;
  ytAuthError: string | null;
  accountPlaylists: Playlist[];
  accountLikedTracks: Track[];

  // Network State
  isOnline: boolean;
  connectionType: string;
  statusBanner: string | null;

  // Coarse Player State
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  activeLyricsLrc: string | null;
  activeLyricOffsetMs: number;
  activeSponsorSegments: SponsorSegment[];
  sponsorBlockEnabled: boolean;
  skippedSponsorCount: number;
  isLoadingTrending: boolean;

  // Search & Catalog
  searchQuery: string;
  searchResults: Track[];
  searchSourceLabel: string;
  isSearching: boolean;

  // Library & Offline Downloads
  playlists: Playlist[];
  offlineTracks: OfflineTrackRecord[];
  downloadQueue: Record<string, DownloadTask>;
  storageUsedBytes: number;
  storageQuotaBytes: number | null;
  libraryTab: 'downloaded' | 'playlists';

  // AI Playlist Generator
  isGeneratingAi: boolean;
  aiError: string | null;
  lastAiPlaylist: Playlist | null;

  // Spotify Home History & Favorites (persisted)
  recentHistory: HistoryEntry[];
  favoriteTracks: Track[];

  // Actions
  bootstrap: () => () => void;
  loadTrendingHome: () => Promise<void>;
  setActiveUI: (id: UIId) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setActiveSection: (section: AppSection) => void;
  setPlayerExpanded: (expanded: boolean) => void;
  setUISwitcherOpen: (open: boolean) => void;
  setLyricsOpen: (open: boolean) => void;
  setStatusBanner: (msg: string | null) => void;
  setLibraryTab: (tab: 'downloaded' | 'playlists') => void;
  openArtistView: (name: string, artwork?: string) => void;
  closeArtistView: () => void;
  toggleFavorite: (track: Track) => void;

  // Preferences, Sleep Timer, Audio FX & Queue Management
  updatePreferences: (patch: Partial<AppPreferences>) => void;
  updateAudioFx: (patch: Partial<AudioFxSettings>) => void;
  setSleepTimer: (mode: SleepTimerOption) => void;
  setShowVideoMode: (show: boolean) => void;
  setAudioFxOpen: (open: boolean) => void;
  setQueueModalOpen: (open: boolean) => void;
  setSpicyFullscreen: (open: boolean) => void;
  setYtPremiumModalOpen: (open: boolean) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  removeFromQueue: (index: number) => void;
  setTrackLyricOffsetMs: (offsetMs: number) => void;
  nudgeTrackLyricOffsetMs: (deltaMs: number) => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonText: string) => Promise<void>;

  // YouTube Account OAuth
  connectYouTubeAccount: () => Promise<void>;
  disconnectYouTubeAccount: () => Promise<void>;
  refreshYouTubeAccountLibrary: () => Promise<void>;

  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
  toggleSponsorBlock: () => void;

  performSearch: (query: string) => Promise<void>;
  downloadTrack: (track: Track) => Promise<void>;
  downloadPlaylist: (playlist: Playlist) => Promise<void>;
  removeOfflineTrack: (trackId: string) => Promise<void>;
  clearOfflineCache: () => Promise<void>;
  refreshStorageStats: () => Promise<void>;

  createAiPlaylist: (prompt: string, trackCount: number) => Promise<void>;
  savePlaylist: (playlist: Playlist) => Promise<void>;
  removePlaylist: (playlistId: string) => Promise<void>;
}

let activeDownloadsCount = 0;
const MAX_CONCURRENT_DOWNLOADS = 2;
let sleepTimerInterval: number | null = null;

function clearSleepInterval() {
  if (sleepTimerInterval !== null) {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
  }
}

function dedupeTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  const out: Track[] = [];
  for (const track of tracks) {
    if (!track?.id || seen.has(track.id)) continue;
    seen.add(track.id);
    out.push(track);
  }
  return out;
}

function buildLiveTrendingPlaylists(tracks: Track[]): Playlist[] {
  if (tracks.length === 0) return [];
  const topByViews = [...tracks]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);
  const v3Tracks = tracks.filter((t) => t.source === 'youtube-v3').slice(0, 10);
  const mixes: Playlist[] = [];

  mixes.push({
    id: 'live-trending-mix',
    title: 'Em Alta no YouTube Music',
    description: 'Principais músicas oficiais tocando nas paradas globais do YouTube Music.',
    tracks: tracks.slice(0, 12),
    createdAt: Date.now(),
    coverArt: tracks[0]?.artwork,
  });

  if (topByViews.length > 0) {
    mixes.push({
      id: 'live-charts-popular',
      title: 'Sucessos Mais Ouvidos',
      description: 'Versões oficiais ordenadas por volume de reproduções.',
      tracks: topByViews,
      createdAt: Date.now() - 1000,
      coverArt: topByViews[0]?.artwork,
    });
  }

  if (v3Tracks.length > 0) {
    mixes.push({
      id: 'live-yt-v3-charts',
      title: 'YouTube Music Top Charts',
      description: 'Destaques musicais verificados via YouTube Data API v3.',
      tracks: v3Tracks,
      createdAt: Date.now() - 2000,
      coverArt: v3Tracks[0]?.artwork,
    });
  }

  return mixes;
}

export const useAppStore = create<AppState>((set, get) => {
  const processDownloadQueue = async () => {
    const state = get();
    if (!state.isOnline) {
      const updated = { ...state.downloadQueue };
      let changed = false;
      for (const id of Object.keys(updated)) {
        const task = updated[id];
        if (task.status === 'queued') {
          updated[id] = { ...task, status: 'paused_offline' };
          changed = true;
        }
      }
      if (changed) set({ downloadQueue: updated });
      return;
    }

    if (activeDownloadsCount >= MAX_CONCURRENT_DOWNLOADS) return;

    const nextTask = Object.values(state.downloadQueue).find(
      (t) => t.status === 'queued' || (t.status === 'paused_offline' && state.isOnline)
    );
    if (!nextTask) return;

    activeDownloadsCount++;
    set((s) => ({
      downloadQueue: {
        ...s.downloadQueue,
        [nextTask.trackId]: { ...nextTask, status: 'downloading', progress: 5 },
      },
    }));

    try {
      const [blob, lrc] = await Promise.all([
        fetchTrackAudioBlob(nextTask.track, (pct) => {
          set((s) => {
            const cur = s.downloadQueue[nextTask.trackId];
            if (!cur) return s;
            return {
              downloadQueue: {
                ...s.downloadQueue,
                [nextTask.trackId]: { ...cur, progress: pct },
              },
            };
          });
        }),
        nextTask.track.lyricsLrc
          ? Promise.resolve(nextTask.track.lyricsLrc)
          : fetchSyncedLyrics(nextTask.track),
      ]);

      await saveOfflineTrack(nextTask.track, blob, lrc ?? undefined);
      set((s) => ({
        downloadQueue: {
          ...s.downloadQueue,
          [nextTask.trackId]: {
            ...nextTask,
            status: 'downloaded',
            progress: 100,
            sizeBytes: blob.size,
          },
        },
      }));
      await get().refreshStorageStats();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no download';
      set((s) => ({
        downloadQueue: {
          ...s.downloadQueue,
          [nextTask.trackId]: {
            ...nextTask,
            status: get().isOnline ? 'error' : 'paused_offline',
            error: msg,
          },
        },
      }));
    } finally {
      activeDownloadsCount--;
      void processDownloadQueue();
    }
  };

  return {
    activeUI: 'modern-simpmusic-flow',
    themeMode: getInitialThemeMode(),
    activeSection: 'home',
    isPlayerExpanded: false,
    isUISwitcherOpen: false,
    isLyricsOpen: false,
    selectedArtist: null,

    preferences: loadPreferencesFromStorage(),
    sleepTimerMode: 'off',
    sleepRemainingSec: null,
    showVideoMode: false,
    isAudioFxOpen: false,
    isQueueModalOpen: false,
    isSpicyFullscreen: false,
    isYtPremiumModalOpen: false,

    ytAuthUser: null,
    ytHasAccessToken: false,
    ytAuthLoading: false,
    ytAuthError: null,
    accountPlaylists: [],
    accountLikedTracks: [],

    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'wifi',
    statusBanner: null,

    currentTrack: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    volume: 0.85,
    repeatMode: 'all',
    shuffle: false,
    activeLyricsLrc: null,
    activeLyricOffsetMs: 0,
    activeSponsorSegments: [],
    sponsorBlockEnabled: true,
    skippedSponsorCount: 0,
    isLoadingTrending: true,

    searchQuery: '',
    searchResults: [],
    searchSourceLabel: 'Carregando paradas...',
    isSearching: false,

    playlists: [],
    offlineTracks: [],
    downloadQueue: {},
    storageUsedBytes: 0,
    storageQuotaBytes: null,
    libraryTab: 'downloaded',

    isGeneratingAi: false,
    aiError: null,
    lastAiPlaylist: null,

    recentHistory: loadHistoryFromStorage(),
    favoriteTracks: loadFavoritesFromStorage(),

    loadTrendingHome: async () => {
      const st = get();
      if (!st.isOnline) {
        const offlineList = st.offlineTracks.map((r) => r.track);
        set({
          isLoadingTrending: false,
          queue: offlineList,
          searchResults: offlineList,
          searchSourceLabel: 'Modo Offline (Baixadas)',
          currentTrack: st.currentTrack || offlineList[0] || null,
        });
        return;
      }

      set({ isLoadingTrending: true });
      const res = await fetchTrendingMusic();
      const dedupedTracks = dedupeTracks(res.tracks);
      const livePlaylists = buildLiveTrendingPlaylists(dedupedTracks);
      const savedPlaylists = await listSavedPlaylists();
      const mergedPlaylists = [...savedPlaylists];
      for (const lp of livePlaylists) {
        if (!mergedPlaylists.some((p) => p.id === lp.id)) mergedPlaylists.push(lp);
      }

      set((s) => {
        const nextCurrent = s.currentTrack || dedupedTracks[0] || null;
        return {
          isLoadingTrending: false,
          queue: dedupedTracks.length > 0 ? dedupedTracks : s.queue,
          searchResults: dedupedTracks.length > 0 ? dedupedTracks : s.searchResults,
          searchSourceLabel: res.sourceLabel,
          playlists: mergedPlaylists,
          currentTrack: nextCurrent,
          activeLyricOffsetMs: s.currentTrack
            ? s.activeLyricOffsetMs
            : loadTrackLyricOffset(nextCurrent?.id),
          queueIndex: s.currentTrack ? s.queueIndex : 0,
        };
      });
    },

    bootstrap: () => {
      try {
        const savedUI = localStorage.getItem('sonicmorph_ui') as UIId | null;
        if (savedUI) set({ activeUI: savedUI });
        const savedTheme = localStorage.getItem('sonicmorph_theme') as ThemeMode | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          applyThemeToDocument(savedTheme);
          set({ themeMode: savedTheme });
        } else {
          applyThemeToDocument(get().themeMode);
        }
      } catch {
        // Ignore storage errors
      }

      const prefs = get().preferences;
      audioEngine.setVolume(get().volume);
      audioEngine.setSponsorBlockEnabled(get().sponsorBlockEnabled);
      audioEngine.setSmoothFade(prefs.smoothFade);
      audioEngine.setCrossfadeSeconds(prefs.crossfadeSeconds);
      audioEngine.setAudioFx(prefs.audioFx);

      audioEngine.init({
        onTrackEnded: () => {
          const st = get();
          if (st.sleepTimerMode === 'end_of_track') {
            clearSleepInterval();
            audioEngine.setSleepVolumeMultiplier(1);
            set({
              isPlaying: false,
              sleepTimerMode: 'off',
              sleepRemainingSec: null,
              statusBanner: 'Sleep Timer encerrado ao fim desta música',
            });
            return;
          }

          if (st.repeatMode === 'one' && st.currentTrack) {
            if (!audioEngine.hasSource()) {
              void audioEngine.loadAndPlay(st.currentTrack, true, st.isOnline);
            } else {
              audioEngine.seek(0);
              void audioEngine.play();
            }
            return;
          }

          if (!st.preferences.keepAlbumContinuous) {
            audioEngine.seek(0);
            set({ isPlaying: false });
            return;
          }

          if (st.queue.length === 0) {
            set({ isPlaying: false });
            return;
          }

          if (st.repeatMode === 'off' && !st.shuffle && st.queueIndex >= st.queue.length - 1) {
            audioEngine.seek(0);
            set({ isPlaying: false });
            return;
          }

          void st.nextTrack();
        },
        onCrossfadeNext: () => {
          const st = get();
          if (st.sleepTimerMode === 'end_of_track') return;
          if (!st.preferences.keepAlbumContinuous) return;
          if (st.repeatMode === 'one') return;
          void st.nextTrack();
        },
        onNext: () => void get().nextTrack(),
        onPrevious: () => void get().prevTrack(),
        onPlayStateChange: (playing) => set({ isPlaying: playing }),
        onTrackMetadataLoaded: (trackId, lyricsLrc, segments) => {
          if (get().currentTrack?.id === trackId) {
            set({
              activeLyricsLrc: lyricsLrc,
              activeSponsorSegments: segments,
            });
          }
        },
        onSponsorSkipped: (label) => {
          set((s) => ({
            skippedSponsorCount: s.skippedSponsorCount + 1,
            statusBanner: `SponsorBlock: ${label} pulado automaticamente`,
          }));
          setTimeout(() => {
            if (get().statusBanner?.startsWith('SponsorBlock:')) {
              set({ statusBanner: null });
            }
          }, 3200);
        },
        onStreamError: (msg) => {
          set({ statusBanner: msg });
          setTimeout(() => {
            if (get().statusBanner === msg) set({ statusBanner: null });
          }, 4000);
        },
      });

      const stopAuthSub = subscribeYouTubeAuthState((profile, hasAccessToken) => {
        set((s) => ({
          ytAuthUser: profile,
          ytHasAccessToken: hasAccessToken,
          accountPlaylists: profile ? s.accountPlaylists : [],
          accountLikedTracks: profile ? s.accountLikedTracks : [],
        }));
      });

      void get()
        .refreshStorageStats()
        .then(() => get().loadTrendingHome());

      let initializedNet = false;
      const stopNet = startNetworkMonitor((online, connType) => {
        const prevOnline = get().isOnline;
        set({ isOnline: online, connectionType: connType });

        if (initializedNet && prevOnline !== online) {
          if (!online) {
            const offlineList = get().offlineTracks.map((r) => r.track);
            set({
              libraryTab: 'downloaded',
              searchResults: offlineList,
              searchSourceLabel: 'Modo Offline (Baixadas)',
              statusBanner: 'Sem conexão — Modo Offline ativado (exibindo Baixadas)',
            });
            void processDownloadQueue();
          } else {
            set({
              statusBanner: 'Conexão restaurada — Streaming, IA e downloads retomados',
            });
            setTimeout(() => {
              if (get().statusBanner?.startsWith('Conexão restaurada')) {
                set({ statusBanner: null });
              }
            }, 3500);
            set((s) => {
              const nextQ = { ...s.downloadQueue };
              for (const id of Object.keys(nextQ)) {
                if (nextQ[id].status === 'paused_offline') {
                  nextQ[id] = { ...nextQ[id], status: 'queued' };
                }
              }
              return { downloadQueue: nextQ };
            });
            void processDownloadQueue();
            void get().loadTrendingHome();
          }
        }
        initializedNet = true;
      });

      return () => {
        stopNet();
        stopAuthSub();
        clearSleepInterval();
      };
    },

    setActiveUI: (id) => {
      try {
        localStorage.setItem('sonicmorph_ui', id);
      } catch {
        // Ignore
      }
      set({ activeUI: id, isUISwitcherOpen: false });
    },

    setThemeMode: (mode) => {
      applyThemeToDocument(mode);
      try {
        localStorage.setItem('sonicmorph_theme', mode);
      } catch {
        // Ignore
      }
      set({ themeMode: mode });
    },

    toggleThemeMode: () => {
      const next: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
      get().setThemeMode(next);
    },

    setActiveSection: (section) => {
      const st = get();
      if (section === 'library' && !st.isOnline) {
        set({ activeSection: section, libraryTab: 'downloaded', isPlayerExpanded: false });
      } else {
        set({ activeSection: section, isPlayerExpanded: false });
      }
    },

    setPlayerExpanded: (expanded) =>
      set((s) => ({
        isPlayerExpanded: expanded,
        showVideoMode: expanded ? s.showVideoMode : false,
      })),
    setUISwitcherOpen: (open) => set({ isUISwitcherOpen: open }),
    setLyricsOpen: (open) => set({ isLyricsOpen: open }),
    setStatusBanner: (msg) => set({ statusBanner: msg }),
    setLibraryTab: (tab) => set({ libraryTab: tab }),
    openArtistView: (name, artwork) =>
      set({
        selectedArtist: {
          name: normalizeArtistName(name) || name,
          artwork,
        },
      }),
    closeArtistView: () => set({ selectedArtist: null }),
    toggleFavorite: (track) => {
      const nextFavs = toggleFavoriteTrack(get().favoriteTracks, track);
      saveFavoritesToStorage(nextFavs);
      set({ favoriteTracks: nextFavs });
    },

    updatePreferences: (patch) => {
      const next = sanitizePreferences({ ...get().preferences, ...patch });
      savePreferencesToStorage(next);
      audioEngine.setSmoothFade(next.smoothFade);
      audioEngine.setCrossfadeSeconds(next.crossfadeSeconds);
      audioEngine.setAudioFx(next.audioFx);
      set({ preferences: next });
    },

    updateAudioFx: (patch) => {
      const cur = get().preferences;
      const nextFx: AudioFxSettings = { ...cur.audioFx, ...patch };
      const next = sanitizePreferences({ ...cur, audioFx: nextFx });
      savePreferencesToStorage(next);
      audioEngine.setAudioFx(next.audioFx);
      set({ preferences: next });
    },

    setSleepTimer: (mode) => {
      clearSleepInterval();
      audioEngine.setSleepVolumeMultiplier(1);

      if (mode === 'off') {
        set({ sleepTimerMode: 'off', sleepRemainingSec: null });
        return;
      }

      if (mode === 'end_of_track') {
        set({
          sleepTimerMode: 'end_of_track',
          sleepRemainingSec: null,
          statusBanner: 'Sleep Timer: pausará ao fim desta música',
        });
        return;
      }

      const minutes = Number(mode);
      const totalSec = Math.max(60, Math.round(minutes * 60));
      set({
        sleepTimerMode: mode,
        sleepRemainingSec: totalSec,
        statusBanner: `Sleep Timer ativado para ${minutes} minutos`,
      });

      sleepTimerInterval = window.setInterval(() => {
        const st = get();
        if (st.sleepTimerMode === 'off' || st.sleepRemainingSec === null) {
          clearSleepInterval();
          return;
        }
        const nextSec = st.sleepRemainingSec - 1;
        const mult = computeSleepFadeMultiplier(nextSec);
        audioEngine.setSleepVolumeMultiplier(mult);

        if (nextSec <= 0) {
          clearSleepInterval();
          audioEngine.pause();
          audioEngine.setSleepVolumeMultiplier(1);
          set({
            sleepTimerMode: 'off',
            sleepRemainingSec: null,
            isPlaying: false,
            statusBanner: 'Sleep Timer encerrado — áudio pausado suavemente',
          });
          return;
        }
        set({ sleepRemainingSec: nextSec });
      }, 1000);
    },

    setShowVideoMode: (show) => set({ showVideoMode: show }),
    setAudioFxOpen: (open) => set({ isAudioFxOpen: open }),
    setQueueModalOpen: (open) => set({ isQueueModalOpen: open }),
    setSpicyFullscreen: (open) => set({ isSpicyFullscreen: open }),
    setYtPremiumModalOpen: (open) => set({ isYtPremiumModalOpen: open }),

    reorderQueue: (fromIndex, toIndex) => {
      const st = get();
      if (fromIndex === toIndex || st.queue.length < 2) return;
      const currentId = st.currentTrack?.id;
      const nextQueue = reorderListItem(st.queue, fromIndex, toIndex);
      const nextIdx = currentId
        ? Math.max(0, nextQueue.findIndex((t) => t.id === currentId))
        : st.queueIndex;
      set({ queue: nextQueue, queueIndex: nextIdx });
    },

    removeFromQueue: (index) => {
      const st = get();
      if (index < 0 || index >= st.queue.length) return;
      const nextQueue = st.queue.filter((_, idx) => idx !== index);
      if (nextQueue.length === 0) {
        set({ queue: [], queueIndex: 0 });
        return;
      }
      const currentId = st.currentTrack?.id;
      let nextIdx = currentId ? nextQueue.findIndex((t) => t.id === currentId) : -1;
      if (nextIdx === -1) {
        nextIdx = Math.min(index, nextQueue.length - 1);
      }
      set({ queue: nextQueue, queueIndex: nextIdx });
    },

    setTrackLyricOffsetMs: (offsetMs) => {
      const trackId = get().currentTrack?.id;
      const clamped = saveTrackLyricOffset(trackId, offsetMs);
      set({ activeLyricOffsetMs: clamped });
    },

    nudgeTrackLyricOffsetMs: (deltaMs) => {
      const nextMs = clampLyricOffsetMs(get().activeLyricOffsetMs + deltaMs);
      const trackId = get().currentTrack?.id;
      const saved = saveTrackLyricOffset(trackId, nextMs);
      set({ activeLyricOffsetMs: saved });
    },

    exportBackupJson: () => {
      const st = get();
      const payload = buildBackupPayload({
        activeUI: st.activeUI,
        themeMode: st.themeMode,
        sponsorBlockEnabled: st.sponsorBlockEnabled,
        youtubeApiKey: getSavedYouTubeApiKey(),
        preferences: st.preferences,
        recentHistory: st.recentHistory,
        favoriteTracks: st.favoriteTracks,
        playlists: st.playlists,
      });
      return JSON.stringify(payload, null, 2);
    },

    importBackupJson: async (jsonText) => {
      const data = parseAndValidateBackup(jsonText);
      applyThemeToDocument(data.themeMode);
      try {
        localStorage.setItem('sonicmorph_ui', data.activeUI);
        localStorage.setItem('sonicmorph_theme', data.themeMode);
      } catch {
        // Ignore
      }
      if (data.youtubeApiKey !== undefined) {
        setSavedYouTubeApiKey(data.youtubeApiKey);
      }
      savePreferencesToStorage(data.preferences);
      saveHistoryToStorage(data.recentHistory);
      saveFavoritesToStorage(data.favoriteTracks);

      for (const pl of data.savedPlaylists) {
        await savePlaylistToStorage(pl);
      }
      const savedList = await listSavedPlaylists();
      const currentLive = get().playlists.filter((p) => p.id.startsWith('live-'));
      const merged = [...savedList];
      for (const lp of currentLive) {
        if (!merged.some((p) => p.id === lp.id)) merged.push(lp);
      }

      audioEngine.setSponsorBlockEnabled(data.sponsorBlockEnabled);
      audioEngine.setSmoothFade(data.preferences.smoothFade);
      audioEngine.setCrossfadeSeconds(data.preferences.crossfadeSeconds);
      audioEngine.setAudioFx(data.preferences.audioFx);

      set({
        activeUI: data.activeUI,
        themeMode: data.themeMode,
        sponsorBlockEnabled: data.sponsorBlockEnabled,
        preferences: data.preferences,
        recentHistory: data.recentHistory,
        favoriteTracks: data.favoriteTracks,
        playlists: merged,
        statusBanner: `Backup restaurado (${data.savedPlaylists.length} playlists, ${data.recentHistory.length} histórico)`,
      });
    },

    connectYouTubeAccount: async () => {
      set({ ytAuthLoading: true, ytAuthError: null });
      try {
        const { profile, accessToken } = await connectYouTubeGoogleAccount();
        const [accPlaylists, accLiked] = await Promise.all([
          fetchUserYouTubePlaylists(accessToken).catch(() => []),
          fetchUserYouTubeLikedTracks(accessToken).catch(() => []),
        ]);
        set({
          ytAuthUser: profile,
          ytHasAccessToken: true,
          ytAuthLoading: false,
          ytAuthError: null,
          accountPlaylists: accPlaylists,
          accountLikedTracks: accLiked,
          statusBanner: `Conta Google conectada: ${accPlaylists.length} playlists e ${accLiked.length} curtidas importadas`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao conectar com o Google.';
        set({ ytAuthLoading: false, ytAuthError: msg });
      }
    },

    disconnectYouTubeAccount: async () => {
      await disconnectYouTubeGoogleAccount();
      set({
        ytAuthUser: null,
        ytHasAccessToken: false,
        ytAuthError: null,
        accountPlaylists: [],
        accountLikedTracks: [],
        statusBanner: 'Conta Google desconectada',
      });
    },

    refreshYouTubeAccountLibrary: async () => {
      const token = getInMemoryYouTubeAccessToken();
      if (!token) {
        set({
          ytHasAccessToken: false,
          ytAuthError:
            'Sessão OAuth em memória expirada após recarregar. Toque em Reconectar Google para atualizar suas playlists.',
        });
        return;
      }
      set({ ytAuthLoading: true, ytAuthError: null });
      try {
        const [accPlaylists, accLiked] = await Promise.all([
          fetchUserYouTubePlaylists(token),
          fetchUserYouTubeLikedTracks(token),
        ]);
        set({
          ytAuthLoading: false,
          accountPlaylists: accPlaylists,
          accountLikedTracks: accLiked,
          statusBanner: `Biblioteca YouTube atualizada (${accPlaylists.length} playlists)`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao sincronizar biblioteca YouTube.';
        set({ ytAuthLoading: false, ytAuthError: msg });
      }
    },

    playTrack: async (track, newQueue) => {
      const st = get();
      const baseQueue = dedupeTracks(newQueue && newQueue.length > 0 ? newQueue : st.queue);
      let idx = baseQueue.findIndex((t) => t.id === track.id);
      let finalQueue = baseQueue;
      if (idx === -1) {
        finalQueue = [track, ...baseQueue];
        idx = 0;
      }

      const nextHistory = recordTrackPlay(st.recentHistory, track);
      saveHistoryToStorage(nextHistory);

      set({
        currentTrack: track,
        queue: finalQueue,
        queueIndex: idx,
        activeLyricsLrc: track.lyricsLrc || null,
        activeLyricOffsetMs: loadTrackLyricOffset(track.id),
        activeSponsorSegments: track.sponsorSegments || [],
        recentHistory: nextHistory,
      });

      await audioEngine.loadAndPlay(track, true, st.isOnline);
    },

    togglePlay: () => {
      const st = get();
      if (st.isPlaying) {
        audioEngine.pause();
      } else if (!audioEngine.hasSource() && st.currentTrack) {
        void audioEngine.loadAndPlay(st.currentTrack, true, st.isOnline);
      } else {
        void audioEngine.play();
      }
    },

    nextTrack: async () => {
      const st = get();
      if (st.queue.length === 0) return;

      const offlineSet = new Set(st.offlineTracks.map((r) => r.id));
      const isPlayable = (t: Track) => st.isOnline || offlineSet.has(t.id);

      let nextIdx = st.queueIndex;
      let foundPlayable = false;

      if (st.shuffle && st.queue.length > 1) {
        const candidates = st.queue
          .map((t, i) => ({ t, i }))
          .filter(({ t, i }) => i !== st.queueIndex && isPlayable(t));
        if (candidates.length > 0) {
          nextIdx = candidates[Math.floor(Math.random() * candidates.length)].i;
          foundPlayable = true;
        }
      }

      if (!foundPlayable) {
        for (let step = 1; step <= st.queue.length; step++) {
          const candidateIdx = (st.queueIndex + step) % st.queue.length;
          if (isPlayable(st.queue[candidateIdx])) {
            nextIdx = candidateIdx;
            foundPlayable = true;
            break;
          }
        }
      }

      const next = foundPlayable ? st.queue[nextIdx] : undefined;
      if (!next) {
        set({ isPlaying: false });
        return;
      }

      const nextHistory = recordTrackPlay(st.recentHistory, next);
      saveHistoryToStorage(nextHistory);

      set({
        currentTrack: next,
        queueIndex: nextIdx,
        activeLyricsLrc: next.lyricsLrc || null,
        activeLyricOffsetMs: loadTrackLyricOffset(next.id),
        activeSponsorSegments: next.sponsorSegments || [],
        recentHistory: nextHistory,
      });
      await audioEngine.loadAndPlay(next, true, st.isOnline);
    },

    prevTrack: async () => {
      const st = get();
      if (st.queue.length === 0) return;

      const offlineSet = new Set(st.offlineTracks.map((r) => r.id));
      const isPlayable = (t: Track) => st.isOnline || offlineSet.has(t.id);

      let prevIdx = st.queueIndex;
      let foundPlayable = false;
      for (let step = 1; step <= st.queue.length; step++) {
        const candidateIdx = (st.queueIndex - step + st.queue.length) % st.queue.length;
        if (isPlayable(st.queue[candidateIdx])) {
          prevIdx = candidateIdx;
          foundPlayable = true;
          break;
        }
      }

      const prev = foundPlayable ? st.queue[prevIdx] : undefined;
      if (!prev) return;

      const nextHistory = recordTrackPlay(st.recentHistory, prev);
      saveHistoryToStorage(nextHistory);

      set({
        currentTrack: prev,
        queueIndex: prevIdx,
        activeLyricsLrc: prev.lyricsLrc || null,
        activeLyricOffsetMs: loadTrackLyricOffset(prev.id),
        activeSponsorSegments: prev.sponsorSegments || [],
        recentHistory: nextHistory,
      });
      await audioEngine.loadAndPlay(prev, true, st.isOnline);
    },

    seekTo: (time) => audioEngine.seek(time),

    setVolume: (vol) => {
      const clamped = Math.max(0, Math.min(1, vol));
      audioEngine.setVolume(clamped);
      set({ volume: clamped });
    },

    cycleRepeatMode: () => {
      const order: RepeatMode[] = ['off', 'all', 'one'];
      const cur = get().repeatMode;
      set({ repeatMode: order[(order.indexOf(cur) + 1) % order.length] });
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

    toggleSponsorBlock: () => {
      const next = !get().sponsorBlockEnabled;
      audioEngine.setSponsorBlockEnabled(next);
      set({ sponsorBlockEnabled: next });
    },

    performSearch: async (query) => {
      const st = get();
      set({ searchQuery: query, isSearching: true });

      if (!st.isOnline) {
        const lower = query.trim().toLowerCase();
        const offlineMatches = st.offlineTracks
          .map((r) => r.track)
          .filter(
            (t) =>
              !lower ||
              t.title.toLowerCase().includes(lower) ||
              t.artist.toLowerCase().includes(lower)
          );
        set({
          searchResults: offlineMatches,
          searchSourceLabel: 'Modo Offline (Baixadas)',
          isSearching: false,
        });
        return;
      }

      const res = await searchMusic(query);
      set({
        searchResults: res.tracks,
        searchSourceLabel: res.sourceLabel,
        isSearching: false,
      });
    },

    downloadTrack: async (track) => {
      const existing = get().offlineTracks.some((r) => r.id === track.id);
      if (existing) return;

      set((s) => ({
        downloadQueue: {
          ...s.downloadQueue,
          [track.id]: {
            trackId: track.id,
            track,
            status: s.isOnline ? 'queued' : 'paused_offline',
            progress: 0,
          },
        },
      }));
      void processDownloadQueue();
    },

    downloadPlaylist: async (playlist) => {
      const offlineIds = new Set(get().offlineTracks.map((r) => r.id));
      const isOnline = get().isOnline;
      const additions: Record<string, DownloadTask> = {};

      for (const track of playlist.tracks) {
        if (!offlineIds.has(track.id)) {
          additions[track.id] = {
            trackId: track.id,
            track,
            status: isOnline ? 'queued' : 'paused_offline',
            progress: 0,
          };
        }
      }

      if (Object.keys(additions).length === 0) return;
      set((s) => ({
        downloadQueue: { ...s.downloadQueue, ...additions },
      }));
      void processDownloadQueue();
    },

    removeOfflineTrack: async (trackId) => {
      await deleteOfflineTrack(trackId);
      set((s) => {
        const nextQ = { ...s.downloadQueue };
        delete nextQ[trackId];
        return { downloadQueue: nextQ };
      });
      await get().refreshStorageStats();
    },

    clearOfflineCache: async () => {
      await clearAllOfflineStorage();
      set({ downloadQueue: {} });
      await get().refreshStorageStats();
    },

    refreshStorageStats: async () => {
      const [records, metrics] = await Promise.all([listOfflineTracks(), getStorageMetrics()]);
      set({
        offlineTracks: records,
        storageUsedBytes: metrics.usedBytes,
        storageQuotaBytes: metrics.quotaBytes,
      });
    },

    createAiPlaylist: async (prompt, trackCount) => {
      if (!get().isOnline) {
        set({ aiError: 'Você está offline. Conecte-se para gerar playlists com IA.' });
        return;
      }
      set({ isGeneratingAi: true, aiError: null });

      try {
        const generated = await generateAiPlaylist(prompt, trackCount);

        const resolvedTracks: Track[] = [];
        let lastSearchError: string | null = null;
        const batchSize = 4;
        for (let i = 0; i < generated.tracks.length; i += batchSize) {
          const batch = generated.tracks.slice(i, i + batchSize);
          const batchResults = await Promise.allSettled(
            batch.map((item) => searchYouTubeDirectForAi(`${item.title} ${item.artist}`))
          );
          for (const outcome of batchResults) {
            if (outcome.status === 'fulfilled') {
              if (outcome.value[0]) {
                resolvedTracks.push(outcome.value[0]);
              }
            } else {
              lastSearchError =
                outcome.reason instanceof Error
                  ? outcome.reason.message
                  : String(outcome.reason);
            }
          }
        }

        const uniqueTracks = dedupeTracks(resolvedTracks);
        if (uniqueTracks.length === 0) {
          throw new Error(
            lastSearchError || 'Nenhuma faixa real encontrada no YouTube para os termos gerados.'
          );
        }

        const playlist: Playlist = {
          id: `pl-ai-${Date.now()}`,
          title: generated.title,
          description: generated.description,
          tracks: uniqueTracks,
          createdAt: Date.now(),
          isAiGenerated: true,
          coverArt: uniqueTracks[0]?.artwork,
        };

        set({
          lastAiPlaylist: playlist,
          isGeneratingAi: false,
          aiError: null,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao gerar playlist por IA.';
        set({ isGeneratingAi: false, aiError: msg });
      }
    },

    savePlaylist: async (playlist) => {
      await savePlaylistToStorage(playlist);
      set((s) => {
        const filtered = s.playlists.filter((p) => p.id !== playlist.id);
        return { playlists: [playlist, ...filtered] };
      });
    },

    removePlaylist: async (playlistId) => {
      await deleteSavedPlaylist(playlistId);
      set((s) => ({
        playlists: s.playlists.filter((p) => p.id !== playlistId),
      }));
    },
  };
});
