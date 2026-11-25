import { useState } from 'react';
import { Bell, Mic2, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroPagerBeeper95UI() {
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

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [backlightOn, setBacklightOn] = useState(true);
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-pager-beeper-95"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 font-mono-tech transition-colors ${
        isDark ? 'bg-[#12161A] text-slate-100' : 'bg-[#E1E7EC] text-slate-900'
      }`}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Smoke-Gray Polycarbonate 90s Pocket Pager */}
        <div
          className={`lg:col-span-7 rounded-[32px] border-4 p-5 sm:p-6 flex flex-col justify-between gap-4 relative ${
            isDark
              ? 'bg-gradient-to-b from-[#2A3139] via-[#1E242B] to-[#161A20] border-slate-500/55 shadow-2xl'
              : 'bg-gradient-to-b from-[#D5DCE3] via-[#C3CCD6] to-[#B0BBC7] border-slate-500 shadow-xl'
          }`}
        >
          {/* Top Belt Clip Ridge & Alert LED */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-widest uppercase">
              MOTOR-BEEPER MATRIX 95
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPlaying ? 'bg-lime-400 shadow-[0_0_10px_#a3e635] anim-twinkle' : 'bg-red-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setBacklightOn((v) => !v)}
                className="text-[10px] px-2 py-0.5 rounded bg-black/25 font-bold"
              >
                {backlightOn ? 'EL LIGHT ON' : 'EL OFF'}
              </button>
            </div>
          </div>

          {/* Olive-Green EL Dot-Matrix LCD */}
          <div
            className={`rounded-2xl border-4 border-zinc-800 p-4 text-zinc-950 shadow-inner transition-colors space-y-3 ${
              backlightOn
                ? 'bg-gradient-to-b from-[#A3C26B] to-[#8BAA54]'
                : 'bg-[#738457]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold border-b border-zinc-900/25 pb-1">
              <span className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                MSG #{String(queueIndex + 1).padStart(2, '0')}
              </span>
              <span>{isPlaying ? '▶ RECEIVING' : '❚❚ LOCKED'}</span>
              <span>BATT ▮▮▮</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-900/70 shrink-0 grayscale contrast-125">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Pager'} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <MarqueeText
                  text={currentTrack?.title || 'Aguardando bip...'}
                  isPlaying={isPlaying}
                  className="text-sm font-bold text-zinc-950"
                />
                <div className="text-xs text-zinc-900/80 truncate">{currentTrack?.artist}</div>
                <AnimatedEqBars
                  isPlaying={isPlaying}
                  bars={16}
                  barClass="bg-zinc-950"
                  heightClass="h-5"
                />
              </div>
            </div>

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass="bg-zinc-900/25"
              barFillClass="bg-zinc-950"
              textClass="text-zinc-950"
              compact
            />
          </div>

          {/* Chunky Rubberized 4-Button Membrane Controls */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => void prevTrack()}
              aria-label="Anterior"
              className="h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white border-b-4 border-zinc-950 active:translate-y-0.5 flex flex-col items-center justify-center text-[10px] font-bold"
            >
              <SkipBack className="w-4 h-4 fill-current" />
              <span>PREV</span>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Ler/Tocar'}
              className="h-12 rounded-2xl bg-lime-500 hover:bg-lime-400 text-zinc-950 border-b-4 border-lime-700 active:translate-y-0.5 flex flex-col items-center justify-center text-[10px] font-black"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'HOLD' : 'READ'}</span>
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Próxima"
              className="h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white border-b-4 border-zinc-950 active:translate-y-0.5 flex flex-col items-center justify-center text-[10px] font-bold"
            >
              <SkipForward className="w-4 h-4 fill-current" />
              <span>NEXT</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              aria-label="Alternar Letras"
              className={`h-12 rounded-2xl border-b-4 active:translate-y-0.5 flex flex-col items-center justify-center text-[10px] font-bold ${
                showLyrics
                  ? 'bg-sky-400 text-zinc-950 border-sky-700'
                  : 'bg-zinc-800 text-white border-zinc-950'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>TEXT</span>
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-black/20">
            <Volume2 className="w-4 h-4 text-lime-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume Pager"
              className="flex-1 accent-lime-500"
            />
            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>
        </div>

        {/* Right: Pager Inbox / Synced Lyrics */}
        <div
          className={`lg:col-span-5 rounded-[32px] border p-5 flex flex-col max-h-[460px] ${
            isDark ? 'bg-[#191E24] border-slate-700' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-lime-500">
              {showLyrics ? 'MATRIX TEXT' : `INBOX (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showLyrics ? 'Caixa' : 'Letras'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {showLyrics ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl ${
                        active ? 'bg-lime-500/20 border border-lime-500/45' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <span className="text-[10px] font-bold text-lime-500 w-6">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{t.title}</div>
                          <div className="text-[11px] opacity-65 truncate">{t.artist}</div>
                        </div>
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
        uiId="retro-pager-beeper-95"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
