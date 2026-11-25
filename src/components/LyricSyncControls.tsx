import { RotateCcw, Timer } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatLyricSyncOffset } from '../utils/settingsAndFx';

interface LyricSyncControlsProps {
  compact?: boolean;
  light?: boolean;
}

export function LyricSyncControls({ compact = false, light = false }: LyricSyncControlsProps) {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const offsetMs = useAppStore((s) => s.activeLyricOffsetMs);
  const nudge = useAppStore((s) => s.nudgeTrackLyricOffsetMs);
  const setOffset = useAppStore((s) => s.setTrackLyricOffsetMs);

  const btnClass = light
    ? 'border border-black/15 bg-black/5 hover:bg-black/10 text-zinc-900'
    : 'border border-white/20 bg-white/10 hover:bg-white/20 text-white';

  return (
    <div
      data-lyric-sync-controls="true"
      aria-label="Sincronia da Letra"
      className={`rounded-xl border ${
        light ? 'border-black/10 bg-black/[0.04] text-zinc-900' : 'border-white/15 bg-black/25 text-white'
      } ${compact ? 'p-2.5 space-y-2' : 'p-3.5 space-y-2.5'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Timer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span>Sincronia da Letra</span>
          {currentTrack && !compact && (
            <span className="opacity-60 font-normal truncate max-w-[160px]">
              · {currentTrack.title}
            </span>
          )}
        </div>
        <span
          data-lyric-sync-readout="true"
          className="text-[11px] font-mono-tech font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 tabular-nums"
        >
          {formatLyricSyncOffset(offsetMs)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => nudge(-1000)}
          aria-label="Atrasar letra em 1 segundo"
          className={`px-2 py-1 rounded-lg text-[11px] font-mono-tech font-bold min-h-[30px] transition-transform active:scale-95 ${btnClass}`}
        >
          -1s
        </button>
        <button
          type="button"
          onClick={() => nudge(-100)}
          aria-label="Atrasar letra em 100 milissegundos"
          className={`px-2 py-1 rounded-lg text-[11px] font-mono-tech font-bold min-h-[30px] transition-transform active:scale-95 ${btnClass}`}
        >
          -100ms
        </button>
        <button
          type="button"
          onClick={() => setOffset(0)}
          disabled={offsetMs === 0}
          aria-label="Zerar atraso da letra (0ms)"
          className={`px-2 py-1 rounded-lg text-[11px] font-mono-tech font-bold min-h-[30px] inline-flex items-center gap-1 disabled:opacity-40 transition-transform active:scale-95 ${btnClass}`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>0ms</span>
        </button>
        <button
          type="button"
          onClick={() => nudge(100)}
          aria-label="Adiantar letra em 100 milissegundos"
          className={`px-2 py-1 rounded-lg text-[11px] font-mono-tech font-bold min-h-[30px] transition-transform active:scale-95 ${btnClass}`}
        >
          +100ms
        </button>
        <button
          type="button"
          onClick={() => nudge(1000)}
          aria-label="Adiantar letra em 1 segundo"
          className={`px-2 py-1 rounded-lg text-[11px] font-mono-tech font-bold min-h-[30px] transition-transform active:scale-95 ${btnClass}`}
        >
          +1s
        </button>

        <input
          type="range"
          min={-5000}
          max={5000}
          step={50}
          value={Math.max(-5000, Math.min(5000, offsetMs))}
          onChange={(e) => setOffset(Number(e.target.value))}
          aria-label="Ajuste fino da sincronia da letra em milissegundos"
          className="flex-1 min-w-[110px] accent-orange-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
