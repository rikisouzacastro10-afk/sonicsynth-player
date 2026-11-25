import test from 'node:test';
import assert from 'node:assert/strict';
import { findActiveSponsorSegment, formatSponsorCategory } from './sponsorBlock';
import type { SponsorSegment } from '../types/music';

const segments: SponsorSegment[] = [
  { UUID: 'seg-intro', segment: [0, 8], category: 'intro' },
  { UUID: 'seg-offtopic', segment: [45, 60], category: 'music_offtopic' },
];

test('findActiveSponsorSegment detects active segment and respects skipped set', () => {
  const skipped = new Set<string>();
  const hit1 = findActiveSponsorSegment(2.5, segments, skipped);
  assert.equal(hit1?.UUID, 'seg-intro');

  skipped.add('seg-intro');
  assert.equal(findActiveSponsorSegment(3.0, segments, skipped), null);

  const hit2 = findActiveSponsorSegment(50.2, segments, skipped);
  assert.equal(hit2?.UUID, 'seg-offtopic');

  // Near segment end tolerance
  assert.equal(findActiveSponsorSegment(59.9, segments, skipped), null);
});

test('formatSponsorCategory translates SponsorBlock categories to Portuguese', () => {
  assert.equal(formatSponsorCategory('music_offtopic'), 'Trecho não musical');
  assert.equal(formatSponsorCategory('intro'), 'Introdução não musical');
});
