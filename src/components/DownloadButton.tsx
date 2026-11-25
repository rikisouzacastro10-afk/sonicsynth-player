import { CheckCircle2, Clock, Download, Loader2, WifiOff } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import type { Track } from '../types/music';

interface DownloadButtonProps {
  track: Track;
  compact?: boolean;
  className?: string;
}

export function DownloadButton({ track, compact = false, className = '' }: DownloadButtonProps) {
  const offlineTracks = useAppStore((s) => s.offlineTracks);
  const task = useAppStore((s) => s.downloadQueue[track.id]);
  const downloadTrack = useAppStore((s) => s.downloadTrack);
  const removeOfflineTrack = useAppStore((s) => s.removeOfflineTrack);

  const isDownloaded = offlineTracks.some((r) => r.id === track.id);

  if (isDownloaded) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          void removeOfflineTrack(track.id);
        }}
        title="Baixada offline (clique para remover)"
        aria-label={`Remover download de ${track.title}`}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-colors ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        {!compact && <span className="whitespace-nowrap">Offline</span>}
      </button>
    );
  }

  if (task?.status === 'downloading') {
    return (
      <div
        className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] min-w-[40px] px-2.5 text-xs font-mono-tech ${className}`}
        aria-label={`Baixando ${track.title}: ${task.progress}%`}
      >
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>{task.progress}%</span>
      </div>
    );
  }

  if (task?.status === 'paused_offline') {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1 min-h-[40px] px-2 text-xs text-amber-500 ${className}`}
        title="Pausado até conexão voltar"
      >
        <WifiOff className="w-3.5 h-3.5" />
        {!compact && <span>Pausado</span>}
      </span>
    );
  }

  if (task?.status === 'queued') {
    return (
      <span
        className={`inline-flex items-center justify-center gap-1 min-h-[40px] px-2 text-xs opacity-70 ${className}`}
        title="Na fila de download"
      >
        <Clock className="w-3.5 h-3.5" />
        {!compact && <span>Fila</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void downloadTrack(track);
      }}
      title="Baixar para ouvir offline"
      aria-label={`Baixar ${track.title}`}
      className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] min-w-[40px] px-2.5 rounded-lg text-xs font-medium hover:bg-current/10 transition-colors ${className}`}
    >
      <Download className="w-4 h-4 shrink-0" />
      {!compact && <span className="whitespace-nowrap">Baixar</span>}
    </button>
  );
}
