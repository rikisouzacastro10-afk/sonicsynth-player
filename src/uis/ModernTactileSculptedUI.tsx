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

function SculptedProgressRing({
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
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <ArtworkAura
          isPlaying={isPlaying}
          gradientClass="from-indigo-500/35 via-sky-400/15 to-violet-500/35"
          roundedClass="rounded-full"
        />
        <div
          className={`relative w-64 h-64 rounded-full flex items-center justify-center ${
            isDark
              ? 'bg-[#1D202A] shadow-[12px_12px_24px_#12141B,-12px_-12px_24px_#282C39]'
              : 'bg-[#EBEEF5] shadow-[12px_12px_24px_#C9CED9,-12px_-12px_24px_#FFFFFF]'
          }`}
        >
          <svg className="w-full h-full -rotate-90 p-2" viewBox="0 0 250 250" aria-hidden="true">
            <circle cx="125" cy="125" r={radius} fill="none" stroke={isDark ? '#2B3040' : '#D6DBE6'} strokeWidth="8" />
            <circle
              cx="125"
              cy="125"
              r={radius}
              fill="none"
              stroke="#4F46E5"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-9 rounded-full overflow-hidden shadow-inner border-4 border-white/20">
            <TrackArtwork src={artwork} alt={title || 'Capa'} />
          </div>
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
          aria-label="Progresso"
          className="flex-1 accent-indigo-600"
        />
        <span className="text-xs font-mono-tech opacity-65 tabular-nums">{formatDuration(total)}</span>
      </div>
    </div>
  );
}

export default function ModernTactileSculptedUI() {
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

  const raisedSurface = isDark
    ? 'bg-[#1D202A] shadow-[8px_8px_16px_#12141B,-8px_-8px_16px_#282C39]'
    : 'bg-[#EBEEF5] shadow-[8px_8px_16px_#C9CED9,-8px_-8px_16px_#FFFFFF]';

  const recessedSurface = isDark
    ? 'bg-[#171A23] shadow-[inset_4px_4px_8px_#101218,inset_-4px_-4px_8px_#232734]'
    : 'bg-[#E4E8F0] shadow-[inset_4px_4px_8px_#C6CBD6,inset_-4px_-4px_8px_#FFFFFF]';

  return (
    <div
      data-ui-id="modern-tactile-sculpted"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col justify-between gap-6 transition-colors ${
        isDark ? 'bg-[#1D202A] text-slate-100' : 'bg-[#EBEEF5] text-slate-800'
      }`}
    >
      <header className={`max-w-5xl w-full mx-auto rounded-2xl px-5 py-3 flex items-center justify-between gap-3 ${raisedSurface}`}>
        <span className="font-display font-bold text-lg tracking-tight text-indigo-500">Alabaster Sculpt</span>
        <span className="text-[11px] font-mono-tech opacity-65">
          NEUMORPHIC HI-FI · {isPlaying ? 'ACTIVE' : 'STANDBY'}
        </span>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Sculpted Circular Ring & Ergonomic Controls */}
        <div className={`lg:col-span-6 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-5 ${raisedSurface}`}>
          <SculptedProgressRing
            durationFallback={currentTrack?.duration || 200}
            artwork={currentTrack?.artwork}
            title={currentTrack?.title}
            isDark={isDark}
            isPlaying={isPlaying}
          />

          <div className="min-w-0 max-w-sm w-full space-y-1">
            <MarqueeText
              text={currentTrack?.title || 'Alabaster Deck'}
              isPlaying={isPlaying}
              className="font-display text-2xl font-bold"
            />
            <p className="text-sm opacity-65 truncate">
              {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'Pronto para ouvir'}
            </p>
          </div>

          <div className="w-48">
            <AnimatedEqBars isPlaying={isPlaying} bars={14} barClass="bg-indigo-500" heightClass="h-4" />
          </div>

          <div className="flex items-center gap-5">
            <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform ${raisedSurface}`}>
              <SkipBack className="w-5 h-5" />
            </button>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-transform ${raisedSurface}`}>
              <SkipForward className="w-5 h-5" />
            </button>
            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>
        </div>

        {/* Right: Recessed Queue & Lyrics Wells */}
        <div className="lg:col-span-6 space-y-5">
          <div className={`rounded-3xl p-5 h-56 flex flex-col ${recessedSurface}`}>
            <div className="text-xs font-mono-tech uppercase opacity-60 mb-2">Fila Esculpida ({queue.length})</div>
            <div className="flex-1 overflow-y-auto space-y-1.5 thin-scroll">
              {queue.map((t) => {
                const active = currentTrack?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-colors ${
                      active ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-indigo-500/10'
                    }`}
                  >
                    <button type="button" onClick={() => void playTrack(t, queue)} className="flex-1 min-w-0 text-left truncate text-xs font-semibold">
                      {t.title} — <span className="opacity-75 font-normal">{t.artist}</span>
                    </button>
                    <DownloadButton track={t} compact />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`rounded-3xl p-5 h-56 flex flex-col ${recessedSurface}`}>
            <div className="text-xs font-mono-tech uppercase opacity-60 mb-2">Letras Sincronizadas</div>
            <div className="flex-1 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </main>

      <ThemedDock
        uiId="modern-tactile-sculpted"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
