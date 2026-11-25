import type { ChangeEvent } from 'react';
import { useAudioClock } from '../audio/audioClock';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';

interface IsolatedProgressProps {
  trackDuration?: number;
  variant?: 'default' | 'minimal' | 'brutalist' | 'retro-led' | 'eink' | 'car';
  accentColor?: string;
  textClass?: string;
  barBgClass?: string;
  barFillClass?: string;
  showTimes?: boolean;
  compact?: boolean;
}

/**
 * Isolated 60fps progress component. Subscribes directly to audioClock so
 * parent views and UI shells NEVER re-render on playback time ticks.
 */
export function IsolatedProgress({
  trackDuration,
  variant = 'default',
  accentColor,
  textClass = 'text-zinc-400',
  barBgClass = 'bg-white/15',
  barFillClass = 'bg-white',
  showTimes = true,
  compact = false,
}: IsolatedProgressProps) {
  const { currentTime, duration } = useAudioClock();
  const seekTo = useAppStore((s) => s.seekTo);

  const total = duration > 0 ? duration : trackDuration || 0;
  const pct = total > 0 ? Math.min(100, Math.max(0, (currentTime / total) * 100)) : 0;

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    seekTo(nextTime);
  };

  const trackHeight =
    variant === 'car'
      ? 'h-3'
      : variant === 'brutalist'
        ? 'h-4'
        : variant === 'minimal'
          ? 'h-[2px]'
          : compact
            ? 'h-1.5'
            : 'h-2';

  const radiusClass = variant === 'brutalist' || variant === 'eink' ? 'rounded-none' : 'rounded-full';

  return (
    <div className="w-full select-none">
      <div className={`relative w-full ${trackHeight} ${barBgClass} ${radiusClass} overflow-hidden`}>
        <div
          className={`h-full ${barFillClass} ${radiusClass} origin-left`}
          style={{
            transform: `scaleX(${pct / 100})`,
            backgroundColor: accentColor,
          }}
        />
        <input
          type="range"
          min={0}
          max={total || 100}
          step={0.1}
          value={Math.min(currentTime, total || 100)}
          onChange={handleSeek}
          aria-label="Progresso da música"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {showTimes && (
        <div className={`flex items-center justify-between mt-1.5 text-xs font-mono-tech ${textClass}`}>
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(total)}</span>
        </div>
      )}
    </div>
  );
}
