import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface MarqueeTextProps {
  text: string;
  isPlaying: boolean;
  className?: string;
}

/**
 * Smooth GPU-composited horizontal marquee for long track titles.
 * Only animates when text overflows its container AND playback is active.
 */
export function MarqueeText({ text, isPlaying, className = '' }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const inner = textRef.current;
      if (!container || !inner) return;
      const diff = Math.ceil(inner.scrollWidth - container.clientWidth);
      setOverflowPx(diff > 6 ? diff + 16 : 0);
    };

    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => ro?.disconnect();
  }, [text]);

  const shouldSlide = overflowPx > 0 && isPlaying;
  const style = shouldSlide
    ? ({ '--marquee-offset': `-${overflowPx}px` } as CSSProperties)
    : undefined;

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <span
        ref={textRef}
        style={style}
        className={`inline-block whitespace-nowrap ${
          overflowPx > 0 ? 'anim-marquee' : ''
        } ${!shouldSlide ? 'anim-paused' : ''}`}
      >
        {text}
      </span>
    </div>
  );
}
