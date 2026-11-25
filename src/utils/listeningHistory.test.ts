import test from 'node:test';
import assert from 'node:assert/strict';
import type { Playlist, Track } from '../types/music';
import {
  buildHomeRecommendations,
  buildQuickShortcuts,
  extractUserArtists,
  getTimeGreeting,
  normalizeArtistName,
  recordTrackPlay,
  toggleFavoriteTrack,
} from './listeningHistory';

const makeTrack = (id: string, title: string, artist: string, views = 1000, verified = true): Track => ({
  id,
  title,
  artist,
  album: 'Album',
  duration: 210,
  artwork: `https://img.example/${id}.jpg`,
  source: 'youtube-v3',
  views,
  verified,
});

test('getTimeGreeting returns Bom dia, Boa tarde, Boa noite accurately', () => {
  assert.equal(getTimeGreeting(6), 'Bom dia');
  assert.equal(getTimeGreeting(14), 'Boa tarde');
  assert.equal(getTimeGreeting(21), 'Boa noite');
  assert.equal(getTimeGreeting(2), 'Boa noite');
});

test('normalizeArtistName removes Topic, VEVO, and Official suffixes', () => {
  assert.equal(normalizeArtistName('Coldplay - Topic'), 'Coldplay');
  assert.equal(normalizeArtistName('AdeleVEVO'), 'AdeleVEVO');
  assert.equal(normalizeArtistName('Adele VEVO'), 'Adele');
  assert.equal(normalizeArtistName('Queen Official'), 'Queen');
});

test('recordTrackPlay deduplicates, increments playCount, and moves latest track to top', () => {
  const t1 = makeTrack('1', 'Yellow', 'Coldplay');
  const t2 = makeTrack('2', 'Fix You', 'Coldplay');
  let history = recordTrackPlay([], t1, 100);
  history = recordTrackPlay(history, t2, 200);
  history = recordTrackPlay(history, t1, 300);

  assert.equal(history.length, 2);
  assert.equal(history[0].track.id, '1');
  assert.equal(history[0].playCount, 2);
  assert.equal(history[1].track.id, '2');
  assert.equal(history[1].playCount, 1);
});

test('toggleFavoriteTrack adds and removes tracks idempotently', () => {
  const t1 = makeTrack('1', 'Yellow', 'Coldplay');
  const added = toggleFavoriteTrack([], t1);
  assert.equal(added.length, 1);
  assert.equal(added[0].id, '1');

  const removed = toggleFavoriteTrack(added, t1);
  assert.equal(removed.length, 0);
});

test('extractUserArtists aggregates plays per normalized artist and ranks by playCount', () => {
  const t1 = makeTrack('1', 'Yellow', 'Coldplay - Topic');
  const t2 = makeTrack('2', 'Clocks', 'Coldplay');
  const t3 = makeTrack('3', 'Hello', 'Adele');

  let history = recordTrackPlay([], t1, 100);
  history = recordTrackPlay(history, t2, 200);
  history = recordTrackPlay(history, t3, 300);

  const artists = extractUserArtists(history, []);
  assert.equal(artists.length, 2);
  assert.equal(artists[0].name, 'Coldplay');
  assert.equal(artists[0].playCount, 2);
  assert.equal(artists[0].tracks.length, 2);
  assert.equal(artists[1].name, 'Adele');
});

test('buildQuickShortcuts prioritizes favorites, history tracks, then playlists up to 6 items', () => {
  const t1 = makeTrack('1', 'Yellow', 'Coldplay');
  const t2 = makeTrack('2', 'Hello', 'Adele');
  const pl: Playlist = {
    id: 'pl-1',
    title: 'Mix Acústico',
    description: 'desc',
    tracks: [t2],
    createdAt: 1,
  };
  const shortcuts = buildQuickShortcuts(recordTrackPlay([], t1, 100), [t1], [pl], [t1, t2]);
  assert.equal(shortcuts[0].id, 'shortcut-favorites');
  assert.ok(shortcuts.some((s) => s.id === 'track-1'));
  assert.ok(shortcuts.some((s) => s.id === 'pl-pl-1'));
  assert.ok(shortcuts.length <= 6);
});

test('buildHomeRecommendations populates recentlyPlayed, listenAgain and officialHits cleanly', () => {
  const t1 = makeTrack('1', 'Yellow', 'Coldplay', 500_000, true);
  const t2 = makeTrack('2', 'Fix You', 'Coldplay', 900_000, true);
  const t3 = makeTrack('3', 'Indie Gem', 'Unknown', 200, false);

  const history = recordTrackPlay(recordTrackPlay([], t1, 100), t1, 200);
  const recs = buildHomeRecommendations(history, [t3, t2, t1], []);

  assert.equal(recs.isHistorySeeded, true);
  assert.equal(recs.recentlyPlayed[0].id, '1');
  assert.equal(recs.listenAgain[0].id, '1');
  assert.equal(recs.officialHits[0].id, '2');
});
