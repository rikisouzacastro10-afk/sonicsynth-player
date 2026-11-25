import { useEffect } from 'react';
import { ArrowDown, ArrowUp, ListMusic, Play, Trash2, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { normalizeArtistName } from '../utils/listeningHistory';
import { TrackArtwork } from './TrackArtwork';

export function QueueManagerModal() {
  const isOpen = useAppStore((s) => s.isQueueModalOpen);
  const setOpen = useAppStore((s) => s.setQueueModalOpen);
  const queue = useAppStore((s) => s.queue);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const themeMode = useAppStore((s) => s.themeMode);
  const playTrack = useAppStore((s) => s.playTrack);
  const reorderQueue = useAppStore((s) => s.reorderQueue);
  const removeFromQueue = useAppStore((s) => s.removeFromQueue);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fila de Reprodução"
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        data-lg-surface="true"
        className={`w-full max-w-xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-stone-50 border-zinc-300 text-zinc-900'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold">
                Fila de Reprodução ({queue.length})
              </h2>
              <p className="text-[11px] opacity-70">
                Reordene ou remova faixas da fila atual sem interromper o áudio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar fila"
            className="min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center hover:bg-current/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 thin-scroll">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-sm opacity-70">A fila está vazia.</div>
          ) : (
            queue.map((track, idx) => {
              const active = currentTrack?.id === track.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  data-lg-card="true"
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
                    active
                      ? 'border-indigo-500 bg-indigo-500/15'
                      : isDark
                        ? 'border-zinc-800 bg-white/5'
                        : 'border-zinc-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void playTrack(track, queue)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[42px]"
                  >
                    <span className="text-[11px] font-mono-tech opacity-55 w-5 text-center shrink-0">
                      {active ? <Play className="w-3.5 h-3.5 text-indigo-400 fill-current mx-auto" /> : idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <TrackArtwork src={track.artwork} alt={track.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{track.title}</div>
                      <div className="text-[11px] opacity-65 truncate">
                        {normalizeArtistName(track.artist)} · {formatDuration(track.duration)}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => reorderQueue(idx, idx - 1)}
                      aria-label={`Mover ${track.title} para cima`}
                      className="min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center hover:bg-current/10 disabled:opacity-25"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === queue.length - 1}
                      onClick={() => reorderQueue(idx, idx + 1)}
                      aria-label={`Mover ${track.title} para baixo`}
                      className="min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center hover:bg-current/10 disabled:opacity-25"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(idx)}
                      aria-label={`Remover ${track.title} da fila`}
                      className="min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/15"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
