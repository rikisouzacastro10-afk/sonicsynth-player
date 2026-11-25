import { useState } from 'react';
import { Mic2, Pause, Play, Radio, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useAudioClock } from '../audio/audioClock';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnalogVuMeter, AnimatedEqBars } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

/**
 * Isolated Split-Flap counter subscribing to audioClock so parent UI never re-renders on audio ticks.
 */
function SplitFlapClockDisplay({
  trackIndex,
  isPlaying,
}: {
  trackIndex: number;
  isPlaying: boolean;
}) {
  const { currentTime } = useAudioClock();
  const mins = Math.floor(currentTime / 60);
  const secs = Math.floor(currentTime % 60);
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const tr = String(trackIndex + 1).padStart(2, '0');

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {[
        { label: 'TRACK', val: tr },
        { label: 'MIN', val: mm },
        { label: 'SEC', val: ss },
      ].map((card) => (
        <div
          key={card.label}
          className="relative rounded-xl bg-[#11100F] border-2 border-amber-700/60 py-3 px-2 text-center shadow-[inset_0_4px_12px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          <div className="text-[9px] font-mono-tech text-amber-500/80 mb-1 tracking-widest">
            {card.label}
          </div>
          <div className="relative text-3xl sm:text-4xl font-mono-tech font-black text-amber-100 leading-none tracking-tight">
            {card.val}
            {/* Hinged Mechanical Split-Flap Seam */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-[2px] bg-black/85 border-b border-white/15"
            />
          </div>
          <span
            className={`inline-block mt-1 w-1.5 h-1.5 rounded-full ${
              isPlaying ? 'bg-amber-400' : 'bg-zinc-700'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export default function RetroFlipClock77UI() {
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
      data-ui-id="retro-flipclock-hi-fi-77"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#19120D] text-amber-100' : 'bg-[#EDE3D5] text-stone-900'
      }`}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Walnut & Champagne Brass Mid-Century Console */}
        <div
          className={`lg:col-span-7 rounded-[30px] border-4 p-5 sm:p-6 flex flex-col justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-b from-[#452B1B] via-[#311E13] to-[#21140C] border-amber-700/70 shadow-2xl'
              : 'bg-gradient-to-b from-[#A37B56] via-[#8B6443] to-[#724F32] border-amber-900/60 text-white shadow-xl'
          }`}
        >
          {/* Illuminated Warm Amber FM/AM Dial Window */}
          <div className="rounded-xl bg-[#271C0B] border-2 border-amber-400/50 p-3 shadow-inner text-amber-200 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-mono-tech">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Radio className="w-3.5 h-3.5" />
                FM 88 · 92 · 98 · 104 · 108 MHz
              </span>
              <span>STEREO QUARTZ 1977</span>
            </div>
            <div className="relative h-3 rounded bg-amber-950/80 border border-amber-500/30 overflow-hidden">
              <div
                className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(251,191,36,0.35)_0_1px,transparent_1px_10px)]"
                aria-hidden="true"
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_8px_#ef4444]"
                style={{ left: `${18 + ((queueIndex * 11) % 68)}%` }}
              />
            </div>
          </div>

          {/* Split-Flap Mechanical Clock Face */}
          <SplitFlapClockDisplay trackIndex={queueIndex} isPlaying={isPlaying} />

          {/* Track Plate + Analog VU Meter */}
          <div className="grid grid-cols-12 gap-3 items-center bg-black/30 rounded-2xl p-3 border border-amber-500/25">
            <div className="col-span-8 flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-amber-500/60 shrink-0">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Flip'} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <MarqueeText
                  text={currentTrack?.title || 'Sintonizando...'}
                  isPlaying={isPlaying}
                  className="text-sm font-serif-editorial font-bold text-amber-100"
                />
                <div className="text-xs text-amber-300/80 truncate">{currentTrack?.artist}</div>
                <AnimatedEqBars isPlaying={isPlaying} bars={10} barClass="bg-amber-400" heightClass="h-4" />
              </div>
            </div>
            <div className="col-span-4">
              <AnalogVuMeter isPlaying={isPlaying} label="HI-FI" />
            </div>
          </div>

          {/* Brass Transport & Volume */}
          <div className="space-y-3 bg-black/25 rounded-2xl p-3.5 border border-amber-400/20">
            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass="bg-amber-950"
              barFillClass="bg-amber-400"
              textClass="text-amber-200"
              compact
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Anterior"
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 flex items-center justify-center shadow"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                  className="w-12 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Próxima"
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-200 to-amber-500 text-stone-950 flex items-center justify-center shadow"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLyrics((v) => !v)}
                  className={`h-10 px-3 rounded-full text-xs font-mono-tech font-bold inline-flex items-center gap-1 ${
                    showLyrics ? 'bg-amber-300 text-stone-950' : 'bg-black/40 text-amber-200 border border-amber-500/40'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>LETRA</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-[180px]">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume Hi-Fi"
                  className="w-full accent-amber-400"
                />
              </div>

              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>
        </div>

        {/* Right: Program Queue / Lyrics */}
        <div
          className={`lg:col-span-5 rounded-[30px] border p-5 flex flex-col max-h-[490px] ${
            isDark ? 'bg-[#211812] border-amber-800/50' : 'bg-white border-stone-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-amber-500">
              {showLyrics ? 'LYRIC BOOKLET' : `PROGRAMA HI-FI (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showLyrics ? 'Ver Lista' : 'Ver Letra'}
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
                        active ? 'bg-amber-500/20 border border-amber-500/50' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <span className="text-[11px] font-mono-tech font-bold text-amber-500 w-6">
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
        uiId="retro-flipclock-hi-fi-77"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
