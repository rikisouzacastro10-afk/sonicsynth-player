import {
  Mic2,
  Pause,
  Play,
  Repeat,
  ShieldCheck,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  WifiOff,
} from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';

export default function ModernSimpMusicUI() {
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const isLyricsOpen = useAppStore((s) => s.isLyricsOpen);
  const setLyricsOpen = useAppStore((s) => s.setLyricsOpen);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const isOnline = useAppStore((s) => s.isOnline);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const shuffle = useAppStore((s) => s.shuffle);
  const repeatMode = useAppStore((s) => s.repeatMode);
  const volume = useAppStore((s) => s.volume);
  const isLoadingTrending = useAppStore((s) => s.isLoadingTrending);
  const sponsorBlockEnabled = useAppStore((s) => s.sponsorBlockEnabled);

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const setVolume = useAppStore((s) => s.setVolume);
  const toggleShuffle = useAppStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useAppStore((s) => s.cycleRepeatMode);
  const playTrack = useAppStore((s) => s.playTrack);

  return (
    <div
      data-ui-id="modern-simpmusic-flow"
      className={`min-h-screen w-full flex flex-col pb-28 transition-colors ${
        isDark ? 'bg-[#0B0D14] text-zinc-100' : 'bg-[#F3F5FA] text-zinc-900'
      }`}
    >
      {/* Clean Brand & Signal Bar */}
      <header
        className={`w-full border-b px-4 sm:px-8 py-3.5 ${
          isDark ? 'border-zinc-800/80 bg-[#0E111A]/90' : 'border-zinc-200 bg-white/90'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight">
              SonicMorph
            </span>
            <span
              className={`hidden sm:inline-flex text-[10px] font-mono-tech px-2 py-0.5 rounded-md border ${
                isDark
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700'
              }`}
            >
              FLOW ENGINE · 24-BIT
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 opacity-80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">SponsorBlock {sponsorBlockEnabled ? 'Ativo' : 'Pausado'}</span>
            </span>
            {!isOnline && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500 text-[11px] font-semibold inline-flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left: Focused Now Playing Stage */}
            <div
              className={`xl:col-span-6 rounded-2xl border p-5 sm:p-6 space-y-5 shadow-xl relative overflow-hidden ${
                isDark ? 'bg-[#121622] border-zinc-800/80' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono-tech opacity-75">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-500' : 'bg-zinc-500'}`} />
                  {currentTrack?.source
                    ? `STREAM · ${currentTrack.source.toUpperCase()}`
                    : isOnline
                      ? 'EM ALTA AGORA'
                      : 'OFFLINE'}
                </span>
                <span>{isPlaying ? 'SYNC ACTIVE · 60FPS' : 'STANDBY'}</span>
              </div>

              <div className="relative max-w-[300px] mx-auto">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass="from-indigo-500/45 via-sky-500/25 to-violet-500/45"
                  roundedClass="rounded-3xl"
                />
                <div
                  className={`relative aspect-square rounded-2xl overflow-hidden shadow-2xl border ${
                    isDark ? 'border-white/15' : 'border-zinc-200'
                  }`}
                >
                  <TrackArtwork
                    src={currentTrack?.artwork}
                    alt={currentTrack?.title || 'Capa do álbum'}
                  />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <MarqueeText
                    text={
                      currentTrack?.title ||
                      (isLoadingTrending ? 'Carregando sucessos reais...' : 'Nenhuma faixa carregada')
                    }
                    isPlaying={isPlaying}
                    className="font-display text-xl sm:text-2xl font-bold"
                  />
                  <p className={`text-sm truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {currentTrack
                      ? `${currentTrack.artist} · ${currentTrack.album}`
                      : isOnline
                        ? 'Conectando às paradas ao vivo'
                        : 'Conecte-se ou acesse suas músicas baixadas'}
                  </p>
                </div>
                {currentTrack && <DownloadButton track={currentTrack} />}
              </div>

              <div className="space-y-2">
                <AnimatedEqBars isPlaying={isPlaying} bars={24} barClass="bg-indigo-500/85" heightClass="h-6" />
                <LedPeakMeter isPlaying={isPlaying} label="OUT" isDark={isDark} />
              </div>

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
                barFillClass="bg-indigo-500"
                textClass={isDark ? 'text-zinc-400' : 'text-zinc-600'}
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleShuffle}
                  aria-label="Ordem aleatória"
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
                    shuffle
                      ? 'text-indigo-500 bg-indigo-500/15'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void prevTrack()}
                    aria-label="Faixa anterior"
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
                    }`}
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                    className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void nextTrack()}
                    aria-label="Próxima faixa"
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-200 hover:bg-zinc-300'
                    }`}
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={cycleRepeatMode}
                  aria-label={`Repetir: ${repeatMode}`}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
                    repeatMode !== 'off'
                      ? 'text-indigo-500 bg-indigo-500/15'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Volume2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-[11px] font-mono-tech opacity-75 w-9 text-right tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              <div className="flex justify-end pt-1 xl:hidden">
                <button
                  type="button"
                  onClick={() => setLyricsOpen(!isLyricsOpen)}
                  className="inline-flex items-center gap-1.5 text-indigo-500 hover:text-indigo-400 text-xs font-medium"
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>{isLyricsOpen ? 'Ver Fila' : 'Ver Letras'}</span>
                </button>
              </div>
            </div>

            {/* Right: Queue & Synced Lyrics Panel */}
            <div className="xl:col-span-6 space-y-5">
              <div
                className={`rounded-2xl border p-5 ${
                  isDark ? 'bg-[#121622] border-zinc-800/80' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-display font-bold">Letras Sincronizadas</h2>
                  <span className="text-[11px] opacity-65">Toque na linha para avançar</span>
                </div>
                <div className="max-h-64 overflow-y-auto thin-scroll">
                  <LyricsPanel variant={isDark ? 'dark' : 'light'} />
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  isDark ? 'bg-[#121622] border-zinc-800/80' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-display font-bold">Fila de Reprodução ({queue.length})</h2>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto thin-scroll">
                  {queue.map((track) => {
                    const active = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-colors ${
                          active
                            ? 'bg-indigo-500/15 border border-indigo-500/40'
                            : isDark
                              ? 'hover:bg-white/5'
                              : 'hover:bg-zinc-100'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void playTrack(track, queue)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[44px]"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <TrackArtwork src={track.artwork} alt={track.title} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{track.title}</div>
                            <div className="text-xs opacity-65 truncate">{track.artist}</div>
                          </div>
                        </button>
                        <DownloadButton track={track} compact />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
      </main>

      <ThemedDock
        uiId="modern-simpmusic-flow"
        activeTab={activeSection}
        onSelectTab={setActiveSection}
      />
    </div>
  );
}
