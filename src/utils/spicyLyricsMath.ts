import type { LyricLine } from '../types/music';

export interface WordTiming {
  word: string;
  startTime: number;
  endTime: number;
}

/**
 * Splits an LRC line into evenly spaced progressive word intervals between
 * lineStart and lineEnd so karaoke fill tracks exact playback progress.
 */
export function computeLineWordTimings(
  text: string,
  lineStart: number,
  nextLineStart: number | null,
  trackDuration = 0
): WordTiming[] {
  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [];

  const fallbackEnd =
    trackDuration > lineStart + 1
      ? Math.min(trackDuration, lineStart + Math.max(2.6, words.length * 0.48))
      : lineStart + Math.max(2.6, words.length * 0.48);

  const rawEnd =
    nextLineStart !== null && nextLineStart > lineStart + 0.35
      ? Math.min(nextLineStart, lineStart + 12)
      : fallbackEnd;

  const span = Math.max(0.45, rawEnd - lineStart);
  const totalWeight = words.reduce((acc, w) => acc + Math.max(2, w.length), 0);

  let cursor = lineStart;
  return words.map((word, idx) => {
    const weight = Math.max(2, word.length);
    const slice = (weight / totalWeight) * span;
    const startTime = cursor;
    const endTime = idx === words.length - 1 ? rawEnd : cursor + slice;
    cursor = endTime;
    return { word, startTime, endTime };
  });
}

/**
 * Returns 0..1 fill progress for a specific word timing at currentTime.
 */
export function computeWordFillProgress(timing: WordTiming, currentTime: number): number {
  if (currentTime <= timing.startTime) return 0;
  if (currentTime >= timing.endTime) return 1;
  const span = Math.max(0.05, timing.endTime - timing.startTime);
  return Math.max(0, Math.min(1, (currentTime - timing.startTime) / span));
}

export function getLineEndTime(lines: LyricLine[], index: number, trackDuration = 0): number {
  const current = lines[index];
  if (!current) return 0;
  const next = lines[index + 1];
  if (next && next.time > current.time + 0.35) {
    return next.time;
  }
  if (trackDuration > current.time + 0.5) {
    return Math.min(trackDuration, current.time + 5);
  }
  return current.time + 4;
}

/**
 * Computes exact vertical scrollTop inside a lyrics container to center the active line
 * without calling Element.scrollIntoView() (which would pull outer player/window scroll).
 */
export function computeLyricsInnerScrollTop(params: {
  containerScrollTop: number;
  containerClientHeight: number;
  containerScrollHeight: number;
  elementRelativeTop: number;
  elementHeight: number;
}): number {
  const maxScroll = Math.max(0, params.containerScrollHeight - params.containerClientHeight);
  if (maxScroll <= 0) return 0;
  const target =
    params.containerScrollTop +
    params.elementRelativeTop -
    params.containerClientHeight / 2 +
    params.elementHeight / 2;
  return Math.max(0, Math.min(maxScroll, Math.round(target)));
}
