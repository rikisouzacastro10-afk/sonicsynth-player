import test from 'node:test';
import assert from 'node:assert/strict';
import { clampIpodSelectionIndex, computeSlidingScrollTop } from './ipodMenuScroll.ts';

test('clampIpodSelectionIndex clamps cleanly at 0 and length - 1 without wrap-around jump', () => {
  assert.equal(clampIpodSelectionIndex(0, -1, 10), 0);
  assert.equal(clampIpodSelectionIndex(0, 1, 10), 1);
  assert.equal(clampIpodSelectionIndex(9, 1, 10), 9);
  assert.equal(clampIpodSelectionIndex(9, -1, 10), 8);
  assert.equal(clampIpodSelectionIndex(3, 1, 0), 0);
});

test('computeSlidingScrollTop scrolls down when active item passes bottom viewport edge', () => {
  // 160px tall LCD list, currently at scrollTop 0, selecting item at top=156 height=28 (bottom=184)
  const nextTop = computeSlidingScrollTop({
    currentScrollTop: 0,
    containerHeight: 160,
    itemTop: 156,
    itemHeight: 28,
    padding: 4,
  });
  assert.equal(nextTop, 28);
});

test('computeSlidingScrollTop scrolls up when active item moves above top viewport edge', () => {
  const nextTop = computeSlidingScrollTop({
    currentScrollTop: 84,
    containerHeight: 160,
    itemTop: 56,
    itemHeight: 28,
    padding: 4,
  });
  assert.equal(nextTop, 52);
});

test('computeSlidingScrollTop leaves scrollTop untouched when item is fully visible', () => {
  const nextTop = computeSlidingScrollTop({
    currentScrollTop: 28,
    containerHeight: 160,
    itemTop: 84,
    itemHeight: 28,
    padding: 4,
  });
  assert.equal(nextTop, 28);
});
