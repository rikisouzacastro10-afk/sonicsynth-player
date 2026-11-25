import { useState } from 'react';
import { Mic2, Pause, Play, SkipBack, SkipForward, Tv, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroTvCrtVhsUI() {
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
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-tv-crt-trinitron-vhs"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#171311] text-stone-100' : 'bg-[#EAE3D9] text-stone-900'
      }`}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Wood & Graphite 80s/90s CRT Trinitron TV + VHS Deck */}
        <div
          className={`lg:col-span-7 rounded-3xl border-4 p-4 sm:p-5 flex flex-col justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-b from-[#3B261A] via-[#281C15] to-[#1A130F] border-amber-900/70 shadow-2xl'
              : 'bg-gradient-to-b from-[#D5C3B0] via-[#C3AD96] to-[#B0977E] border-stone-500 shadow-xl'
          }`}
        >
          {/* Curved CRT Tube Screen with Scanlines + Green Phosphor OSD */}
          <div className="relative rounded-[28px] bg-[#070B08] border-8 border-zinc-800 p-4 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]">
            {/* Scanline & Glass Reflection Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_3px)] z-20"
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent z-20 anim-scan-beam ${
                !isPlaying ? 'anim-paused' : ''
              }`}
            />

            {/* Phosphor OSD Top Row */}
            <div className="relative z-10 flex items-center justify-between text-[11px] font-mono-tech font-bold text-emerald-400 mb-3">
              <span>{isPlaying ? 'PLAY ▶  SP' : 'PAUSE ❚❚'}</span>
              <span>HI-FI STEREO</span>
              <span>CH {String(queueIndex + 1).padStart(2, '0')}</span>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shrink-0">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'CRT'} />
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-emerald-300 font-mono-tech">
                <MarqueeText
                  text={currentTrack?.title || 'Aguardando sinal VHF...'}
                  isPlaying={isPlaying}
                  className="text-sm sm:text-base font-bold text-emerald-300"
                />
                <div className="text-xs text-emerald-400/80 truncate">
                  {currentTrack?.artist || 'SonicMorph'}
                </div>
                <AnimatedEqBars
                  isPlaying={isPlaying}
                  bars={14}
                  barClass="bg-emerald-400"
                  heightClass="h-8"
                />
              </div>
            </div>

            {/* VHS Tape Counter */}
            <div className="relative z-10 mt-3 pt-2 border-t border-emerald-500/25 flex items-center justify-between text-[10px] font-mono-tech text-emerald-400">
              <span>VCR COUNTER: 00:{String((queueIndex + 1) * 14).padStart(2, '0')}:42</span>
              <span>SAP / MTS</span>
            </div>
          </div>

          {/* Rotary Tuning Knobs + VHS Slot Controls */}
          <div className="rounded-2xl bg-zinc-900/90 border-2 border-zinc-700 p-3.5 text-zinc-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Rotary Channel Knob */}
              <button
                type="button"
                onClick={() => void nextTrack()}
                className="flex items-center gap-2 group"
                title="Girar seletor de canal"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-zinc-600 to-zinc-800 border-2 border-zinc-400 shadow flex items-center justify-center group-active:rotate-45 transition-transform">
                  <div className="w-1 h-4 bg-amber-400 rounded-full -translate-y-1" />
                </div>
                <span className="text-[10px] font-mono-tech uppercase opacity-75">TUNING</span>
              </button>

              {/* VCR Transport */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Rewind"
                  className="h-10 px-3 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="h-10 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Fast Forward"
                  className="h-10 px-3 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLyrics((v) => !v)}
                  className={`h-10 px-3 rounded border text-xs font-mono-tech font-bold inline-flex items-center gap-1 ${
                    showLyrics ? 'bg-emerald-400 text-zinc-950 border-emerald-200' : 'bg-zinc-800 border-zinc-600'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>CC</span>
                </button>
              </div>

              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume CRT"
                className="flex-1 accent-emerald-500"
              />
              <span className="font-mono-tech text-[10px] w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass="bg-zinc-800"
              barFillClass="bg-emerald-500"
              textClass="text-emerald-300"
              compact
            />
          </div>
        </div>

        {/* Right: TV Guide Channels / Closed Captions */}
        <div
          className={`lg:col-span-5 rounded-3xl border p-5 flex flex-col max-h-[470px] ${
            isDark ? 'bg-[#1F1A17] border-amber-900/45' : 'bg-white border-stone-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
              <Tv className="w-4 h-4" />
              <span>{showLyrics ? 'CLOSED CAPTIONS' : `CANAIS VHF (${queue.length})`}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showLyrics ? 'Canais' : 'Legenda CC'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {showLyrics ? (
              <LyricsPanel variant={isDark ? 'crt' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                        active ? 'bg-emerald-500/20 border border-emerald-500/45' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <span className="text-[11px] font-mono-tech font-bold text-emerald-500 w-7">
                          CH{String(idx + 1).padStart(2, '0')}
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
        uiId="retro-tv-crt-trinitron-vhs"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
