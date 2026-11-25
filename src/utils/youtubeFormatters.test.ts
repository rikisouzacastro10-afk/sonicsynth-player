import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDurationText,
  parseIsoDuration,
  parseViewsText,
  upgradeYtmArtwork,
} from './youtubeFormatters.ts';

test('parseIsoDuration parses YouTube Data API v3 ISO 8601 durations', () => {
  assert.equal(parseIsoDuration('PT3M22S'), 202);
  assert.equal(parseIsoDuration('PT1H2M5S'), 3725);
  assert.equal(parseIsoDuration('PT45S'), 45);
  assert.equal(parseIsoDuration('PT4M'), 240);
  assert.equal(parseIsoDuration('invalid'), 0);
});

test('parseDurationText parses mm:ss and hh:mm:ss strings', () => {
  assert.equal(parseDurationText('3:22'), 202);
  assert.equal(parseDurationText('1:02:05'), 3725);
  assert.equal(parseDurationText('abc'), 0);
});

test('parseViewsText parses localized PT/EN play counts cleanly', () => {
  assert.equal(parseViewsText('Tocou 3,7 bi vezes'), 3_700_000_000);
  assert.equal(parseViewsText('886 mi de visualizações'), 886_000_000);
  assert.equal(parseViewsText('450 mil reproduções'), 450_000);
  assert.equal(parseViewsText('1.2B plays'), 1_200_000_000);
  assert.equal(parseViewsText('240K views'), 240_000);
});

test('upgradeYtmArtwork upgrades thumbnail resolution or falls back to ytimg', () => {
  assert.equal(
    upgradeYtmArtwork('https://yt3.googleusercontent.com/abc=w60-h60-l90-rj', 'J7p4bzqLvCw', 544),
    'https://yt3.googleusercontent.com/abc=w544-h544-l90-rj'
  );
  assert.equal(
    upgradeYtmArtwork('', 'J7p4bzqLvCw'),
    'https://i.ytimg.com/vi/J7p4bzqLvCw/hqdefault.jpg'
  );
});
