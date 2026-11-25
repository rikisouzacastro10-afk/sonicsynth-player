/**
 * Pure trigonometry helpers for the tactile iPod Click Wheel rotation gesture.
 */

export function calculateWheelAngle(
  centerX: number,
  centerY: number,
  clientX: number,
  clientY: number
): number {
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Normalizes angular delta across the -180 / +180 wrap-around boundary.
 */
export function computeAngleDelta(prevAngle: number, nextAngle: number): number {
  let delta = nextAngle - prevAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

/**
 * Converts accumulated continuous degrees into discrete menu/volume step ticks
 * while preserving leftover sub-threshold angle for smooth continuous dragging.
 */
export function accumulateScrollSteps(
  accumulatedDeg: number,
  deltaDeg: number,
  stepThresholdDeg = 15
): { steps: number; remainderDeg: number } {
  const total = accumulatedDeg + deltaDeg;
  const steps = total >= 0 ? Math.floor(total / stepThresholdDeg) : Math.ceil(total / stepThresholdDeg);
  const remainderDeg = total - steps * stepThresholdDeg;
  return { steps, remainderDeg };
}
