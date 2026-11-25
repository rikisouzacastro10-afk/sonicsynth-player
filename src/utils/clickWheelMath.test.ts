import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWheelAngle, computeAngleDelta, accumulateScrollSteps } from './clickWheelMath';

test('computeAngleDelta handles 180/-180 wraparound cleanly', () => {
  assert.equal(computeAngleDelta(170, -170), 20);
  assert.equal(computeAngleDelta(-170, 170), -20);
  assert.equal(computeAngleDelta(10, 35), 25);
});

test('accumulateScrollSteps emits discrete ticks and preserves remainder', () => {
  const r1 = accumulateScrollSteps(10, 15, 22);
  assert.equal(r1.steps, 1);
  assert.equal(r1.remainderDeg, 3);

  const r2 = accumulateScrollSteps(-5, -40, 22);
  assert.equal(r2.steps, -2);
  assert.equal(r2.remainderDeg, -1);

  const rDefault = accumulateScrollSteps(0, 32);
  assert.equal(rDefault.steps, 2);
  assert.equal(rDefault.remainderDeg, 2);
});

test('calculateWheelAngle returns expected quadrant angles', () => {
  assert.equal(Math.round(calculateWheelAngle(100, 100, 200, 100)), 0);
  assert.equal(Math.round(calculateWheelAngle(100, 100, 100, 200)), 90);
});
