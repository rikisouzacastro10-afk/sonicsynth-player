import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isFullLengthDuration,
  isOfficialArtistChannel,
  isUnofficialTrack,
  normalizeSearchText,
  rankTracksByPopularityAndMatch,
  scoreTrackMatch,
  selectBestFullTrack,
} from './searchMatch.ts';

test('normalizeSearchText strips accents and official video/lyrics noise', () => {
  assert.equal(
    normalizeSearchText('Aquarela do Brasil (Official Music Video) [HD]'),
    'aquarela do brasil'
  );
  assert.equal(
    normalizeSearchText('Legião Urbana - Eduardo e Mônica (Áudio Oficial)'),
    'legiao urbana eduardo e monica audio oficial'
  );
});

test('isFullLengthDuration strictly rejects 30s previews and multi-hour mixes', () => {
  assert.equal(isFullLengthDuration(29), false);
  assert.equal(isFullLengthDuration(30), false);
  assert.equal(isFullLengthDuration(44), false);
  assert.equal(isFullLengthDuration(215), true);
  assert.equal(isFullLengthDuration(4200), false);
});

test('isUnofficialTrack catches legendado, tradução, lyric video, cover, karaoke, 8D, react, fan made and remix', () => {
  assert.equal(
    isUnofficialTrack('Bon Jovi Livin on a Prayer', {
      title: "Livin' On A Prayer (Legendado / Tradução)",
      artist: 'Legendados BR',
    }),
    true
  );
  assert.equal(
    isUnofficialTrack('Bon Jovi Livin on a Prayer', {
      title: "Livin' On A Prayer Lyrics",
      artist: 'Lyricallypen',
    }),
    true
  );
  assert.equal(
    isUnofficialTrack('Guns N Roses Sweet Child O Mine', {
      title: "Sweet Child O' Mine (Cover)",
      artist: 'The Heimatdamisch',
    }),
    true
  );
  assert.equal(
    isUnofficialTrack('Adele Hello', {
      title: 'Hello (Slowed + Reverb 8D)',
      artist: 'Chill Vibes',
    }),
    true
  );
  assert.equal(
    isUnofficialTrack('Queen Bohemian Rhapsody', {
      title: 'Bohemian Rhapsody Paródia / React',
      artist: 'Canal Zueira',
    }),
    true
  );
  // Explicit user request for remix is allowed
  assert.equal(
    isUnofficialTrack('Despacito Remix', {
      title: 'Despacito (Remix)',
      artist: 'Luis Fonsi',
    }),
    false
  );
});

test('rankTracksByPopularityAndMatch discards unofficial videos and prioritizes official artist with highest viewCount', () => {
  const candidates = [
    { id: 'prev', title: 'Blinding Lights', artist: 'The Weeknd', duration: 30, views: 50000000 },
    { id: 'lyric', title: 'Blinding Lights (Lyrics / Traduzido)', artist: 'Lyrics Channel', duration: 204, views: 45000000 },
    { id: 'karaoke', title: 'Blinding Lights (Karaoke Cover)', artist: 'Karaoke Star', duration: 205, views: 900000 },
    { id: 'remix', title: 'Blinding Lights (Slowed Remix)', artist: 'DJ Random', duration: 220, views: 300000 },
    { id: 'lowviews', title: 'Blinding Lights', artist: 'The Weeknd', channelTitle: 'Fan Archive', duration: 200, views: 1200 },
    {
      id: 'official',
      title: 'Blinding Lights (Official Audio)',
      artist: 'The Weeknd',
      channelTitle: 'TheWeekndVEVO',
      duration: 202,
      views: 880000000,
      verified: true,
    },
  ];

  const ranked = rankTracksByPopularityAndMatch('The Weeknd Blinding Lights', candidates, 200);
  assert.equal(ranked.length, 2);
  assert.equal(ranked[0]?.id, 'official');
  assert.equal(ranked[1]?.id, 'lowviews');
  assert.ok(isOfficialArtistChannel(candidates[5]));
  assert.ok(scoreTrackMatch('The Weeknd Blinding Lights', candidates[5], 200) > 150);

  const best = selectBestFullTrack('The Weeknd Blinding Lights', candidates, 200);
  assert.equal(best?.id, 'official');
});

test('official - Topic channel beats unofficial higher-count upload with non-official channel', () => {
  const candidates = [
    {
      id: 'topic',
      title: "Livin' On A Prayer",
      artist: 'Bon Jovi',
      channelTitle: 'Bon Jovi - Topic',
      duration: 249,
      views: 120000000,
      verified: true,
    },
    {
      id: 'lyric-chan',
      title: "Livin' On A Prayer Lyrics - Bon Jovi",
      artist: 'Lyricallypen',
      channelTitle: 'Lyricallypen',
      duration: 251,
      views: 190000000,
      verified: false,
    },
    {
      id: 'vevo',
      title: "Bon Jovi - Livin' On A Prayer",
      artist: 'BonJoviVEVO',
      channelTitle: 'BonJoviVEVO',
      duration: 248,
      views: 1100000000,
      verified: true,
    },
  ];

  const ranked = rankTracksByPopularityAndMatch("Livin' On A Prayer Bon Jovi", candidates);
  assert.equal(ranked.some((t) => t.id === 'lyric-chan'), false);
  assert.equal(ranked[0]?.id, 'vevo');
  assert.equal(ranked[1]?.id, 'topic');
});
