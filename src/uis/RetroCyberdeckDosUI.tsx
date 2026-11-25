import { useState } from 'react';
import { HardDrive, Mic2, Pause, Play, SkipBack, SkipForward, Terminal, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroCyberdeckDosUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const queueIndex = useAppStore((s) => s.queueIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);
  const setAudioFxOpen = useAppStore((s) => s.setAudioFxOpen);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-cyberdeck-dos-92"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 font-mono-tech transition-colors ${
        isDark ? 'bg-[#120E09] text-amber-300' : 'bg-[#DDD5C5] text-stone-900'
      }`}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main DOS-92 Cyberdeck Field Unit */}
        <div
          className={`lg:col-span-7 rounded-2xl border-4 p-4 sm:p-5 flex flex-col justify-between gap-4 ${
            isDark
              ? 'bg-[#211C16] border-amber-700/60 shadow-[0_24px_60px_rgba(0,0,0,0.65)]'
              : 'bg-[#CFC5B1] border-stone-500 shadow-xl'
          }`}
        >
          {/* Top Chassis Grille & Model Stamp */}
          <div className="flex items-center justify-between text-[10px] border-b border-current/20 pb-2">
            <span className="flex items-center gap-1.5 font-bold tracking-widest">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              CYBERDECK DOS-92 · SOUND BLASTER 16
            </span>
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded font-bold">
              640K BASE RAM
            </span>
          </div>

          {/* Amber Phosphor CRT Monitor */}
          <div className="relative rounded-xl bg-[#100902] border-4 border-zinc-800 p-4 text-amber-400 overflow-hidden shadow-[inset_0_0_32px_rgba(245,158,11,0.18)] space-y-3">
            {/* CRT Amber Scanline & Sweeping Beam */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(245,158,11,0.06)_0_1px,transparent_1px_3px)]"
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-amber-400/12 to-transparent anim-scan-beam ${
                !isPlaying ? 'anim-paused' : ''
              }`}
            />

            <div className="relative z-10 flex items-center justify-between text-[10px] border-b border-amber-500/30 pb-1.5">
              <span>C:\SONIC\TRACKER.EXE</span>
              <span>IRQ 5 · DMA 1 · 44KHZ</span>
            </div>

            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-20 h-20 rounded border-2 border-amber-500/50 overflow-hidden shrink-0 sepia contrast-125">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'DOS'} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <MarqueeText
                  text={currentTrack?.title || 'Carregando MODULE.MOD...'}
                  isPlaying={isPlaying}
                  className="text-sm font-bold text-amber-300"
                />
                <div className="text-xs text-amber-500/90 truncate">
                  ARTIST: {currentTrack?.artist || 'SONICMORPH'}
                </div>
                <AnimatedEqBars
                  isPlaying={isPlaying}
                  bars={16}
                  barClass="bg-amber-400"
                  heightClass="h-6"
                />
              </div>
            </div>

            {/* ASCII Hex Channel Monitor Row */}
            <div className="relative z-10 grid grid-cols-4 gap-1 text-[9px] bg-amber-950/40 border border-amber-500/25 p-1.5 rounded">
              <span>CH1: {isPlaying ? 'C-4 01' : '--- --'}</span>
              <span>CH2: {isPlaying ? 'E-4 02' : '--- --'}</span>
              <span>CH3: {isPlaying ? 'G-4 0F' : '--- --'}</span>
              <span>PTN: {String(queueIndex + 1).padStart(2, '0')}/{String(queue.length).padStart(2, '0')}</span>
            </div>

            <div className="relative z-10">
              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass="bg-amber-950"
                barFillClass="bg-amber-400"
                textClass="text-amber-400"
                compact
              />
            </div>
          </div>

          {/* 3.5" Floppy Disk Drive Bay + Volume */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-7 rounded-xl bg-zinc-900 border-2 border-zinc-700 p-2.5 flex items-center justify-between gap-2 text-zinc-200">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold">DRIVE A: 3.5&quot; HD</div>
                  <div className="text-[9px] text-amber-400/80">1.44MB AUDIO BANK</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-12 rounded-full bg-black border border-zinc-700 block" />
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPlaying
                      ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24] anim-twinkle'
                      : 'bg-zinc-700'
                  }`}
                />
              </div>
            </div>

            <div className="col-span-5 rounded-xl bg-black/20 border border-current/15 px-3 py-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume Cyberdeck"
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Mechanical Keycaps Control Bar */}
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => void prevTrack()}
              className="h-11 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border-b-4 border-stone-950 active:translate-y-0.5 active:border-b-0 text-[10px] font-bold flex items-center justify-center gap-1"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>F1</span>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="h-11 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 border-b-4 border-amber-700 active:translate-y-0.5 active:border-b-0 text-[10px] font-black flex items-center justify-center gap-1"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>SPC</span>
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              className="h-11 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border-b-4 border-stone-950 active:translate-y-0.5 active:border-b-0 text-[10px] font-bold flex items-center justify-center gap-1"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>F2</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className={`h-11 rounded border-b-4 active:translate-y-0.5 active:border-b-0 text-[10px] font-bold flex items-center justify-center gap-1 ${
                showLyrics
                  ? 'bg-amber-300 text-zinc-950 border-amber-600'
                  : 'bg-stone-800 text-amber-300 border-stone-950'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>F3</span>
            </button>
            <button
              type="button"
              onClick={() => setAudioFxOpen(true)}
              className="h-11 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border-b-4 border-stone-950 active:translate-y-0.5 active:border-b-0 text-[10px] font-bold flex items-center justify-center"
            >
              DSP
            </button>
          </div>
        </div>

        {/* Right: MS-DOS File / Pattern Directory or Lyrics */}
        <div
          className={`lg:col-span-5 rounded-2xl border-2 p-4 flex flex-col max-h-[480px] ${
            isDark ? 'bg-[#100902] border-amber-700/50 text-amber-300' : 'bg-[#1A130A] border-stone-600 text-amber-300'
          }`}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/30 mb-3 text-xs">
            <span className="font-bold">
              {showLyrics ? 'TEXT.DOC // LYRICS' : `DIR A:\\PLAYLIST (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="underline text-amber-400 hover:text-amber-200"
            >
              {showLyrics ? '[DIR]' : '[TYPE LYRIC]'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {showLyrics ? (
              <LyricsPanel variant="crt" />
            ) : (
              <div className="space-y-1 text-xs">
                {queue.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded ${
                        active ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-amber-500/15'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex-1 min-w-0 text-left truncate"
                      >
                        {String(idx + 1).padStart(2, '0')} &gt; {t.title} - {t.artist}
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
        uiId="retro-cyberdeck-dos-92"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
