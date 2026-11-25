import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLineWordTimings,
  computeLyricsInnerScrollTop,
  computeWordFillProgress,
  getLineEndTime,
} from './spicyLyricsMath';

test('computeLineWordTimings distributes words chronologically across line duration', () => {
  const timings = computeLineWordTimings('Hello bright world', 10, 14);
  assert.equal(timings.length, 3);
  assert.equal(timings[0].startTime, 10);
  assert.equal(timings[2].endTime, 14);
  assert.ok(timings[0].endTime > timings[0].startTime);
  assert.equal(timings[1].startTime, timings[0].endTime);
});

test('computeLineWordTimings handles missing next line cleanly using trackDuration', () => {
  const timings = computeLineWordTimings('Final chorus', 180, null, 185);
  assert.equal(timings.length, 2);
  assert.ok(timings[1].endTime <= 185);
  assert.ok(timings[1].endTime > 180);
});

test('computeWordFillProgress clamps cleanly between 0 and 1', () => {
  const word = { word: 'music', startTime: 20, endTime: 22 };
  assert.equal(computeWordFillProgress(word, 19.5), 0);
  assert.equal(computeWordFillProgress(word, 21), 0.5);
  assert.equal(computeWordFillProgress(word, 22.5), 1);
});

test('getLineEndTime uses next timestamp or bounded fallback', () => {
  const lines = [
    { time: 5, text: 'Line 1' },
    { time: 9.5, text: 'Line 2' },
  ];
  assert.equal(getLineEndTime(lines, 0, 120), 9.5);
  assert.equal(getLineEndTime(lines, 1, 13), 13);
});

test('computeLyricsInnerScrollTop centers target inside container and clamps within scroll bounds', () => {
  const centered = computeLyricsInnerScrollTop({
    containerScrollTop: 100,
    containerClientHeight: 300,
    containerScrollHeight: 1200,
    elementRelativeTop: 280,
    elementHeight: 40,
  });
  // 100 + 280 - 150 + 20 = 250
  assert.equal(centered, 250);

  // Clamps to 0 when element is near top
  assert.equal(
    computeLyricsInnerScrollTop({
      containerScrollTop: 0,
      containerClientHeight: 300,
      containerScrollHeight: 1200,
      elementRelativeTop: 20,
      elementHeight: 40,
    }),
    0
  );

  // Clamps to maxScroll when near bottom
  assert.equal(
    computeLyricsInnerScrollTop({
      containerScrollTop: 700,
      containerClientHeight: 300,
      containerScrollHeight: 1200,
      elementRelativeTop: 450,
      elementHeight: 40,
    }),
    900
  );
});
