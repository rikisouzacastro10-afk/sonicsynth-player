import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBackupPayload,
  clampEqBandDb,
  clampLyricOffsetMs,
  computeSleepFadeMultiplier,
  DEFAULT_APP_PREFERENCES,
  EQ_PRESETS,
  evaluateCrossfadeTrigger,
  formatLyricSyncOffset,
  formatSleepCountdown,
  normalizeLiquidGlassLevel,
  parseAndValidateBackup,
  reorderListItem,
  sanitizePreferences,
} from './settingsAndFx';
import type { Track } from '../types/music';

const sampleTrack: Track = {
  id: 'yt-abc',
  title: 'Test Song',
  artist: 'Official Artist',
  album: 'Album',
  duration: 200,
  artwork: 'https://i.ytimg.com/vi/yt-abc/hqdefault.jpg',
  source: 'youtube-v3',
};

test('clampEqBandDb and sanitizePreferences handle Liquid Glass migration and bounds cleanly', () => {
  assert.equal(clampEqBandDb(24), 12);
  assert.equal(clampEqBandDb(-25), -12);
  assert.equal(normalizeLiquidGlassLevel(true), 'medium');
  assert.equal(normalizeLiquidGlassLevel(false), 'off');
  assert.equal(normalizeLiquidGlassLevel('high'), 'high');

  const prefs = sanitizePreferences({
    liquidGlass: 'high',
    crossfadeSeconds: 99,
    audioFx: {
      enabled: true,
      eqPreset: 'bass_boost',
      eqBands: [20, -20, 0, 2, 1],
      spatial8dEnabled: true,
      spatial8dSpeed: 2,
      reverbMix: 5,
      delayMix: -1,
      normalizerEnabled: true,
    },
  });
  assert.equal(prefs.liquidGlass, 'high');
  assert.equal(prefs.crossfadeSeconds, 12);
  assert.deepEqual(prefs.audioFx.eqBands, [12, -12, 0, 2, 1]);
  assert.equal(prefs.audioFx.spatial8dSpeed, 0.6);
  assert.equal(prefs.audioFx.reverbMix, 1);
  assert.equal(prefs.audioFx.delayMix, 0);
  assert.equal(EQ_PRESETS.bass_boost.bands[0], 7);
});

test('formatLyricSyncOffset and clampLyricOffsetMs format both ms and seconds cleanly', () => {
  assert.equal(clampLyricOffsetMs(25000), 10000);
  assert.equal(clampLyricOffsetMs(-25000), -10000);
  assert.equal(formatLyricSyncOffset(400), '+400 ms (+0.40s)');
  assert.equal(formatLyricSyncOffset(-1200), '-1200 ms (-1.20s)');
  assert.equal(formatLyricSyncOffset(0), '0 ms (0.00s)');
});

test('evaluateCrossfadeTrigger triggers once inside fade window and prevents double skip', () => {
  assert.deepEqual(
    evaluateCrossfadeTrigger({
      isPlaying: true,
      currentTime: 180,
      duration: 200,
      crossfadeSeconds: 6,
      alreadyTriggered: false,
    }),
    { shouldTrigger: false, fadeOutMs: 0, fadeInMs: 0 }
  );

  const triggered = evaluateCrossfadeTrigger({
    isPlaying: true,
    currentTime: 195,
    duration: 200,
    crossfadeSeconds: 6,
    alreadyTriggered: false,
  });
  assert.equal(triggered.shouldTrigger, true);
  assert.ok(triggered.fadeOutMs >= 4000 && triggered.fadeOutMs <= 5000);
  assert.ok(triggered.fadeInMs >= 1500);

  // Guard blocks duplicate trigger on next ticks
  assert.equal(
    evaluateCrossfadeTrigger({
      isPlaying: true,
      currentTime: 196,
      duration: 200,
      crossfadeSeconds: 6,
      alreadyTriggered: true,
    }).shouldTrigger,
    false
  );
});

test('computeSleepFadeMultiplier ramps volume smoothly during final 10 seconds', () => {
  assert.equal(computeSleepFadeMultiplier(null), 1);
  assert.equal(computeSleepFadeMultiplier(30), 1);
  assert.equal(computeSleepFadeMultiplier(5), 0.5);
  assert.equal(computeSleepFadeMultiplier(0), 0);
  assert.equal(formatSleepCountdown(65), '01:05');
});

test('buildBackupPayload and parseAndValidateBackup round-trip cleanly and reject invalid schemas', () => {
  const payload = buildBackupPayload({
    activeUI: 'retro-tps-l2-1979',
    themeMode: 'light',
    sponsorBlockEnabled: true,
    preferences: { ...DEFAULT_APP_PREFERENCES, liquidGlass: 'basic', spicyLyrics: true },
    recentHistory: [{ track: sampleTrack, playedAt: 1000, playCount: 2 }],
    favoriteTracks: [sampleTrack],
    playlists: [
      { id: 'live-trending-mix', title: 'Live', description: '', tracks: [sampleTrack], createdAt: 1 },
      { id: 'pl-ai-123', title: 'My AI Mix', description: 'Vibe', tracks: [sampleTrack], createdAt: 2 },
    ],
  });

  // Live trending mixes should be excluded from backup, user playlists preserved
  assert.equal(payload.savedPlaylists.length, 1);
  assert.equal(payload.savedPlaylists[0].id, 'pl-ai-123');

  const restored = parseAndValidateBackup(JSON.stringify(payload));
  assert.equal(restored.activeUI, 'retro-tps-l2-1979');
  assert.equal(restored.themeMode, 'light');
  assert.equal(restored.preferences.liquidGlass, 'basic');
  assert.equal(restored.recentHistory.length, 1);
  assert.equal(restored.favoriteTracks.length, 1);

  assert.throws(() => parseAndValidateBackup('{"schema":"other"}'), /não reconhecida/i);
});

test('reorderListItem moves queue items accurately without mutating source', () => {
  const src = ['a', 'b', 'c', 'd'];
  const moved = reorderListItem(src, 0, 2);
  assert.deepEqual(moved, ['b', 'c', 'a', 'd']);
  assert.deepEqual(src, ['a', 'b', 'c', 'd']);
});
