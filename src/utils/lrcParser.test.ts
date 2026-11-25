import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLrc, findActiveLyricIndex } from './lrcParser';

test('parseLrc parses timestamps, multi-tag lines, and sorts chronologically', () => {
  const sample = `
[ti:Midnight Echo]
[00:15.50] Second line
[00:04.25] First line
[00:30.00][01:10.10] Chorus refrain
[00:45.00]
`;
  const parsed = parseLrc(sample);
  assert.equal(parsed.length, 4);
  assert.deepEqual(parsed[0], { time: 4.25, text: 'First line' });
  assert.deepEqual(parsed[1], { time: 15.5, text: 'Second line' });
  assert.deepEqual(parsed[2], { time: 30, text: 'Chorus refrain' });
  assert.deepEqual(parsed[3], { time: 70.1, text: 'Chorus refrain' });
});

test('findActiveLyricIndex returns exact active index using binary search', () => {
  const lines = [
    { time: 5, text: 'Line 1' },
    { time: 12.5, text: 'Line 2' },
    { time: 20, text: 'Line 3' },
  ];

  assert.equal(findActiveLyricIndex(lines, 2), -1);
  assert.equal(findActiveLyricIndex(lines, 5), 0);
  assert.equal(findActiveLyricIndex(lines, 12.4), 0);
  assert.equal(findActiveLyricIndex(lines, 12.5), 1);
  assert.equal(findActiveLyricIndex(lines, 42), 2);
  assert.equal(findActiveLyricIndex([], 10), -1);
});
