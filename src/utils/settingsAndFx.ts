import type { HistoryEntry, Playlist, ThemeMode, Track, UIId } from '../types/music';

export type PerformanceMode = 'full' | 'battery';
export type SleepTimerOption = 'off' | '15' | '30' | '45' | '60' | 'end_of_track';
export type EqPresetId = 'flat' | 'bass_boost' | 'rock' | 'pop' | 'electronic' | 'vocal';
export type LiquidGlassLevel = 'off' | 'basic' | 'medium' | 'high';

export interface AudioFxSettings {
  enabled: boolean;
  eqPreset: EqPresetId;
  eqBands: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz (-12..+12 dB)
  spatial8dEnabled: boolean;
  spatial8dSpeed: number; // Hz: 0.05..0.6
  reverbMix: number; // 0..1
  delayMix: number; // 0..1
  normalizerEnabled: boolean;
}

export interface AppPreferences {
  liquidGlass: LiquidGlassLevel;
  spicyLyrics: boolean;
  ambientGlow: boolean;
  performanceMode: PerformanceMode;
  smoothFade: boolean;
  crossfadeSeconds: number; // 0..12
  keepAlbumContinuous: boolean;
  ytPremiumSession: boolean;
  audioFx: AudioFxSettings;
}

export const EQ_PRESETS: Record<
  EqPresetId,
  { label: string; bands: [number, number, number, number, number] }
> = {
  flat: { label: 'Flat', bands: [0, 0, 0, 0, 0] },
  bass_boost: { label: 'Bass Boost', bands: [7, 5, 0, 1, 2] },
  rock: { label: 'Rock', bands: [5, 2, -2, 3, 5] },
  pop: { label: '-1/+3 Pop', bands: [-1, 3, 4, 3, -1] },
  electronic: { label: 'Eletrônica', bands: [6, 3, -1, 4, 6] },
  vocal: { label: 'Vocal', bands: [-3, 1, 5, 4, 1] },
};

// Keep exact UI label 'Pop'
EQ_PRESETS.pop.label = 'Pop';

export const EQ_BAND_LABELS = ['60Hz', '230Hz', '910Hz', '3.6kHz', '14kHz'] as const;

export const LIQUID_GLASS_LABELS: Record<LiquidGlassLevel, string> = {
  off: 'Desativado',
  basic: 'Básico',
  medium: 'Médio',
  high: 'Alto',
};

export const DEFAULT_AUDIO_FX: AudioFxSettings = {
  enabled: true,
  eqPreset: 'flat',
  eqBands: [0, 0, 0, 0, 0],
  spatial8dEnabled: false,
  spatial8dSpeed: 0.18,
  reverbMix: 0,
  delayMix: 0,
  normalizerEnabled: true,
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  liquidGlass: 'off',
  spicyLyrics: false,
  ambientGlow: true,
  performanceMode: 'full',
  smoothFade: true,
  crossfadeSeconds: 0,
  keepAlbumContinuous: true,
  ytPremiumSession: false,
  audioFx: DEFAULT_AUDIO_FX,
};

const PREFS_STORAGE_KEY = 'sonicmorph_settings_v1';
const LYRIC_SYNC_STORAGE_KEY = 'sonicmorph_lyric_sync_v1';

export function normalizeLiquidGlassLevel(value: unknown): LiquidGlassLevel {
  if (value === 'basic' || value === 'medium' || value === 'high' || value === 'off') {
    return value;
  }
  if (value === true) return 'medium';
  return 'off';
}

export function clampEqBandDb(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.max(-12, Math.min(12, Math.round(val * 10) / 10));
}

export function sanitizePreferences(raw: Partial<AppPreferences> | null | undefined): AppPreferences {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_APP_PREFERENCES,
      audioFx: { ...DEFAULT_AUDIO_FX, eqBands: [...DEFAULT_AUDIO_FX.eqBands] },
    };
  }
  const fx = raw.audioFx || ({} as Partial<AudioFxSettings>);
  const rawBands = Array.isArray(fx.eqBands) && fx.eqBands.length === 5 ? fx.eqBands : DEFAULT_AUDIO_FX.eqBands;
  const preset: EqPresetId =
    fx.eqPreset && fx.eqPreset in EQ_PRESETS ? fx.eqPreset : 'flat';

  return {
    liquidGlass: normalizeLiquidGlassLevel(raw.liquidGlass),
    spicyLyrics: Boolean(raw.spicyLyrics),
    ambientGlow: raw.ambientGlow !== undefined ? Boolean(raw.ambientGlow) : true,
    performanceMode: raw.performanceMode === 'battery' ? 'battery' : 'full',
    smoothFade: raw.smoothFade !== undefined ? Boolean(raw.smoothFade) : true,
    crossfadeSeconds: Math.max(0, Math.min(12, Math.round(Number(raw.crossfadeSeconds || 0)))),
    keepAlbumContinuous: raw.keepAlbumContinuous !== undefined ? Boolean(raw.keepAlbumContinuous) : true,
    ytPremiumSession: Boolean(raw.ytPremiumSession),
    audioFx: {
      enabled: fx.enabled !== undefined ? Boolean(fx.enabled) : true,
      eqPreset: preset,
      eqBands: [
        clampEqBandDb(Number(rawBands[0])),
        clampEqBandDb(Number(rawBands[1])),
        clampEqBandDb(Number(rawBands[2])),
        clampEqBandDb(Number(rawBands[3])),
        clampEqBandDb(Number(rawBands[4])),
      ],
      spatial8dEnabled: Boolean(fx.spatial8dEnabled),
      spatial8dSpeed: Math.max(0.05, Math.min(0.6, Number(fx.spatial8dSpeed || 0.18))),
      reverbMix: Math.max(0, Math.min(1, Number(fx.reverbMix || 0))),
      delayMix: Math.max(0, Math.min(1, Number(fx.delayMix || 0))),
      normalizerEnabled: fx.normalizerEnabled !== undefined ? Boolean(fx.normalizerEnabled) : true,
    },
  };
}

export function clampLyricOffsetMs(ms: number): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.max(-10000, Math.min(10000, Math.round(ms)));
}

export function formatLyricSyncOffset(offsetMs: number): string {
  const clamped = clampLyricOffsetMs(offsetMs);
  const sign = clamped > 0 ? '+' : '';
  const sec = (clamped / 1000).toFixed(2);
  return `${sign}${clamped} ms (${sign}${sec}s)`;
}

export function loadTrackLyricOffset(trackId: string | undefined): number {
  if (!trackId || typeof localStorage === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(LYRIC_SYNC_STORAGE_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, unknown>;
    const val = Number(map[trackId]);
    return Number.isFinite(val) ? clampLyricOffsetMs(val) : 0;
  } catch {
    return 0;
  }
}

export function saveTrackLyricOffset(trackId: string | undefined, offsetMs: number): number {
  const clamped = clampLyricOffsetMs(offsetMs);
  if (!trackId || typeof localStorage === 'undefined') return clamped;
  try {
    const raw = localStorage.getItem(LYRIC_SYNC_STORAGE_KEY);
    const map: Record<string, number> = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    if (clamped === 0) {
      delete map[trackId];
    } else {
      map[trackId] = clamped;
    }
    // Keep most recent 300 track offsets to prevent unbounded localStorage growth
    const keys = Object.keys(map);
    if (keys.length > 300) {
      for (const oldKey of keys.slice(0, keys.length - 300)) {
        delete map[oldKey];
      }
    }
    localStorage.setItem(LYRIC_SYNC_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore quota errors
  }
  return clamped;
}

export interface CrossfadeEvalInput {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  crossfadeSeconds: number;
  alreadyTriggered: boolean;
}

export function evaluateCrossfadeTrigger(input: CrossfadeEvalInput): {
  shouldTrigger: boolean;
  fadeOutMs: number;
  fadeInMs: number;
} {
  if (
    !input.isPlaying ||
    input.alreadyTriggered ||
    input.crossfadeSeconds <= 0 ||
    !Number.isFinite(input.duration) ||
    input.duration <= 6
  ) {
    return { shouldTrigger: false, fadeOutMs: 0, fadeInMs: 0 };
  }

  const effectiveFadeSec = Math.min(input.crossfadeSeconds, Math.max(2, input.duration * 0.4));
  const remaining = input.duration - input.currentTime;
  if (remaining > 0.15 && remaining <= effectiveFadeSec) {
    const fadeWindowSec = Math.max(0.4, Math.min(remaining - 0.08, effectiveFadeSec));
    const fadeOutMs = Math.round(fadeWindowSec * 1000);
    const fadeInMs = Math.max(400, Math.min(2800, Math.round(input.crossfadeSeconds * 650)));
    return { shouldTrigger: true, fadeOutMs, fadeInMs };
  }

  return { shouldTrigger: false, fadeOutMs: 0, fadeInMs: 0 };
}

export function loadPreferencesFromStorage(): AppPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return sanitizePreferences(null);
    return sanitizePreferences(JSON.parse(raw) as Partial<AppPreferences>);
  } catch {
    return sanitizePreferences(null);
  }
}

export function savePreferencesToStorage(prefs: AppPreferences): void {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Computes linear fade-out multiplier (1.0 -> 0.0) during the last 10s of Sleep Timer.
 */
export function computeSleepFadeMultiplier(remainingSeconds: number | null): number {
  if (remainingSeconds === null || !Number.isFinite(remainingSeconds)) return 1;
  if (remainingSeconds <= 0) return 0;
  if (remainingSeconds >= 10) return 1;
  return Math.max(0.05, Math.min(1, remainingSeconds / 10));
}

export function formatSleepCountdown(remainingSeconds: number | null): string {
  if (remainingSeconds === null || !Number.isFinite(remainingSeconds)) return '';
  const total = Math.max(0, Math.ceil(remainingSeconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface SonicMorphBackupV1 {
  schema: 'sonicmorph-backup-v1';
  exportedAt: string;
  activeUI: UIId;
  themeMode: ThemeMode;
  sponsorBlockEnabled: boolean;
  youtubeApiKey?: string;
  preferences: AppPreferences;
  recentHistory: HistoryEntry[];
  favoriteTracks: Track[];
  savedPlaylists: Playlist[];
}

export function buildBackupPayload(data: {
  activeUI: UIId;
  themeMode: ThemeMode;
  sponsorBlockEnabled: boolean;
  youtubeApiKey?: string;
  preferences: AppPreferences;
  recentHistory: HistoryEntry[];
  favoriteTracks: Track[];
  playlists: Playlist[];
}): SonicMorphBackupV1 {
  return {
    schema: 'sonicmorph-backup-v1',
    exportedAt: new Date().toISOString(),
    activeUI: data.activeUI,
    themeMode: data.themeMode,
    sponsorBlockEnabled: data.sponsorBlockEnabled,
    youtubeApiKey: data.youtubeApiKey || undefined,
    preferences: sanitizePreferences(data.preferences),
    recentHistory: data.recentHistory.slice(0, 80),
    favoriteTracks: data.favoriteTracks.slice(0, 200),
    savedPlaylists: data.playlists.filter((p) => !p.id.startsWith('live-')),
  };
}

export function parseAndValidateBackup(jsonText: string): SonicMorphBackupV1 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Arquivo de backup inválido: JSON malformado.');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Estrutura de backup inválida.');
  }
  const obj = parsed as Partial<SonicMorphBackupV1>;
  if (obj.schema !== 'sonicmorph-backup-v1') {
    throw new Error('Versão de backup não reconhecida (esperado sonicmorph-backup-v1).');
  }

  return {
    schema: 'sonicmorph-backup-v1',
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    activeUI: (typeof obj.activeUI === 'string' ? obj.activeUI : 'modern-simpmusic-flow') as UIId,
    themeMode: obj.themeMode === 'light' ? 'light' : 'dark',
    sponsorBlockEnabled: obj.sponsorBlockEnabled !== undefined ? Boolean(obj.sponsorBlockEnabled) : true,
    youtubeApiKey: typeof obj.youtubeApiKey === 'string' ? obj.youtubeApiKey : undefined,
    preferences: sanitizePreferences(obj.preferences),
    recentHistory: Array.isArray(obj.recentHistory) ? obj.recentHistory : [],
    favoriteTracks: Array.isArray(obj.favoriteTracks) ? obj.favoriteTracks : [],
    savedPlaylists: Array.isArray(obj.savedPlaylists) ? obj.savedPlaylists : [],
  };
}

export function reorderListItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }
  const copy = [...items];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}
