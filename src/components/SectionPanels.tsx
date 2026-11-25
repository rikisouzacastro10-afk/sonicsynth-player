import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  BatteryCharging,
  Check,
  Clock3,
  Crown,
  Disc3,
  Download,
  Eye,
  EyeOff,
  Flame,
  FolderDown,
  FolderUp,
  HardDrive,
  KeyRound,
  Layers,
  ListMusic,
  Loader2,
  LogOut,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Waves,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  getEffectiveYouTubeApiKey,
  getSavedYouTubeApiKey,
  setSavedYouTubeApiKey,
} from '../services/streamingService';
import { useAppStore } from '../stores/useAppStore';
import { UI_CATALOG, type Playlist, type Track } from '../types/music';
import { formatBytes, formatDuration } from '../utils/formatters';
import { normalizeArtistName } from '../utils/listeningHistory';
import {
  formatSleepCountdown,
  LIQUID_GLASS_LABELS,
  type LiquidGlassLevel,
  type SleepTimerOption,
} from '../utils/settingsAndFx';
import { DownloadButton } from './DownloadButton';
import { LyricSyncControls } from './LyricSyncControls';
import { TrackArtwork } from './TrackArtwork';

interface PanelThemeProps {
  light?: boolean;
}

export function SearchPanel({ light = false }: PanelThemeProps) {
  const isOnline = useAppStore((s) => s.isOnline);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const searchResults = useAppStore((s) => s.searchResults);
  const searchSourceLabel = useAppStore((s) => s.searchSourceLabel);
  const isSearching = useAppStore((s) => s.isSearching);
  const performSearch = useAppStore((s) => s.performSearch);
  const playTrack = useAppStore((s) => s.playTrack);
  const openArtistView = useAppStore((s) => s.openArtistView);
  const currentTrack = useAppStore((s) => s.currentTrack);

  const [input, setInput] = useState(searchQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void performSearch(input);
  };

  const cardBg = light ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10';
  const inputBg = light
    ? 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500'
    : 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-display font-bold">Buscar Músicas</h2>
          <p className="text-xs opacity-70">
            {isOnline
              ? `YouTube Music · Fonte: ${searchSourceLabel}`
              : 'Modo Offline · Buscando nas faixas baixadas localmente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isOnline ? 'Buscar música, álbum ou artista...' : 'Filtrar músicas baixadas...'}
            aria-label="Campo de busca musical"
            className={`w-full h-11 pl-10 pr-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium inline-flex items-center gap-2 shrink-0 transition-colors"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Buscar</span>
        </button>
      </form>

      {searchResults.length === 0 ? (
        <div className={`p-8 rounded-xl border text-center ${cardBg}`}>
          <p className="text-sm font-medium">Nenhuma faixa encontrada</p>
          <p className="text-xs opacity-70 mt-1">
            {isOnline
              ? 'Tente outro artista ou termo de busca.'
              : 'Baixe faixas quando estiver online para ouvi-las sem internet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {searchResults.map((track) => {
            const active = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-colors ${
                  active ? 'border-indigo-500 bg-indigo-500/10' : `${cardBg} hover:border-current/25`
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 min-h-[44px]">
                  <button
                    type="button"
                    onClick={() => void playTrack(track, searchResults)}
                    aria-label={`Tocar ${track.title}`}
                    className="w-11 h-11 rounded-lg overflow-hidden shrink-0"
                  >
                    <TrackArtwork src={track.artwork} alt={track.title} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => void playTrack(track, searchResults)}
                      className="text-sm font-semibold truncate block w-full text-left hover:underline"
                    >
                      {track.title}
                    </button>
                    <div className="text-xs opacity-70 truncate flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openArtistView(normalizeArtistName(track.artist), track.artwork)}
                        className="truncate hover:underline hover:opacity-100"
                      >
                        {normalizeArtistName(track.artist)}
                      </button>
                      <span className="shrink-0">· {formatDuration(track.duration)}</span>
                    </div>
                  </div>
                </div>
                <DownloadButton track={track} compact />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LibraryPanel({ light = false }: PanelThemeProps) {
  const isOnline = useAppStore((s) => s.isOnline);
  const libraryTab = useAppStore((s) => s.libraryTab);
  const setLibraryTab = useAppStore((s) => s.setLibraryTab);
  const offlineTracks = useAppStore((s) => s.offlineTracks);
  const playlists = useAppStore((s) => s.playlists);
  const downloadQueue = useAppStore((s) => s.downloadQueue);
  const downloadPlaylist = useAppStore((s) => s.downloadPlaylist);
  const playTrack = useAppStore((s) => s.playTrack);
  const currentTrack = useAppStore((s) => s.currentTrack);

  const activeTasks = Object.values(downloadQueue).filter((t) => t.status !== 'downloaded');
  const cardBg = light ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10';

  const handlePlayAllOffline = () => {
    const tracks = offlineTracks.map((r) => r.track);
    if (tracks.length > 0) void playTrack(tracks[0], tracks);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold">Biblioteca &amp; Offline</h2>
          <p className="text-xs opacity-70">
            {offlineTracks.length} músicas salvas localmente · {!isOnline ? 'Modo Offline ativo' : 'Sincronizado'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg border border-current/15">
          {[
            { id: 'downloaded', label: `Baixadas (${offlineTracks.length})` },
            { id: 'playlists', label: `Playlists (${playlists.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setLibraryTab(t.id as 'downloaded' | 'playlists')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium min-h-[36px] transition-colors ${
                libraryTab === t.id ? 'bg-indigo-600 text-white' : 'opacity-75 hover:opacity-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTasks.length > 0 && (
        <div className={`p-3 rounded-xl border ${cardBg}`}>
          <div className="text-xs font-semibold mb-2 flex items-center justify-between">
            <span>Fila de Downloads ({activeTasks.length})</span>
            {!isOnline && <span className="text-amber-500">Pausado (sem rede)</span>}
          </div>
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <div key={task.trackId} className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="truncate pr-2">{task.track.title}</span>
                  <span className="font-mono-tech">{task.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-current/15 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 origin-left"
                    style={{ transform: `scaleX(${task.progress / 100})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {libraryTab === 'downloaded' ? (
        offlineTracks.length === 0 ? (
          <div className={`p-8 rounded-xl border text-center ${cardBg}`}>
            <FolderDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhuma música baixada ainda</p>
            <p className="text-xs opacity-70 mt-1">
              Toque em &quot;Baixar&quot; em qualquer faixa ou playlist para ouvir 100% sem internet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handlePlayAllOffline}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-2 min-h-[40px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Tocar Todas as Baixadas</span>
            </button>
            <div className="space-y-1.5">
              {offlineTracks.map((rec) => {
                const active = currentTrack?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                      active ? 'border-emerald-500 bg-emerald-500/10' : cardBg
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void playTrack(
                          rec.track,
                          offlineTracks.map((o) => o.track)
                        )
                      }
                      className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[44px]"
                    >
                      <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
                        <TrackArtwork src={rec.track.artwork} alt={rec.track.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{rec.track.title}</div>
                        <div className="text-xs opacity-70 truncate">
                          {rec.track.artist} · {formatBytes(rec.sizeBytes)}
                        </div>
                      </div>
                    </button>
                    <DownloadButton track={rec.track} compact />
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {playlists.map((pl) => (
            <div key={pl.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${cardBg}`}>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <TrackArtwork src={pl.coverArt || pl.tracks[0]?.artwork} alt={pl.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold truncate">{pl.title}</h3>
                  <p className="text-xs opacity-70 line-clamp-2 mt-0.5">{pl.description}</p>
                  <p className="text-[11px] opacity-60 mt-1">{pl.tracks.length} faixas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => pl.tracks[0] && void playTrack(pl.tracks[0], pl.tracks)}
                  className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tocar</span>
                </button>
                <button
                  type="button"
                  onClick={() => void downloadPlaylist(pl)}
                  className="h-10 px-3 rounded-lg border border-current/20 hover:bg-current/10 text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Playlist</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AiGeneratorPanel({ light = false }: PanelThemeProps) {
  const isOnline = useAppStore((s) => s.isOnline);
  const isGeneratingAi = useAppStore((s) => s.isGeneratingAi);
  const aiError = useAppStore((s) => s.aiError);
  const lastAiPlaylist = useAppStore((s) => s.lastAiPlaylist);
  const createAiPlaylist = useAppStore((s) => s.createAiPlaylist);
  const savePlaylist = useAppStore((s) => s.savePlaylist);
  const downloadPlaylist = useAppStore((s) => s.downloadPlaylist);
  const playTrack = useAppStore((s) => s.playTrack);
  const playlists = useAppStore((s) => s.playlists);

  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(6);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    void createAiPlaylist(prompt, count);
  };

  const isSaved = lastAiPlaylist ? playlists.some((p) => p.id === lastAiPlaylist.id) : false;
  const cardBg = light ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10';
  const inputBg = light
    ? 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500'
    : 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500';

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Gerador de Playlists por IA</span>
        </h2>
        <p className="text-xs opacity-70 mt-0.5">
          Descreva o clima, gênero ou momento e monte uma playlist pronta para tocar e baixar sem precisar de chave.
        </p>
      </div>

      {!isOnline && (
        <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-400 flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Modo Offline: o gerador por IA será reativado automaticamente quando a rede retornar.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
        <div>
          <label htmlFor="ai-prompt-input" className="block text-xs font-medium mb-1.5">
            O que você quer ouvir?
          </label>
          <textarea
            id="ai-prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Jazz japonês suave e lo-fi para programar na madrugada chuvosa..."
            className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="ai-track-count" className="text-xs font-medium">
              Quantidade de faixas:
            </label>
            <select
              id="ai-track-count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className={`h-10 px-3 rounded-lg border text-xs font-mono-tech ${inputBg}`}
            >
              {[4, 6, 8, 10, 12, 15].map((n) => (
                <option key={n} value={n}>
                  {n} faixas
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!isOnline || isGeneratingAi || !prompt.trim()}
            className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            {isGeneratingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGeneratingAi ? 'Curando faixas...' : 'Gerar Playlist'}</span>
          </button>
        </div>
      </form>

      {aiError && (
        <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs text-rose-400">
          {aiError}
        </div>
      )}

      {lastAiPlaylist && (
        <div className={`p-4 rounded-xl border space-y-4 ${cardBg}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-display font-bold">{lastAiPlaylist.title}</h3>
              <p className="text-xs opacity-75 mt-0.5">{lastAiPlaylist.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  lastAiPlaylist.tracks[0] &&
                  void playTrack(lastAiPlaylist.tracks[0], lastAiPlaylist.tracks)
                }
                className="h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tocar Agora</span>
              </button>
              <button
                type="button"
                onClick={() => void savePlaylist(lastAiPlaylist)}
                disabled={isSaved}
                className="h-9 px-3.5 rounded-lg border border-current/20 hover:bg-current/10 text-xs font-medium inline-flex items-center gap-1.5"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Salva' : 'Salvar na Biblioteca'}</span>
              </button>
              <button
                type="button"
                onClick={() => void downloadPlaylist(lastAiPlaylist)}
                className="h-9 px-3.5 rounded-lg border border-current/20 hover:bg-current/10 text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Playlist Completa</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {lastAiPlaylist.tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-current/5"
              >
                <button
                  type="button"
                  onClick={() => void playTrack(track, lastAiPlaylist.tracks)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[40px]"
                >
                  <span className="text-xs font-mono-tech opacity-50 w-5">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{track.title}</div>
                    <div className="text-xs opacity-70 truncate">{track.artist}</div>
                  </div>
                </button>
                <DownloadButton track={track} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingToggleRow({
  icon: Icon,
  iconColor = 'text-indigo-400',
  title,
  description,
  active,
  onToggle,
  activeLabel = 'Ativo',
  inactiveLabel = 'Desativado',
}: {
  icon: typeof Sparkles;
  iconColor?: string;
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <div className="pt-3 border-t border-current/10 flex items-center justify-between gap-3 first:pt-0 first:border-t-0">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs opacity-70">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        aria-label={`${title}: ${active ? activeLabel : inactiveLabel}`}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] shrink-0 transition-colors ${
          active ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-200'
        }`}
      >
        {active ? activeLabel : inactiveLabel}
      </button>
    </div>
  );
}

export function SettingsStoragePanel({ light = false }: PanelThemeProps) {
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const preferences = useAppStore((s) => s.preferences);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const sleepTimerMode = useAppStore((s) => s.sleepTimerMode);
  const sleepRemainingSec = useAppStore((s) => s.sleepRemainingSec);
  const setSleepTimer = useAppStore((s) => s.setSleepTimer);
  const setAudioFxOpen = useAppStore((s) => s.setAudioFxOpen);
  const setYtPremiumModalOpen = useAppStore((s) => s.setYtPremiumModalOpen);

  const ytAuthUser = useAppStore((s) => s.ytAuthUser);
  const ytHasAccessToken = useAppStore((s) => s.ytHasAccessToken);
  const ytAuthLoading = useAppStore((s) => s.ytAuthLoading);
  const ytAuthError = useAppStore((s) => s.ytAuthError);
  const accountPlaylists = useAppStore((s) => s.accountPlaylists);
  const accountLikedTracks = useAppStore((s) => s.accountLikedTracks);
  const connectYouTubeAccount = useAppStore((s) => s.connectYouTubeAccount);
  const disconnectYouTubeAccount = useAppStore((s) => s.disconnectYouTubeAccount);
  const refreshYouTubeAccountLibrary = useAppStore((s) => s.refreshYouTubeAccountLibrary);

  const isOnline = useAppStore((s) => s.isOnline);
  const connectionType = useAppStore((s) => s.connectionType);
  const offlineTracks = useAppStore((s) => s.offlineTracks);
  const storageUsedBytes = useAppStore((s) => s.storageUsedBytes);
  const storageQuotaBytes = useAppStore((s) => s.storageQuotaBytes);
  const sponsorBlockEnabled = useAppStore((s) => s.sponsorBlockEnabled);
  const skippedSponsorCount = useAppStore((s) => s.skippedSponsorCount);
  const toggleSponsorBlock = useAppStore((s) => s.toggleSponsorBlock);
  const removeOfflineTrack = useAppStore((s) => s.removeOfflineTrack);
  const clearOfflineCache = useAppStore((s) => s.clearOfflineCache);
  const loadTrendingHome = useAppStore((s) => s.loadTrendingHome);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const performSearch = useAppStore((s) => s.performSearch);
  const setStatusBanner = useAppStore((s) => s.setStatusBanner);
  const exportBackupJson = useAppStore((s) => s.exportBackupJson);
  const importBackupJson = useAppStore((s) => s.importBackupJson);

  const [ytApiKeyInput, setYtApiKeyInput] = useState(() => getSavedYouTubeApiKey());
  const [savedLocalKey, setSavedLocalKey] = useState(() => getSavedYouTubeApiKey());
  const [showYtKey, setShowYtKey] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const hasEnvYtKey = Boolean((import.meta.env.VITE_YOUTUBE_API_KEY || '').trim());
  const effectiveYtKey = getEffectiveYouTubeApiKey();

  const cardBg = light ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10';
  const inputBg = light
    ? 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500'
    : 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500';

  const handleSaveYtKey = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = ytApiKeyInput.trim();
    setSavedYouTubeApiKey(cleaned);
    setSavedLocalKey(cleaned);
    setYtApiKeyInput(cleaned);
    setStatusBanner(
      cleaned
        ? 'YouTube Data API Key salva localmente — atualizando catálogo'
        : 'Chave removida — usando busca automática do YouTube Music'
    );
    void loadTrendingHome();
    if (searchQuery.trim()) {
      void performSearch(searchQuery);
    }
  };

  const handleClearYtKey = () => {
    setSavedYouTubeApiKey('');
    setSavedLocalKey('');
    setYtApiKeyInput('');
    setStatusBanner('Chave YouTube Data API removida — modo automático ativo');
    void loadTrendingHome();
    if (searchQuery.trim()) {
      void performSearch(searchQuery);
    }
  };

  const handleExportBackup = () => {
    setBackupError(null);
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonicmorph-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatusBanner('Backup .json exportado com sucesso');
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBackupError(null);
    try {
      const text = await file.text();
      await importBackupJson(text);
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Falha ao importar arquivo .json.');
    }
  };

  const sleepOptions: Array<{ id: SleepTimerOption; label: string }> = [
    { id: 'off', label: 'Desativado' },
    { id: '15', label: '15 min' },
    { id: '30', label: '30 min' },
    { id: '45', label: '45 min' },
    { id: '60', label: '60 min' },
    { id: 'end_of_track', label: 'Fim da música' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold">Ajustes &amp; Armazenamento</h2>
        <p className="text-xs opacity-70">
          Aparência Liquid Glass, SpicyLyrics, Áudio DSP, Conta YouTube &amp; Backup Local
        </p>
      </div>

      {/* 1. APARÊNCIA & EFEITOS */}
      <section className="space-y-3" aria-label="Aparência e Efeitos">
        <h3 className="text-xs font-mono-tech uppercase tracking-wider font-bold text-indigo-400">
          1. Aparência &amp; Efeitos
        </h3>

        <div className={`p-4 rounded-xl border space-y-3.5 ${cardBg}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                Aparência Global ({UI_CATALOG.length} UIs)
              </div>
              <div className="text-xs opacity-70">
                Alterne instantaneamente entre Modo Claro e Modo Escuro
              </div>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg border border-current/15">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold min-h-[36px] transition-colors ${
                  themeMode === 'light' ? 'bg-indigo-600 text-white' : 'opacity-75 hover:opacity-100'
                }`}
              >
                Claro
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold min-h-[36px] transition-colors ${
                  themeMode === 'dark' ? 'bg-indigo-600 text-white' : 'opacity-75 hover:opacity-100'
                }`}
              >
                Escuro
              </button>
            </div>
          </div>

          {/* 3 Intensity Levels for Liquid Glass */}
          <div className="pt-3 border-t border-current/10 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Layers className="w-4 h-4 mt-0.5 shrink-0 text-sky-400" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">Liquid Glass (iOS 26 / visionOS)</div>
                  <span className="text-[11px] font-mono-tech font-bold text-sky-400">
                    {LIQUID_GLASS_LABELS[preferences.liquidGlass]}
                  </span>
                </div>
                <div className="text-xs opacity-70">
                  Escolha a intensidade de vidro refrativo na Dock, Mini-Player, cards e modais
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Nível de Liquid Glass">
              {(['off', 'basic', 'medium', 'high'] as LiquidGlassLevel[]).map((lvl) => {
                const active = preferences.liquidGlass === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updatePreferences({ liquidGlass: lvl })}
                    aria-pressed={active}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] transition-colors ${
                      active
                        ? 'bg-sky-500 text-zinc-950 font-bold shadow-sm'
                        : light
                          ? 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {LIQUID_GLASS_LABELS[lvl]}
                  </button>
                );
              })}
            </div>
          </div>

          <SettingToggleRow
            icon={Flame}
            iconColor="text-orange-400"
            title="SpicyLyrics (Letras Imersivas)"
            description="Fundo fluido colorido pela capa, preenchimento palavra por palavra e blur de profundidade"
            active={preferences.spicyLyrics}
            onToggle={() => updatePreferences({ spicyLyrics: !preferences.spicyLyrics })}
          />

          <div className="pt-2">
            <LyricSyncControls light={light} />
          </div>

          <SettingToggleRow
            icon={Sparkles}
            iconColor="text-pink-400"
            title="Brilho Dinâmico da Capa (Ambient Glow)"
            description="Aura colorida extraída da capa atrás do player em tela cheia e da interface"
            active={preferences.ambientGlow}
            onToggle={() => updatePreferences({ ambientGlow: !preferences.ambientGlow })}
          />

          <SettingToggleRow
            icon={BatteryCharging}
            iconColor="text-emerald-400"
            title="Modo Desempenho / Economia de Bateria"
            description={
              preferences.performanceMode === 'battery'
                ? 'Economia ativa: reduz animações ambientais e efeitos pesados'
                : 'Desempenho Máximo: animações fluidas a 60 FPS habilitadas'
            }
            active={preferences.performanceMode === 'battery'}
            onToggle={() =>
              updatePreferences({
                performanceMode: preferences.performanceMode === 'battery' ? 'full' : 'battery',
              })
            }
            activeLabel="Econômico"
            inactiveLabel="60 FPS"
          />
        </div>
      </section>

      {/* 2. ÁUDIO & REPRODUÇÃO */}
      <section className="space-y-3" aria-label="Áudio e Reprodução">
        <h3 className="text-xs font-mono-tech uppercase tracking-wider font-bold text-indigo-400">
          2. Áudio &amp; Reprodução
        </h3>

        <div className={`p-4 rounded-xl border space-y-4 ${cardBg}`}>
          {/* Audio FX Studio shortcut */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Sliders className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Audio FX Studio (DSP)</div>
                <div className="text-xs opacity-70">
                  Equalizador 5 bandas, Áudio 8D espacial, Reverb, Delay e Normalizador
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAudioFxOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold min-h-[38px]"
            >
              Abrir Estúdio FX
            </button>
          </div>

          {/* Sleep Timer */}
          <div className="pt-3 border-t border-current/10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold">Sleep Timer (Despertador Noturno)</span>
              </div>
              {sleepTimerMode !== 'off' && (
                <span className="text-xs font-mono-tech font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  {sleepTimerMode === 'end_of_track'
                    ? 'Pausa ao fim da faixa'
                    : `Restam ${formatSleepCountdown(sleepRemainingSec)}`}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sleepOptions.map((opt) => {
                const active = sleepTimerMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSleepTimer(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[34px] transition-colors ${
                      active
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : light
                          ? 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crossfade slider */}
          <div className="pt-3 border-t border-current/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-2">
                <Waves className="w-4 h-4 text-sky-400" />
                <span>Crossfade entre faixas</span>
              </span>
              <span className="font-mono-tech font-bold">
                {preferences.crossfadeSeconds === 0 ? 'Desligado' : `${preferences.crossfadeSeconds}s`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={preferences.crossfadeSeconds}
              aria-label="Crossfade em segundos"
              onChange={(e) => updatePreferences({ crossfadeSeconds: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <SettingToggleRow
            icon={Waves}
            iconColor="text-teal-400"
            title="Transição Suave (Smooth Fade)"
            description="Fade-in / fade-out gradual ao dar play, pausar ou trocar de música"
            active={preferences.smoothFade}
            onToggle={() => updatePreferences({ smoothFade: !preferences.smoothFade })}
          />

          <SettingToggleRow
            icon={Disc3}
            iconColor="text-violet-400"
            title="Reprodução Contínua do Álbum / Fila"
            description="Avança automaticamente para a próxima faixa ao término da atual"
            active={preferences.keepAlbumContinuous}
            onToggle={() =>
              updatePreferences({ keepAlbumContinuous: !preferences.keepAlbumContinuous })
            }
          />

          <SettingToggleRow
            icon={ShieldCheck}
            iconColor="text-emerald-400"
            title="SponsorBlock Automático"
            description={`Pula intros, outros e trechos não musicais (${skippedSponsorCount} pulados na sessão)`}
            active={sponsorBlockEnabled}
            onToggle={toggleSponsorBlock}
          />
        </div>
      </section>

      {/* 3. CONTA YOUTUBE & YOUTUBE PREMIUM */}
      <section className="space-y-3" aria-label="Conta YouTube e Premium">
        <h3 className="text-xs font-mono-tech uppercase tracking-wider font-bold text-indigo-400">
          3. Conta YouTube &amp; YouTube Premium
        </h3>

        <div className={`p-4 rounded-xl border space-y-4 ${cardBg}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Conta Google / Playlists do YouTube</div>
              <div className="text-xs opacity-70">
                Conecte via OAuth para importar suas playlists e músicas curtidas reais na Home
              </div>
            </div>

            {!ytAuthUser ? (
              <button
                type="button"
                disabled={ytAuthLoading}
                onClick={() => void connectYouTubeAccount()}
                className="gsi-material-button"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{ytAuthLoading ? 'Conectando...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {ytHasAccessToken ? (
                  <button
                    type="button"
                    disabled={ytAuthLoading}
                    onClick={() => void refreshYouTubeAccountLibrary()}
                    className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${ytAuthLoading ? 'animate-spin' : ''}`} />
                    <span>Sincronizar</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={ytAuthLoading}
                    onClick={() => void connectYouTubeAccount()}
                    className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reconectar Google</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void disconnectYouTubeAccount()}
                  className="h-9 px-3 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>

          {ytAuthUser && (
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {ytAuthUser.photoURL && (
                  <img
                    src={ytAuthUser.photoURL}
                    alt={ytAuthUser.displayName}
                    className="w-9 h-9 rounded-full shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{ytAuthUser.displayName}</div>
                  <div className="text-[11px] opacity-75 truncate">{ytAuthUser.email}</div>
                </div>
              </div>
              <div className="text-[11px] font-mono-tech text-right shrink-0">
                <div>{accountPlaylists.length} playlists</div>
                <div>{accountLikedTracks.length} curtidas</div>
              </div>
            </div>
          )}

          {ytAuthError && (
            <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs text-rose-400">
              {ytAuthError}
            </div>
          )}

          {/* YouTube Premium WebView Session */}
          <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Crown className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Sessão YouTube Premium</div>
                <div className="text-xs opacity-70">
                  {preferences.ytPremiumSession
                    ? 'Sessão de assinante persistida no player/WebView'
                    : 'Conecte sua sessão Premium para reprodução sem anúncios'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setYtPremiumModalOpen(true)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold min-h-[38px] ${
                preferences.ytPremiumSession
                  ? 'bg-amber-500 text-zinc-950'
                  : 'border border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              {preferences.ytPremiumSession ? 'Premium Ativo' : 'Configurar Sessão'}
            </button>
          </div>
        </div>
      </section>

      {/* 4. ARMAZENAMENTO & BACKUP */}
      <section className="space-y-3" aria-label="Armazenamento e Backup">
        <h3 className="text-xs font-mono-tech uppercase tracking-wider font-bold text-indigo-400">
          4. Armazenamento &amp; Backup
        </h3>

        {/* Export / Import JSON Backup */}
        <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
          <div>
            <div className="text-sm font-semibold">Backup Completo (.json)</div>
            <div className="text-xs opacity-70">
              Exporte ou restaure seu histórico real, artistas, favoritas, playlists salvas e preferências
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleExportBackup}
              className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <FolderDown className="w-4 h-4" />
              <span>Exportar Backup (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              className="h-10 px-4 rounded-lg border border-current/25 hover:bg-current/10 text-xs font-semibold inline-flex items-center gap-2"
            >
              <FolderUp className="w-4 h-4" />
              <span>Importar Backup (.json)</span>
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              onChange={(e) => void handleImportFile(e)}
              className="hidden"
            />
          </div>

          {backupError && (
            <div className="p-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs text-rose-400">
              {backupError}
            </div>
          )}
        </div>

        {/* YouTube Data API v3 Key */}
        <form onSubmit={handleSaveYtKey} className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">YouTube Data API v3 Key (Opcional)</div>
                <div className="text-xs opacity-70">
                  {savedLocalKey
                    ? 'Chave salva localmente no dispositivo · busca oficial com duração exata'
                    : hasEnvYtKey
                      ? 'Usando VITE_YOUTUBE_API_KEY configurada no ambiente'
                      : effectiveYtKey
                        ? 'Chave ativa · busca oficial YouTube Data API v3'
                        : 'Modo automático sem chave (Catálogo YouTube Music nativo ativo)'}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono-tech uppercase px-2 py-0.5 rounded border ${
                savedLocalKey || hasEnvYtKey
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-current/20 opacity-75'
              }`}
            >
              {savedLocalKey ? 'Chave Local' : hasEnvYtKey ? 'Env Key' : 'Sem Chave'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type={showYtKey ? 'text' : 'password'}
                value={ytApiKeyInput}
                onChange={(e) => setYtApiKeyInput(e.target.value)}
                placeholder="Cole sua AIza... (opcional)"
                aria-label="YouTube Data API Key"
                className={`w-full h-10 pl-3 pr-10 rounded-lg border text-xs font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
              />
              <button
                type="button"
                onClick={() => setShowYtKey((v) => !v)}
                aria-label={showYtKey ? 'Ocultar chave API' : 'Mostrar chave API'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-65 hover:opacity-100"
              >
                {showYtKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Chave</span>
            </button>
            {savedLocalKey && (
              <button
                type="button"
                onClick={handleClearYtKey}
                className="h-10 px-3 rounded-lg border border-current/20 hover:bg-current/10 text-xs font-medium"
              >
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Network & Offline Storage Manager */}
        <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-current/10">
            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-500" />
              )}
              <div className="text-xs font-semibold">
                {isOnline ? `Rede Conectada (${connectionType})` : 'Modo Offline Automático'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-sm font-semibold">Gerenciador de Armazenamento Offline</div>
                <div className="text-xs opacity-70 font-mono-tech">
                  {formatBytes(storageUsedBytes)} usados ({offlineTracks.length} faixas)
                  {storageQuotaBytes ? ` · Limite ${formatBytes(storageQuotaBytes)}` : ''}
                </div>
              </div>
            </div>
            {offlineTracks.length > 0 && (
              <button
                type="button"
                onClick={() => void clearOfflineCache()}
                className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-medium inline-flex items-center gap-1.5 min-h-[38px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Cache</span>
              </button>
            )}
          </div>

          {offlineTracks.length > 0 ? (
            <div className="space-y-1.5 pt-2 border-t border-current/10 max-h-60 overflow-y-auto thin-scroll">
              {offlineTracks.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between gap-3 py-1.5 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{rec.track.title}</div>
                    <div className="opacity-65 truncate">
                      {rec.track.artist} · {formatBytes(rec.sizeBytes)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeOfflineTrack(rec.id)}
                    aria-label={`Excluir download ${rec.track.title}`}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-65 pt-1">
              Nenhum arquivo de áudio armazenado no IndexedDB / Filesystem no momento.
            </p>
          )}
        </div>

        <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${cardBg}`}>
          <div className="font-semibold flex items-center gap-2 text-sm">
            <ListMusic className="w-4 h-4" />
            <span>Áudio em Segundo Plano &amp; Build APK</span>
          </div>
          <p className="opacity-75">
            Controles de tela de bloqueio habilitados via MediaSession API. Projeto estruturado com Capacitor Android (FOREGROUND_SERVICE, WAKE_LOCK e ACCESS_NETWORK_STATE).
          </p>
        </div>
      </section>
    </div>
  );
}
