import { useState } from 'react';
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { AnalogVuMeter, AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroWinampRackUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isOnline = useAppStore((s) => s.isOnline);
  const shuffle = useAppStore((s) => s.shuffle);
  const repeatMode = useAppStore((s) => s.repeatMode);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const toggleShuffle = useAppStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useAppStore((s) => s.cycleRepeatMode);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const isDark = themeMode === 'dark';

  const moduleBox = isDark
    ? 'bg-[#232834] border-2 border-t-zinc-500 border-l-zinc-500 border-r-zinc-800 border-b-zinc-900'
    : 'bg-[#E3E6EC] border-2 border-t-white border-l-white border-r-zinc-400 border-b-zinc-500';
  const moduleHeader = isDark
    ? 'bg-[#181C24] text-amber-300 border-zinc-700'
    : 'bg-[#CDD3DE] text-zinc-800 border-zinc-400';

  return (
    <div
      data-ui-id="retro-winamp-rack"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 pb-28 sm:pb-28 font-mono-tech transition-colors ${
        isDark ? 'bg-[#13161D] text-[#E0E4EB]' : 'bg-[#D0D5DD] text-zinc-900'
      }`}
    >
      {/* Rack Unit Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 ${isPlaying ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-500'}`} />
          <span className={`text-xs font-bold tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            SONICAMP HI-FI RACK · 192KBPS PCM
          </span>
        </div>
        <span className="text-[10px] opacity-70">
          {isOnline ? 'LINK:ACTIVE' : 'MODE:OFFLINE'} · {queue.length} TRACKS
        </span>
      </div>

      {/* Stacked 3-Module Rack */}
      <div className="w-full max-w-4xl space-y-2">
        {/* Module 1: Main Player Deck */}
        <div className={`${moduleBox} p-3 shadow-xl relative`}>
          <div className={`${moduleHeader} px-2 py-1 text-[10px] flex justify-between border mb-2.5`}>
            <span className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
              MODULE 01 // MAIN DECK
            </span>
            <span>44.1 KHZ · FULL AUDIO · STEREO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-7 bg-[#060908] border-2 border-zinc-700 p-3 flex items-center gap-3 relative overflow-hidden">
              <div className="relative shrink-0">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass="from-emerald-500/45 via-lime-400/20 to-amber-400/35"
                  roundedClass="rounded-none"
                />
                <div className="relative w-16 h-16 border border-emerald-500/50 overflow-hidden">
                  <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Track'} />
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <MarqueeText
                  text={currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'Aguardando faixa real...'}
                  isPlaying={isPlaying}
                  className="text-xs text-emerald-400 font-bold"
                />
                <AnimatedEqBars
                  isPlaying={isPlaying}
                  bars={20}
                  barClass="bg-gradient-to-t from-emerald-500 via-lime-400 to-amber-400"
                  heightClass="h-8"
                />
                <div className="flex justify-between text-[8px] text-emerald-500/60">
                  <span>60</span>
                  <span>170</span>
                  <span>310</span>
                  <span>600</span>
                  <span>1K</span>
                  <span>3K</span>
                  <span>6K</span>
                  <span>12K</span>
                  <span>16K</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Anterior"
                  className={`h-10 flex-1 border flex items-center justify-center ${
                    isDark ? 'bg-zinc-700 hover:bg-zinc-600 border-zinc-500' : 'bg-white hover:bg-zinc-100 border-zinc-400'
                  }`}
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                  className="h-10 flex-[1.4] bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Próxima"
                  className={`h-10 flex-1 border flex items-center justify-center ${
                    isDark ? 'bg-zinc-700 hover:bg-zinc-600 border-zinc-500' : 'bg-white hover:bg-zinc-100 border-zinc-400'
                  }`}
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleShuffle}
                  aria-label="Aleatório"
                  className={`h-10 px-2.5 border text-xs ${
                    shuffle
                      ? 'bg-amber-400 text-zinc-950 border-amber-300'
                      : isDark
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-white border-zinc-400'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cycleRepeatMode}
                  aria-label="Repetir"
                  className={`h-10 px-2.5 border text-xs ${
                    repeatMode !== 'off'
                      ? 'bg-emerald-400 text-zinc-950 border-emerald-300'
                      : isDark
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-white border-zinc-400'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="opacity-70">VOL</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="flex-1 accent-emerald-500"
                />
                {currentTrack && <DownloadButton track={currentTrack} compact />}
              </div>
              <LedPeakMeter isPlaying={isPlaying} label="dBFS" isDark={isDark} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mt-3">
            <div className="md:col-span-8">
              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                variant="brutalist"
                barBgClass={isDark ? 'bg-zinc-900' : 'bg-zinc-400'}
                barFillClass="bg-emerald-500"
                textClass={isDark ? 'text-emerald-400' : 'text-emerald-800'}
              />
            </div>
            <div className="md:col-span-4 grid grid-cols-2 gap-1.5">
              <AnalogVuMeter isPlaying={isPlaying} label="CH-L" />
              <AnalogVuMeter isPlaying={isPlaying} label="CH-R" altNeedle />
            </div>
          </div>
        </div>

        {/* Module 2 + 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className={`${moduleBox} p-3 flex flex-col h-72`}>
            <div className={`${moduleHeader} px-2 py-1 text-[10px] border mb-2 font-bold flex justify-between`}>
              <span>MODULE 02 // PLAYLIST EDITOR ({queue.length})</span>
              <span>DB:READY</span>
            </div>
            <div
              className={`flex-1 overflow-y-auto border p-1.5 space-y-0.5 thin-scroll ${
                isDark ? 'bg-[#070B09] border-zinc-700' : 'bg-white border-zinc-400'
              }`}
            >
              {queue.map((t, i) => {
                const active = currentTrack?.id === t.id;
                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 text-xs ${
                      active
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : isDark
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-zinc-800 hover:bg-emerald-50'
                    }`}
                  >
                    <button type="button" onClick={() => void playTrack(t, queue)} className="flex-1 min-w-0 text-left truncate">
                      {i + 1}. {t.artist} - {t.title}
                    </button>
                    <span className="shrink-0 opacity-75">{formatDuration(t.duration)}</span>
                    <DownloadButton track={t} compact />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`${moduleBox} p-3 flex flex-col h-72`}>
            <div className={`${moduleHeader} px-2 py-1 text-[10px] border mb-2 font-bold flex justify-between`}>
              <span>MODULE 03 // LRCLIB SYNC MONITOR</span>
              <span>TIME-SYNC</span>
            </div>
            <div
              className={`flex-1 overflow-y-auto border p-2 thin-scroll ${
                isDark ? 'bg-[#070B09] border-zinc-700' : 'bg-white border-zinc-400'
              }`}
            >
              <LyricsPanel variant={isDark ? 'crt' : 'light'} />
            </div>
          </div>
        </div>
      </div>

      <ThemedDock
        uiId="retro-winamp-rack"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
