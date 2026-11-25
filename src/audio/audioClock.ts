import { useEffect, useState, useSyncExternalStore } from 'react';
import type { LyricLine } from '../types/music';
import { findActiveLyricIndex } from '../utils/lrcParser';

export interface AudioClockSnapshot {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

type Listener = () => void;

class AudioClockStore {
  private snapshot: AudioClockSnapshot = {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  };
  private listeners = new Set<Listener>();

  getSnapshot = (): AudioClockSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  update(next: Partial<AudioClockSnapshot>) {
    const updated: AudioClockSnapshot = {
      currentTime: next.currentTime ?? this.snapshot.currentTime,
      duration: next.duration ?? this.snapshot.duration,
      isPlaying: next.isPlaying ?? this.snapshot.isPlaying,
    };

    if (
      updated.currentTime === this.snapshot.currentTime &&
      updated.duration === this.snapshot.duration &&
      updated.isPlaying === this.snapshot.isPlaying
    ) {
      return;
    }

    this.snapshot = updated;
    this.listeners.forEach((l) => l());
  }
}

export const audioClock = new AudioClockStore();

/**
 * Isolated 60fps subscription hook for progress bars & time counters.
 * Components that do NOT call this hook will NEVER re-render on time ticks.
 */
export function useAudioClock(): AudioClockSnapshot {
  return useSyncExternalStore(audioClock.subscribe, audioClock.getSnapshot, audioClock.getSnapshot);
}

/**
 * Isolated lyric line index subscription. Only triggers a React state update
 * when the active lyric line index actually changes.
 */
export function useActiveLyricIndex(lines: LyricLine[], offsetSeconds = 0): number {
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    findActiveLyricIndex(lines, audioClock.getSnapshot().currentTime + offsetSeconds)
  );

  useEffect(() => {
    const sync = () => {
      const next = findActiveLyricIndex(
        lines,
        audioClock.getSnapshot().currentTime + offsetSeconds
      );
      setActiveIndex((prev) => (prev === next ? prev : next));
    };
    sync();
    return audioClock.subscribe(sync);
  }, [lines, offsetSeconds]);

  return activeIndex;
}
