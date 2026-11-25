import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Music } from 'lucide-react';
import { useActiveLyricIndex } from '../audio/audioClock';
import { useAppStore } from '../stores/useAppStore';
import { parseLrc } from '../utils/lrcParser';
import { formatDuration } from '../utils/formatters';
import { computeLyricsInnerScrollTop } from '../utils/spicyLyricsMath';
import { findInnerLyricsScrollContainer, SpicyLyricsView } from './SpicyLyricsView';

interface LyricsPanelProps {
  variant?: 'dark' | 'light' | 'crt' | 'stage' | 'stage-light';
  accentClass?: string;
  forceClassic?: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function LyricsPanel({
  variant = 'dark',
  accentClass,
  forceClassic = false,
  scrollContainerRef,
}: LyricsPanelProps) {
  const spicyLyrics = useAppStore((s) => s.preferences.spicyLyrics);
  const activeLyricsLrc = useAppStore((s) => s.activeLyricsLrc);
  const offsetMs = useAppStore((s) => s.activeLyricOffsetMs);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const seekTo = useAppStore((s) => s.seekTo);

  const offsetSeconds = offsetMs / 1000;
  const lines = useMemo(() => parseLrc(activeLyricsLrc), [activeLyricsLrc]);
  const activeIndex = useActiveLyricIndex(lines, offsetSeconds);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (spicyLyrics && !forceClassic) return;
    if (activeIndex < 0) return;
    const targetEl = activeRef.current;
    if (!targetEl) return;

    const container =
      scrollContainerRef?.current || findInnerLyricsScrollContainer(targetEl);
    if (!container) return;

    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const nextTop = computeLyricsInnerScrollTop({
      containerScrollTop: container.scrollTop,
      containerClientHeight: container.clientHeight,
      containerScrollHeight: container.scrollHeight,
      elementRelativeTop: targetRect.top - containerRect.top,
      elementHeight: targetRect.height,
    });

    container.scrollTo({ top: nextTop, behavior: 'smooth' });
  }, [activeIndex, spicyLyrics, forceClassic, scrollContainerRef]);

  if (spicyLyrics && !forceClassic) {
    return <SpicyLyricsView variant={variant} scrollContainerRef={scrollContainerRef} />;
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-70">
        <Music className="w-8 h-8 mb-3 opacity-60" />
        <p className="text-sm font-medium">Sem letras sincronizadas para esta faixa</p>
        <p className="text-xs mt-1 opacity-75">
          {currentTrack?.title} — {currentTrack?.artist}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 py-2" aria-label="Letras sincronizadas">
      {lines.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = activeIndex > -1 && idx < activeIndex;

        let lineStyle = '';
        if (variant === 'light') {
          lineStyle = isActive
            ? 'text-zinc-950 font-semibold scale-[1.01]'
            : isPast
              ? 'text-zinc-400'
              : 'text-zinc-500 hover:text-zinc-800';
        } else if (variant === 'crt') {
          lineStyle = isActive
            ? 'text-emerald-300 font-bold bg-emerald-500/10'
            : isPast
              ? 'text-emerald-700'
              : 'text-emerald-500/70 hover:text-emerald-300';
        } else if (variant === 'stage') {
          lineStyle = isActive
            ? 'text-white text-2xl sm:text-3xl font-bold'
            : isPast
              ? 'text-white/35 text-lg sm:text-xl'
              : 'text-white/55 text-lg sm:text-xl hover:text-white/85';
        } else if (variant === 'stage-light') {
          lineStyle = isActive
            ? 'text-zinc-950 text-2xl sm:text-3xl font-bold'
            : isPast
              ? 'text-zinc-400 text-lg sm:text-xl'
              : 'text-zinc-600 text-lg sm:text-xl hover:text-zinc-900';
        } else {
          lineStyle = isActive
            ? 'text-white font-semibold bg-white/10'
            : isPast
              ? 'text-zinc-500'
              : 'text-zinc-400 hover:text-zinc-200';
        }

        return (
          <button
            key={`${line.time}-${idx}`}
            ref={isActive ? activeRef : null}
            type="button"
            onClick={() => seekTo(Math.max(0, line.time - offsetSeconds))}
            className={`w-full text-left px-3 py-2 rounded-lg transition-[transform,opacity,color,background-color] duration-150 flex items-baseline gap-3 min-h-[40px] ${lineStyle} ${
              isActive && accentClass ? accentClass : ''
            }`}
          >
            <span className="text-[11px] font-mono-tech opacity-50 shrink-0">
              {formatDuration(line.time)}
            </span>
            <span className="leading-snug">{line.text}</span>
          </button>
        );
      })}
    </div>
  );
}
