import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useAudioClock } from '../audio/audioClock';
import { DownloadButton } from '../components/DownloadButton';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

function CircularDialProgress({
  durationFallback,
  artwork,
  title,
  isDark,
  isPlaying,
}: {
  durationFallback: number;
  artwork?: string;
  title?: string;
  isDark: boolean;
  isPlaying: boolean;
}) {
  const { currentTime, duration } = useAudioClock();
  const seekTo = useAppStore((s) => s.seekTo);
  const total = duration > 0 ? duration : durationFallback || 1;
  const pct = Math.min(1, Math.max(0, currentTime / total));
  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <ArtworkAura
          isPlaying={isPlaying}
          gradientClass="from-[#E85D04]/30 via-amber-400/15 to-orange-500/30"
          roundedClass="rounded-full"
        />
        <svg className="relative z-10 w-full h-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
          <circle cx="130" cy="130" r={radius} fill="none" stroke={isDark ? '#2B2B2D' : '#E0DFDA'} strokeWidth="4" />
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke="#E85D04"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div
          className={`absolute inset-8 z-10 rounded-full overflow-hidden border shadow-sm anim-spin-vinyl ${
            !isPlaying ? 'anim-paused' : ''
          } ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}
          style={{ animationDuration: '14s' }}
        >
          <TrackArtwork src={artwork} alt={title || 'Capa'} />
        </div>
      </div>

      <div className="w-64 flex items-center gap-3">
        <span className="text-xs font-mono-tech opacity-65 tabular-nums">{formatDuration(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={total}
          step={0.2}
          value={Math.min(currentTime, total)}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Controle circular de tempo"
          className="flex-1 accent-[#E85D04]"
        />
        <span className="text-xs font-mono-tech opacity-65 tabular-nums">{formatDuration(total)}</span>
      </div>
    </div>
  );
}

export default function ModernZenMinimalUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  return (
    <div
      data-ui-id="modern-zen-minimal"
      className={`min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#171718] text-[#F4F3EF]' : 'bg-[#F4F3EF] text-[#1C1C1C]'
      }`}
    >
      <header
        className={`max-w-5xl w-full mx-auto flex items-center justify-between gap-4 border-b pb-4 ${
          isDark ? 'border-zinc-800' : 'border-zinc-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#E85D04]' : 'bg-zinc-500'}`} />
          <span className="font-display font-bold tracking-tight text-lg">Atelier Rams</span>
        </div>

        {/* Braun-inspired acoustic grille detail */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:grid grid-cols-6 gap-1 opacity-35" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-current" />
            ))}
          </div>
          <span className="text-[11px] font-mono-tech uppercase tracking-widest opacity-65">
            MODEL SK-01
          </span>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Precision Dial & Controls */}
        <div className="lg:col-span-6 flex flex-col items-center text-center space-y-5">
          <CircularDialProgress
            durationFallback={currentTrack?.duration || 210}
            artwork={currentTrack?.artwork}
            title={currentTrack?.title}
            isDark={isDark}
            isPlaying={isPlaying}
          />

          <div className="space-y-1 max-w-sm w-full">
            <MarqueeText
              text={currentTrack?.title || 'Atelier Rams'}
              isPlaying={isPlaying}
              className="font-display text-2xl font-semibold tracking-tight"
            />
            <p className="text-sm opacity-65 truncate">
              {currentTrack?.artist || 'Carregando seleções'}
            </p>
          </div>

          <div className="w-48">
            <AnimatedEqBars isPlaying={isPlaying} bars={14} barClass="bg-[#E85D04]" heightClass="h-4" />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void prevTrack()}
              aria-label="Anterior"
              className={`w-11 h-11 rounded-full border flex items-center justify-center ${
                isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-400 hover:bg-zinc-200'
              }`}
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              className="w-14 h-14 rounded-full bg-[#E85D04] text-white flex items-center justify-center shadow-sm hover:opacity-90"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Próxima"
              className={`w-11 h-11 rounded-full border flex items-center justify-center ${
                isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-400 hover:bg-zinc-200'
              }`}
            >
              <SkipForward className="w-4 h-4" />
            </button>
            {currentTrack && <DownloadButton track={currentTrack} />}
          </div>
        </div>

        {/* Right: Quiet Tracklist + Lyrics */}
        <div
          className={`lg:col-span-6 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8 space-y-6 ${
            isDark ? 'border-zinc-800' : 'border-zinc-300'
          }`}
        >
          <div>
            <div className="text-xs font-mono-tech uppercase tracking-wider opacity-60 mb-3">
              Seleção ({queue.length})
            </div>
            <div className={`divide-y max-h-52 overflow-y-auto thin-scroll ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
              {queue.map((t, i) => (
                <div key={t.id} className="py-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => void playTrack(t, queue)}
                    className={`text-left text-sm flex-1 min-w-0 truncate tabular-nums ${
                      currentTrack?.id === t.id
                        ? 'text-[#E85D04] font-semibold'
                        : isDark
                          ? 'text-zinc-300 hover:text-white'
                          : 'text-zinc-800 hover:text-black'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')} — {t.title}
                  </button>
                  <DownloadButton track={t} compact />
                </div>
              ))}
            </div>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-zinc-800' : 'border-zinc-300'}`}>
            <div className="text-xs font-mono-tech uppercase tracking-wider opacity-60 mb-2">
              Letras
            </div>
            <div className="max-h-48 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </main>

      <ThemedDock
        uiId="modern-zen-minimal"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
