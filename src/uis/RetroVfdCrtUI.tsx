import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Terminal } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroVfdCrtUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isOnline = useAppStore((s) => s.isOnline);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-vfd-crt"
      className={`min-h-screen w-full font-mono-tech p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col justify-between relative overflow-hidden transition-colors ${
        isDark ? 'bg-[#040A08] text-emerald-400' : 'bg-[#EAF3EE] text-emerald-950'
      }`}
    >
      {/* Subtle CRT Scanlines */}
      <div
        className={`pointer-events-none fixed inset-0 ${isDark ? 'opacity-20' : 'opacity-10'}`}
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(16,185,129,0.16) 0px, rgba(16,185,129,0.16) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <header className="relative z-10 max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-600/30">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <Terminal className="w-4 h-4" />
          <span>VFD-CRT AUDIO TERMINAL · {isOnline ? 'NET:UP' : 'NET:OFFLINE'}</span>
        </div>
        <div className="text-[10px] flex items-center gap-2 opacity-80">
          <span className="px-2 py-0.5 border border-emerald-600/40">DAC:24-BIT</span>
          <span className="px-2 py-0.5 border border-emerald-600/40">44.1KHZ</span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl w-full mx-auto py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <div
          className={`lg:col-span-7 relative border-2 p-5 flex flex-col justify-between gap-5 overflow-hidden ${
            isDark
              ? 'border-emerald-500/45 bg-[#06120E] shadow-[inset_0_0_40px_rgba(16,185,129,0.08)]'
              : 'border-emerald-700/40 bg-white shadow-sm'
          }`}
        >
          {/* Animated Phosphor Scan Beam */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent anim-scan-beam ${
              !isPlaying ? 'anim-paused' : ''
            }`}
          />

          <div className="relative flex items-center gap-4">
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-emerald-500/45 via-teal-400/20 to-lime-400/35"
                roundedClass="rounded-none"
              />
              <div className="relative w-20 h-20 border-2 border-emerald-500/50 overflow-hidden">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Track'} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] opacity-70 mb-1 flex items-center justify-between">
                <span>NOW STREAMING BUFFER</span>
                <span>{isPlaying ? 'STATUS: ACTIVE' : 'STATUS: STANDBY'}</span>
              </div>
              <MarqueeText
                text={currentTrack?.title || 'NO STREAM LOADED'}
                isPlaying={isPlaying}
                className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-950'}`}
              />
              <p className="text-xs sm:text-sm opacity-80 mt-0.5 truncate">
                {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'Select a track from QUEUE INDEX'}
              </p>
            </div>
          </div>

          <div
            className={`border p-4 space-y-2.5 ${
              isDark ? 'border-emerald-500/25 bg-black/50' : 'border-emerald-700/25 bg-emerald-950/5'
            }`}
          >
            <div className="flex justify-between text-[10px] opacity-70">
              <span>32HZ</span>
              <span>250HZ</span>
              <span>1KHZ</span>
              <span>4KHZ</span>
              <span>16KHZ</span>
            </div>
            <AnimatedEqBars isPlaying={isPlaying} bars={24} barClass="bg-emerald-500" heightClass="h-28" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <LedPeakMeter isPlaying={isPlaying} label="CH-L" isDark={isDark} />
              <LedPeakMeter isPlaying={isPlaying} label="CH-R" isDark={isDark} />
            </div>
          </div>

          <div className="space-y-4">
            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              variant="brutalist"
              barBgClass={isDark ? 'bg-emerald-950' : 'bg-emerald-200'}
              barFillClass="bg-emerald-500"
              textClass={isDark ? 'text-emerald-300' : 'text-emerald-900'}
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Anterior"
                  className="px-4 py-2.5 border border-emerald-600/50 hover:bg-emerald-500/20"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                  className="px-6 py-2.5 bg-emerald-500 text-zinc-950 font-bold inline-flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Próxima"
                  className="px-4 py-2.5 border border-emerald-600/50 hover:bg-emerald-500/20"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              {currentTrack && <DownloadButton track={currentTrack} />}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-rows-2 gap-4 h-[520px]">
          <div
            className={`border p-3 flex flex-col overflow-hidden ${
              isDark ? 'border-emerald-500/40 bg-[#06120E]' : 'border-emerald-700/35 bg-white'
            }`}
          >
            <div className="text-xs font-bold border-b border-emerald-600/25 pb-1.5 mb-2 flex justify-between">
              <span>SYNCED LYRICS MATRIX</span>
              <span className="opacity-65">LRCLIB</span>
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'crt' : 'light'} />
            </div>
          </div>
          <div
            className={`border p-3 flex flex-col overflow-hidden ${
              isDark ? 'border-emerald-500/40 bg-[#06120E]' : 'border-emerald-700/35 bg-white'
            }`}
          >
            <div className="text-xs font-bold border-b border-emerald-600/25 pb-1.5 mb-2 flex justify-between">
              <span>QUEUE INDEX ({queue.length})</span>
              <span className="opacity-65">AUTO-NEXT</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 thin-scroll">
              {queue.map((t, idx) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-2 px-2 py-1 text-xs ${
                    currentTrack?.id === t.id ? 'bg-emerald-500 text-zinc-950 font-bold' : 'hover:bg-emerald-500/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void playTrack(t, queue)}
                    className="flex-1 text-left truncate min-h-[34px]"
                  >
                    [{String(idx + 1).padStart(2, '0')}] {t.title} — {t.artist}
                  </button>
                  <DownloadButton track={t} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ThemedDock
        uiId="retro-vfd-crt"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
