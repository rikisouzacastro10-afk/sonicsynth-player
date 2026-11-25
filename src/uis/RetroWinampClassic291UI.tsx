import { useState } from 'react';
import {
  ListMusic,
  Mic2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Square,
} from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroWinampClassic291UI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const volume = useAppStore((s) => s.volume);
  const shuffle = useAppStore((s) => s.shuffle);
  const repeatMode = useAppStore((s) => s.repeatMode);
  const setVolume = useAppStore((s) => s.setVolume);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);
  const seekTo = useAppStore((s) => s.seekTo);
  const toggleShuffle = useAppStore((s) => s.toggleShuffle);
  const cycleRepeatMode = useAppStore((s) => s.cycleRepeatMode);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [viewMode, setViewMode] = useState<'playlist' | 'lyrics'>('playlist');
  const isDark = themeMode === 'dark';

  const bevelPanel = isDark
    ? 'bg-[#202430] border-2 border-t-zinc-500 border-l-zinc-500 border-r-zinc-950 border-b-zinc-950'
    : 'bg-[#E3E7EE] border-2 border-t-white border-l-white border-r-zinc-500 border-b-zinc-600';

  const bevelButton = isDark
    ? 'bg-[#2B3140] hover:bg-[#373E50] text-zinc-100 border border-t-zinc-500 border-l-zinc-500 border-r-zinc-950 border-b-zinc-950 active:border-t-zinc-950 active:border-l-zinc-950'
    : 'bg-[#F0F2F5] hover:bg-white text-zinc-900 border border-t-white border-l-white border-r-zinc-500 border-b-zinc-500';

  return (
    <div
      data-ui-id="retro-winamp-classic-291"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 font-mono-tech transition-colors ${
        isDark ? 'bg-[#14161D] text-lime-300' : 'bg-[#D2D6DF] text-zinc-900'
      }`}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Stack: Main Winamp 2.91 Window + Graphic EQ */}
        <div className="lg:col-span-7 space-y-3">
          {/* Main Player Window */}
          <div className={`${bevelPanel} shadow-2xl`}>
            {/* Titlebar */}
            <div className="h-6 px-2 bg-gradient-to-r from-[#172554] via-[#1E3A8A] to-[#0F172A] text-white flex items-center justify-between text-[10px] font-bold tracking-widest">
              <span>WINAMP 2.91</span>
              <span className="text-lime-400">*** MP3 / HI-FI ***</span>
            </div>

            <div className="p-3 space-y-3">
              {/* Green LED Display + Spectrum + Mini Cover */}
              <div className="grid grid-cols-12 gap-2.5 bg-black border-2 border-zinc-700 p-2.5">
                <div className="col-span-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 border border-lime-500/50 overflow-hidden shrink-0">
                      <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                    </div>
                    <div>
                      <div className="text-[10px] text-lime-500 font-bold">
                        {isPlaying ? 'PLAY ▶' : 'PAUSE ❚❚'}
                      </div>
                      <div className="text-[9px] text-lime-400/75">320 kbps · 44kHz</div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <AnimatedEqBars
                      isPlaying={isPlaying}
                      bars={14}
                      barClass="bg-gradient-to-t from-lime-500 via-yellow-400 to-red-500"
                      heightClass="h-10"
                    />
                  </div>
                </div>

                <div className="col-span-7 flex flex-col justify-between gap-2">
                  <div className="bg-[#071109] border border-lime-500/30 px-2 py-1">
                    <MarqueeText
                      text={`${currentTrack?.artist || 'SonicMorph'} - ${
                        currentTrack?.title || 'Carregando faixa...'
                      } (Official Audio)`}
                      isPlaying={isPlaying}
                      className="text-xs text-lime-400 font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-lime-400/80">
                    <span>STEREO</span>
                    <span>KBPS: 320</span>
                    <span>KHZ: 44</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-lime-500">VOL</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volume Winamp"
                      className="flex-1 accent-lime-400 h-1.5"
                    />
                    <span className="text-[9px] text-lime-300 w-7 text-right">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass="bg-black border border-zinc-700"
                barFillClass="bg-lime-400"
                textClass={isDark ? 'text-lime-400' : 'text-zinc-900'}
                compact
              />

              {/* Classic Z X C V B Transport Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void prevTrack()}
                    aria-label="Prev (Z)"
                    className={`h-9 px-2.5 text-[10px] font-bold flex items-center gap-1 ${bevelButton}`}
                  >
                    <SkipBack className="w-3.5 h-3.5 fill-current" />
                    <span>Z</span>
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Play/Pause (X/C)"
                    className={`h-9 px-3 text-[10px] font-bold flex items-center gap-1 ${
                      isPlaying ? 'bg-lime-400 text-zinc-950 border border-lime-200' : bevelButton
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'C' : 'X'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlaying) togglePlay();
                      seekTo(0);
                    }}
                    aria-label="Stop (V)"
                    className={`h-9 px-2.5 text-[10px] font-bold flex items-center gap-1 ${bevelButton}`}
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>V</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void nextTrack()}
                    aria-label="Next (B)"
                    className={`h-9 px-2.5 text-[10px] font-bold flex items-center gap-1 ${bevelButton}`}
                  >
                    <SkipForward className="w-3.5 h-3.5 fill-current" />
                    <span>B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode((m) => (m === 'playlist' ? 'lyrics' : 'playlist'))}
                    aria-label="Toggle Lyrics"
                    className={`h-9 px-2.5 text-[10px] font-bold flex items-center gap-1 ${bevelButton}`}
                  >
                    <Mic2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleShuffle}
                    className={`h-9 px-2 text-[10px] font-bold flex items-center gap-1 ${
                      shuffle ? 'bg-lime-400 text-zinc-950 border border-lime-200' : bevelButton
                    }`}
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>SHF</span>
                  </button>
                  <button
                    type="button"
                    onClick={cycleRepeatMode}
                    className={`h-9 px-2 text-[10px] font-bold flex items-center gap-1 ${
                      repeatMode !== 'off'
                        ? 'bg-lime-400 text-zinc-950 border border-lime-200'
                        : bevelButton
                    }`}
                  >
                    <Repeat className="w-3 h-3" />
                    <span>REP</span>
                  </button>
                  {currentTrack && <DownloadButton track={currentTrack} compact />}
                </div>
              </div>
            </div>
          </div>

          {/* Second Modular Window: Graphic Equalizer Visualizer */}
          <div className={`${bevelPanel} shadow-xl`}>
            <div className="h-5 px-2 bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white flex items-center justify-between text-[9px] font-bold">
              <span>WINAMP EQUALIZER</span>
              <span className="text-lime-400">ON · AUTO</span>
            </div>
            <div className="p-3 bg-black/40">
              <AnimatedEqBars
                isPlaying={isPlaying}
                bars={18}
                barClass="bg-gradient-to-t from-emerald-500 via-lime-400 to-amber-400"
                heightClass="h-14"
              />
            </div>
          </div>
        </div>

        {/* Right Modular Window: Playlist Editor / Synced Lyrics */}
        <div className={`lg:col-span-5 ${bevelPanel} shadow-2xl flex flex-col max-h-[440px]`}>
          <div className="h-6 px-2 bg-gradient-to-r from-[#172554] to-[#0F172A] text-white flex items-center justify-between text-[10px] font-bold">
            <span className="flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5 text-lime-400" />
              <span>{viewMode === 'lyrics' ? 'LYRICS PLUGIN' : 'WINAMP PLAYLIST EDITOR'}</span>
            </span>
            <button
              type="button"
              onClick={() => setViewMode((v) => (v === 'playlist' ? 'lyrics' : 'playlist'))}
              className="text-lime-300 hover:underline text-[10px]"
            >
              {viewMode === 'playlist' ? '[LYRICS]' : '[PLAYLIST]'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#070B08] text-lime-400 p-2 thin-scroll">
            {viewMode === 'lyrics' ? (
              <LyricsPanel variant="crt" />
            ) : (
              <div className="space-y-0.5 text-xs">
                {queue.map((t, i) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 px-2 py-1.5 ${
                        active ? 'bg-lime-400 text-zinc-950 font-bold' : 'hover:bg-lime-500/15'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex-1 min-w-0 text-left truncate"
                      >
                        {i + 1}. {t.artist} - {t.title}
                      </button>
                      <DownloadButton track={t} compact />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ThemedDock
        uiId="retro-winamp-classic-291"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
