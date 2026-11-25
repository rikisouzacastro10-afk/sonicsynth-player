import type { LyricLine } from '../types/music';

/**
 * Parses standard LRC formatted lyrics ("[mm:ss.xx] Lyric text") into sorted LyricLine entries.
 * Supports multiple timestamps on a single line (e.g. "[00:12.50][01:02.00] Chorus").
 */
export function parseLrc(lrcText: string | undefined | null): LyricLine[] {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines: LyricLine[] = [];
  const rawLines = lrcText.split(/\r?\n/);
  const tagRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const raw of rawLines) {
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;
    tagRegex.lastIndex = 0;

    while ((match = tagRegex.exec(raw)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fracStr = match[3] || '0';
      const frac =
        fracStr.length === 3
          ? parseInt(fracStr, 10) / 1000
          : fracStr.length === 2
            ? parseInt(fracStr, 10) / 100
            : parseInt(fracStr, 10) / 10;
      timestamps.push(minutes * 60 + seconds + frac);
    }

    if (timestamps.length === 0) continue;

    const text = raw.replace(tagRegex, '').trim();
    if (!text) continue;

    for (const time of timestamps) {
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

/**
 * Binary search to find the active lyric index for a given playback time in O(log n).
 * Returns -1 if playback time is before the first lyric line.
 */
export function findActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (lines.length === 0 || currentTime < lines[0].time) return -1;

  let low = 0;
  let high = lines.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (lines[mid].time <= currentTime) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}
