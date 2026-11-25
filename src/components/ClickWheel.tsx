import { useRef, type MouseEvent, type PointerEvent } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { accumulateScrollSteps, calculateWheelAngle, computeAngleDelta } from '../utils/clickWheelMath';

interface ClickWheelProps {
  onRotateStep: (direction: 1 | -1) => void;
  onMenu: () => void;
  onSelect: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  isPlaying: boolean;
  wheelClass?: string;
  centerClass?: string;
  labelClass?: string;
  sizeClass?: string;
}

/**
 * Tactile iPod Click Wheel using Pointer Capture + continuous atan2 angle tracking (~15°/step)
 * AND crisp 5-zone button clicks (Menu, Prev, Next, Play/Pause, Center Select).
 */
export function ClickWheel({
  onRotateStep,
  onMenu,
  onSelect,
  onPlayPause,
  onNext,
  onPrev,
  isPlaying,
  wheelClass = 'bg-zinc-100 border border-zinc-300 shadow-inner',
  centerClass = 'bg-zinc-200 border border-zinc-300 text-zinc-700',
  labelClass = 'text-zinc-500 hover:text-zinc-900',
  sizeClass = 'w-56 h-56',
}: ClickWheelProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const trackingRef = useRef<{
    active: boolean;
    pointerId: number | null;
    lastAngle: number;
    accumDeg: number;
    totalTravelDeg: number;
    startX: number;
    startY: number;
    suppressNextClick: boolean;
  }>({
    active: false,
    pointerId: null,
    lastAngle: 0,
    accumDeg: 0,
    totalTravelDeg: 0,
    startX: 0,
    startY: 0,
    suppressNextClick: false,
  });

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const el = wheelRef.current;
    if (!el) return;
    // Let center button behave strictly as a crisp select press
    if ((e.target as HTMLElement).closest('[data-wheel-center="true"]')) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = calculateWheelAngle(cx, cy, e.clientX, e.clientY);

    trackingRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastAngle: angle,
      accumDeg: 0,
      totalTravelDeg: 0,
      startX: e.clientX,
      startY: e.clientY,
      suppressNextClick: false,
    };

    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic events where pointerId cannot be captured
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const st = trackingRef.current;
    const el = wheelRef.current;
    if (!st.active || !el) return;
    if (st.pointerId !== null && e.pointerId !== st.pointerId) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nextAngle = calculateWheelAngle(cx, cy, e.clientX, e.clientY);
    const delta = computeAngleDelta(st.lastAngle, nextAngle);
    st.lastAngle = nextAngle;
    st.totalTravelDeg += Math.abs(delta);

    const distPx = Math.hypot(e.clientX - st.startX, e.clientY - st.startY);
    if (st.totalTravelDeg > 6 || distPx > 8) {
      st.suppressNextClick = true;
    }

    const { steps, remainderDeg } = accumulateScrollSteps(st.accumDeg, delta, 15);
    st.accumDeg = remainderDeg;

    if (steps !== 0) {
      const dir = steps > 0 ? 1 : -1;
      for (let i = 0; i < Math.abs(steps); i++) {
        onRotateStep(dir);
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(8);
        } catch {
          // Ignore
        }
      }
    }
  };

  const endTracking = (e: PointerEvent<HTMLDivElement>) => {
    const st = trackingRef.current;
    if (!st.active) return;
    st.active = false;
    const el = wheelRef.current;
    if (el && st.pointerId !== null) {
      try {
        if (el.hasPointerCapture(st.pointerId)) {
          el.releasePointerCapture(st.pointerId);
        }
      } catch {
        // Ignore
      }
    }
    st.pointerId = null;

    // Reset suppressNextClick shortly after click phase completes
    setTimeout(() => {
      trackingRef.current.suppressNextClick = false;
    }, 60);
  };

  const handleClickCapture = (e: MouseEvent<HTMLDivElement>) => {
    if (trackingRef.current.suppressNextClick) {
      e.preventDefault();
      e.stopPropagation();
      trackingRef.current.suppressNextClick = false;
    }
  };

  return (
    <div
      ref={wheelRef}
      data-click-wheel="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endTracking}
      onPointerCancel={endTracking}
      onClickCapture={handleClickCapture}
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      className={`relative rounded-full flex items-center justify-center select-none touch-none ${sizeClass} ${wheelClass}`}
      aria-label="iPod Click Wheel"
    >
      {/* Top: MENU */}
      <button
        type="button"
        onClick={onMenu}
        aria-label="Click Wheel Menu"
        className={`absolute top-2.5 left-1/2 -translate-x-1/2 min-h-[38px] min-w-[68px] text-[11px] font-bold tracking-wider uppercase flex items-center justify-center transition-colors select-none touch-none ${labelClass}`}
      >
        MENU
      </button>

      {/* Left: Previous */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Click Wheel Faixa Anterior"
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors select-none touch-none ${labelClass}`}
      >
        <SkipBack className="w-4 h-4 fill-current" />
      </button>

      {/* Right: Next */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Click Wheel Próxima Faixa"
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors select-none touch-none ${labelClass}`}
      >
        <SkipForward className="w-4 h-4 fill-current" />
      </button>

      {/* Bottom: Play / Pause */}
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Click Wheel Pausar' : 'Click Wheel Tocar'}
        className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 min-h-[40px] min-w-[64px] flex items-center justify-center gap-0.5 transition-colors select-none touch-none ${labelClass}`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
      </button>

      {/* Center Select Button */}
      <button
        type="button"
        data-wheel-center="true"
        onClick={onSelect}
        aria-label="Click Wheel Selecionar"
        className={`w-[36%] h-[36%] rounded-full flex items-center justify-center active:scale-95 transition-transform select-none touch-none ${centerClass}`}
      >
        <span className="sr-only">Selecionar</span>
      </button>
    </div>
  );
}
