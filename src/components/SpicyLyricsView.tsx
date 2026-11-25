import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Music } from 'lucide-react';
import { audioClock, useActiveLyricIndex } from '../audio/audioClock';
import { useAppStore } from '../stores/useAppStore';
import {
  extractDominantColorsFromArtwork,
  getSeededArtworkPalette,
  type ArtworkColorPalette,
} from '../utils/artworkColors';
import { formatDuration } from '../utils/formatters';
import { parseLrc } from '../utils/lrcParser';
import {
  computeLineWordTimings,
  computeLyricsInnerScrollTop,
  computeWordFillProgress,
} from '../utils/spicyLyricsMath';
import { LyricSyncControls } from './LyricSyncControls';

export function findInnerLyricsScrollContainer(el: HTMLElement | null): HTMLElement | null {
  let parent = el?.parentElement || null;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    if (parent.hasAttribute('data-fullscreen-player')) {
      return null;
    }
    if (parent.hasAttribute('data-lyrics-scroll-container')) {
      return parent;
    }
    const style = window.getComputedStyle(parent);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight + 4
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

interface SpicyLyricsViewProps {
  variant?: 'dark' | 'light' | 'crt' | 'stage' | 'stage-light';
  fullscreen?: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export function SpicyLyricsView({
  variant = 'dark',
  fullscreen = false,
  scrollContainerRef,
}: SpicyLyricsViewProps) {
  const activeLyricsLrc = useAppStore((s) => s.activeLyricsLrc);
  const offsetMs = useAppStore((s) => s.activeLyricOffsetMs);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const performanceMode = useAppStore((s) => s.preferences.performanceMode);
  const seekTo = useAppStore((s) => s.seekTo);

  const offsetSeconds = offsetMs / 1000;
  const lines = useMemo(() => parseLrc(activeLyricsLrc), [activeLyricsLrc]);
  const activeIndex = useActiveLyricIndex(lines, offsetSeconds);

  const [palette, setPalette] = useState<ArtworkColorPalette>(() =>
    getSeededArtworkPalette(currentTrack?.id || 'default')
  );
  const [userScrolling, setUserScrolling] = useState(false);

  const scrollTimerRef = useRef<number | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const isLightSurface = variant === 'light' || variant === 'stage-light';

  useEffect(() => {
    let cancelled = false;
    const key = currentTrack?.id || currentTrack?.title || 'default';
    setPalette(getSeededArtworkPalette(key));
    void extractDominantColorsFromArtwork(currentTrack?.artwork, key).then((cols) => {
      if (!cancelled) setPalette(cols);
    });
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id, currentTrack?.artwork, currentTrack?.title]);

  // Compute word timings for active line
  const activeWordTimings = useMemo(() => {
    if (activeIndex < 0 || activeIndex >= lines.length) return [];
    const cur = lines[activeIndex];
    const next = lines[activeIndex + 1];
    return computeLineWordTimings(
      cur.text,
      cur.time,
      next ? next.time : null,
      currentTrack?.duration || 0
    );
  }, [lines, activeIndex, currentTrack?.duration]);

  // Auto-scroll ONLY the inner lyrics container (never scrollIntoView / never pull outer player scroll)
  useEffect(() => {
    if (userScrolling || activeIndex < 0) return;
    const targetEl = activeLineRef.current;
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
  }, [activeIndex, userScrolling, scrollContainerRef]);

  // 60 FPS word-by-word karaoke fill using direct DOM style variables (no 60Hz React re-renders)
  useEffect(() => {
    if (activeWordTimings.length === 0) return;

    const updateWords = () => {
      const effectiveTime = audioClock.getSnapshot().currentTime + offsetSeconds;
      for (let i = 0; i < activeWordTimings.length; i++) {
        const el = wordRefs.current.get(i);
        if (!el) continue;
        const pct = computeWordFillProgress(activeWordTimings[i], effectiveTime);
        const isCurrentWord = pct > 0.02 && pct < 0.99;
        el.style.setProperty('--word-fill', `${Math.round(pct * 100)}%`);
        el.style.transform = isCurrentWord ? 'scale(1.06)' : 'scale(1)';
        el.style.filter = isCurrentWord
          ? `drop-shadow(0 0 10px ${palette.primary}99)`
          : 'none';
      }
    };

    updateWords();
    if (!isPlaying) return;

    let rafId = 0;
    const loop = () => {
      updateWords();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [activeWordTimings, isPlaying, palette.primary, offsetSeconds]);

  const handleManualScrollIntent = () => {
    setUserScrolling(true);
    if (scrollTimerRef.current !== null) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = window.setTimeout(() => {
      setUserScrolling(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  if (lines.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden py-10 px-4 text-center space-y-4">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-35 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${palette.primary}, transparent 65%), radial-gradient(circle at 75% 70%, ${palette.secondary}, transparent 65%)`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center opacity-80">
          <Music className="w-8 h-8 mb-3 opacity-70" />
          <p className="text-sm font-semibold">SpicyLyrics aguardando letra sincronizada</p>
          <p className="text-xs mt-1 opacity-75">
            {currentTrack?.title} — {currentTrack?.artist}
          </p>
        </div>
        <div className="relative z-10 max-w-md mx-auto">
          <LyricSyncControls compact light={isLightSurface} />
        </div>
      </div>
    );
  }

  const fgColor = isLightSurface ? '#09090b' : '#ffffff';
  const dimColor = isLightSurface ? 'rgba(9, 9, 11, 0.36)' : 'rgba(255, 255, 255, 0.36)';

  return (
    <div
      data-spicy-lyrics="true"
      onWheel={handleManualScrollIntent}
      onTouchMove={handleManualScrollIntent}
      className={`relative rounded-2xl overflow-hidden ${fullscreen ? 'min-h-full p-4 sm:p-8' : 'p-3 sm:p-4'}`}
      style={{
        ['--spicy-word-fg' as string]: fgColor,
        ['--spicy-word-dim' as string]: dimColor,
      }}
    >
      {/* Dynamic Fluid Organic Gradient Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-45 ${
            performanceMode === 'full' ? 'spicy-blob-a' : ''
          }`}
          style={{ background: palette.primary }}
        />
        <div
          className={`absolute -bottom-20 -right-12 w-80 h-80 rounded-full blur-3xl opacity-40 ${
            performanceMode === 'full' ? 'spicy-blob-b' : ''
          }`}
          style={{ background: palette.secondary }}
        />
        <div
          className={`absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-30 ${
            performanceMode === 'full' ? 'spicy-blob-c' : ''
          }`}
          style={{ background: palette.tertiary }}
        />
        <div
          className={`absolute inset-0 ${
            isLightSurface ? 'bg-white/55' : 'bg-black/45'
          }`}
        />
      </div>

      {/* Sync Adjuster Toolbar inside SpicyLyrics */}
      <div className={`relative z-10 mb-3 ${fullscreen ? 'max-w-3xl mx-auto' : ''}`}>
        <LyricSyncControls compact light={isLightSurface} />
      </div>

      {/* Synchronized Word-by-Word Lines */}
      <div className={`relative z-10 ${fullscreen ? 'space-y-4 max-w-3xl mx-auto py-4' : 'space-y-2.5 py-2'}`}>
        {lines.map((line, idx) => {
          const isActive = idx === activeIndex;
          const distance = activeIndex >= 0 ? Math.abs(idx - activeIndex) : 0;
          const shouldBlur = !isActive && !userScrolling && activeIndex >= 0 && distance >= 1;

          return (
            <button
              key={`${line.time}-${idx}`}
              ref={isActive ? activeLineRef : null}
              type="button"
              onClick={() => seekTo(Math.max(0, line.time - offsetSeconds))}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-300 flex items-baseline gap-3 min-h-[42px] ${
                isActive
                  ? `${fullscreen ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-2xl'} font-extrabold bg-white/10 shadow-sm`
                  : `${fullscreen ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'} font-semibold hover:bg-white/5`
              } ${
                shouldBlur
                  ? 'blur-[1.5px] opacity-45 hover:blur-none hover:opacity-85'
                  : isActive
                    ? 'opacity-100'
                    : 'opacity-75'
              }`}
            >
              <span className="text-[10px] font-mono-tech opacity-50 shrink-0">
                {formatDuration(line.time)}
              </span>

              {isActive && activeWordTimings.length > 0 ? (
                <span className="flex flex-wrap gap-x-1.5 gap-y-0.5 leading-snug">
                  {activeWordTimings.map((wt, wIdx) => (
                    <span
                      key={`${idx}-${wIdx}`}
                      ref={(el) => {
                        if (el) wordRefs.current.set(wIdx, el);
                        else wordRefs.current.delete(wIdx);
                      }}
                      className="inline-block spicy-word-fill will-change-transform"
                    >
                      {wt.word}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="leading-snug">{line.text}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
