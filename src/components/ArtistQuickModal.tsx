import { useEffect, useMemo, useState } from 'react';
import { Loader2, Play, X } from 'lucide-react';
import { searchMusic } from '../services/streamingService';
import { useAppStore } from '../stores/useAppStore';
import type { Track, UIId } from '../types/music';
import { formatDuration } from '../utils/formatters';
import { normalizeArtistName } from '../utils/listeningHistory';
import { getThemePalette } from '../uis/shared/themePalette';
import { DownloadButton } from './DownloadButton';
import { TrackArtwork } from './TrackArtwork';

export function ArtistQuickModal({ uiId }: { uiId: UIId }) {
  const selectedArtist = useAppStore((s) => s.selectedArtist);
  const closeArtistView = useAppStore((s) => s.closeArtistView);
  const queue = useAppStore((s) => s.queue);
  const recentHistory = useAppStore((s) => s.recentHistory);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const playTrack = useAppStore((s) => s.playTrack);
  const isOnline = useAppStore((s) => s.isOnline);
  const themeMode = useAppStore((s) => s.themeMode);

  const [fetchedTracks, setFetchedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const isDark = themeMode === 'dark';
  const palette = getThemePalette(uiId);

  const localArtistTracks = useMemo(() => {
    if (!selectedArtist) return [];
    const target = selectedArtist.name.toLowerCase();
    const seen = new Set<string>();
    const out: Track[] = [];
    for (const entry of recentHistory) {
      const name = normalizeArtistName(entry.track.artist).toLowerCase();
      if ((name === target || name.includes(target)) && !seen.has(entry.track.id)) {
        seen.add(entry.track.id);
        out.push(entry.track);
      }
    }
    for (const t of queue) {
      const name = normalizeArtistName(t.artist).toLowerCase();
      if ((name === target || name.includes(target)) && !seen.has(t.id)) {
        seen.add(t.id);
        out.push(t);
      }
    }
    return out;
  }, [selectedArtist, recentHistory, queue]);

  useEffect(() => {
    if (!selectedArtist || !isOnline) {
      setFetchedTracks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchedTracks([]);

    void searchMusic(selectedArtist.name)
      .then((res) => {
        if (!cancelled) {
          setFetchedTracks(res.tracks);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedArtist, isOnline]);

  const combinedTracks = useMemo(() => {
    const seen = new Set<string>();
    const out: Track[] = [];
    for (const t of [...fetchedTracks, ...localArtistTracks]) {
      if (!t?.id || seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
    }
    return out;
  }, [fetchedTracks, localArtistTracks]);

  if (!selectedArtist) return null;

  const heroArt = selectedArtist.artwork || combinedTracks[0]?.artwork;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Artista ${selectedArtist.name}`}
      className="fixed inset-0 z-[55] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        data-lg-surface="true"
        className={`w-full max-w-2xl max-h-[84vh] flex flex-col overflow-hidden shadow-2xl ${palette.radius} ${palette.shell(
          isDark
        )} border border-current/20`}
      >
        <div className="p-4 sm:p-5 border-b border-current/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-current/25 shrink-0">
              <TrackArtwork src={heroArt} alt={selectedArtist.name} />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-mono-tech uppercase tracking-wider ${palette.accentText(isDark)}`}>
                ARTISTA OFICIAL
              </p>
              <h2 className={`text-lg sm:text-xl font-bold truncate ${palette.headingFont}`}>
                {selectedArtist.name}
              </h2>
              <p className="text-xs opacity-65">
                {loading
                  ? 'Buscando músicas oficiais mais populares...'
                  : `${combinedTracks.length} músicas oficiais encontradas`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeArtistView}
            aria-label="Fechar artista"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-current/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 thin-scroll">
          {combinedTracks.length > 0 && (
            <button
              type="button"
              onClick={() => void playTrack(combinedTracks[0], combinedTracks)}
              className={`mb-2 px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 min-h-[42px] ${palette.radius} ${palette.accentBg}`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Tocar Populares de {selectedArtist.name}</span>
            </button>
          )}

          {loading && combinedTracks.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 opacity-75">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Carregando faixas oficiais de {selectedArtist.name}...</span>
            </div>
          ) : combinedTracks.length === 0 ? (
            <div className="py-10 text-center text-sm opacity-70">
              Nenhuma faixa encontrada para este artista no momento.
            </div>
          ) : (
            combinedTracks.map((track, idx) => {
              const active = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between gap-3 p-2.5 transition-colors ${palette.radius} ${palette.card(
                    isDark
                  )} ${active ? 'ring-2 ring-current/50' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => void playTrack(track, combinedTracks)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[44px]"
                  >
                    <span className="text-xs font-mono-tech opacity-50 w-5 tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
                      <TrackArtwork src={track.artwork} alt={track.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{track.title}</div>
                      <div className="text-xs opacity-65 truncate">
                        {normalizeArtistName(track.artist)} · {formatDuration(track.duration)}
                      </div>
                    </div>
                  </button>
                  <DownloadButton track={track} compact />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
