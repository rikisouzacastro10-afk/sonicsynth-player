import { useState } from 'react';
import { Mic2, Pause, Play, SkipBack, SkipForward, Sliders, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

const KEY_LABELS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function RetroSynthOp1UI() {
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
      data-ui-id="retro-synth-op1-studio"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#17191D] text-zinc-100' : 'bg-[#DFE2E7] text-zinc-900'
      }`}
    >
      {/* Studio Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-zinc-500'
            }`}
          />
          <span className="text-xs sm:text-sm font-mono-tech font-bold tracking-[0.2em] uppercase">
            OP-1 PORTABLE SYNTHESIZER WORKSTATION
          </span>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 font-bold">
          4-TRACK TAPE · 120 BPM
        </span>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main CNC Aluminum OP-1 Hardware Deck */}
        <div
          className={`lg:col-span-7 relative rounded-[28px] border-2 p-5 sm:p-6 flex flex-col justify-between gap-5 ${
            isDark
              ? 'bg-gradient-to-b from-[#2C3038] via-[#23272E] to-[#1B1E24] border-zinc-600/70 shadow-[0_24px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)]'
              : 'bg-gradient-to-b from-[#F4F5F7] via-[#E6E8EC] to-[#D6D9DF] border-zinc-400 shadow-[0_20px_50px_rgba(15,23,42,0.15),inset_0_2px_0_rgba(255,255,255,0.95)]'
          }`}
        >
          {/* Corner Recessed Hex Screws */}
          <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-zinc-500/70 border border-black/30" aria-hidden="true" />
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-500/70 border border-black/30" aria-hidden="true" />

          {/* Top Section: Micro Speaker Grille + Black Vector OLED + 4 Color-Coded Rotary Encoders */}
          <div className="grid grid-cols-12 gap-3 items-stretch pt-1">
            {/* Speaker Dot Matrix Grille */}
            <div
              className="col-span-2 hidden sm:grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-black/15 border border-current/10 content-center justify-items-center"
              aria-hidden="true"
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500/65" />
              ))}
            </div>

            {/* Black OLED Vector Display */}
            <div className="col-span-12 sm:col-span-10 rounded-2xl bg-[#07090D] border-4 border-zinc-800 p-3.5 text-white shadow-inner space-y-2.5">
              <div className="flex items-center justify-between text-[9px] font-mono-tech">
                <span className="text-sky-400 font-bold">
                  {isPlaying ? '● TAPE RUNNING' : '❚❚ TAPE PAUSED'}
                </span>
                <span className="text-emerald-400">SYNTH ENGINE: FM</span>
                <span className="text-orange-400">TRK {String(queueIndex + 1).padStart(2, '0')}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <ArtworkAura
                    isPlaying={isPlaying}
                    gradientClass="from-sky-400/40 via-emerald-400/25 to-orange-400/40"
                    roundedClass="rounded-xl"
                  />
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20">
                    <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'OP-1'} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <MarqueeText
                    text={currentTrack?.title || 'Sintetizador pronto...'}
                    isPlaying={isPlaying}
                    className="text-sm font-mono-tech font-bold text-white"
                  />
                  <div className="text-xs font-mono-tech text-zinc-400 truncate">
                    {currentTrack?.artist || 'SonicMorph'}
                  </div>
                  <AnimatedEqBars
                    isPlaying={isPlaying}
                    bars={18}
                    barClass="bg-gradient-to-t from-sky-400 via-emerald-400 to-orange-400"
                    heightClass="h-5"
                  />
                </div>
              </div>

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass="bg-zinc-800"
                barFillClass="bg-orange-400"
                textClass="text-zinc-400"
                compact
              />
            </div>
          </div>

          {/* 4 Color-Coded Rotary Encoders Row */}
          <div className="grid grid-cols-4 gap-3 py-1">
            {[
              {
                label: 'PREV',
                color: 'bg-sky-500 border-sky-300',
                onClick: () => void prevTrack(),
                sub: 'BLUE',
              },
              {
                label: isPlaying ? 'PAUSE' : 'PLAY',
                color: 'bg-emerald-500 border-emerald-300',
                onClick: togglePlay,
                sub: 'GREEN',
              },
              {
                label: 'NEXT',
                color: 'bg-orange-500 border-orange-300',
                onClick: () => void nextTrack(),
                sub: 'ORANGE',
              },
              {
                label: 'DSP FX',
                color: 'bg-zinc-200 border-white text-zinc-900',
                onClick: () => setAudioFxOpen(true),
                sub: 'WHITE',
              },
            ].map((enc) => (
              <button
                key={enc.label}
                type="button"
                onClick={enc.onClick}
                aria-label={enc.label}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-900/20 border border-current/15 flex items-center justify-center shadow-inner">
                  <div
                    className={`w-10 h-10 rounded-full border-2 ${enc.color} shadow-md flex items-center justify-center relative group-active:scale-90 transition-transform ${
                      isPlaying ? 'anim-spin-gear' : ''
                    }`}
                  >
                    <span className="w-1 h-3 rounded-full bg-black/45 -translate-y-2" />
                  </div>
                </div>
                <span className="text-[10px] font-mono-tech font-bold tracking-wider">{enc.label}</span>
              </button>
            ))}
          </div>

          {/* Transport + Volume Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-black/15 border border-current/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Anterior"
                className="w-9 h-9 rounded-lg bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="w-11 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-400"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima"
                className="w-9 h-9 rounded-lg bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                aria-label="Alternar Letras"
                className={`h-9 px-2.5 rounded-lg text-[10px] font-mono-tech font-bold inline-flex items-center gap-1 ${
                  showLyrics ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>LYRIC</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioFxOpen(true)}
                aria-label="Estúdio FX"
                className="h-9 px-2.5 rounded-lg bg-zinc-800 text-zinc-200 text-[10px] font-mono-tech font-bold inline-flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>FX</span>
              </button>
            </div>

            <div className="flex items-center gap-2 min-w-[140px] flex-1 max-w-[200px]">
              <Volume2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume OP-1"
                className="flex-1 accent-orange-500"
              />
            </div>

            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>

          {/* 12-Key Tactile Chicklet Synthesizer Keyboard (Triggers Queue Tracks) */}
          <div className="grid grid-cols-12 gap-1 pt-1">
            {KEY_LABELS.map((note, idx) => {
              const isSharp = note.includes('#');
              const targetTrack = queue[idx % Math.max(1, queue.length)];
              const isCurrent = targetTrack && currentTrack?.id === targetTrack.id;
              return (
                <button
                  key={note}
                  type="button"
                  disabled={!targetTrack}
                  onClick={() => targetTrack && void playTrack(targetTrack, queue)}
                  aria-label={`Tecla ${note}${targetTrack ? ` - ${targetTrack.title}` : ''}`}
                  className={`h-14 rounded-lg border text-[9px] font-mono-tech font-bold flex flex-col items-center justify-end pb-1.5 transition-transform active:scale-95 ${
                    isCurrent
                      ? 'bg-orange-500 text-white border-orange-300 shadow-md'
                      : isSharp
                        ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                        : 'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  <span>{note}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: 4-Track Tape Reel Queue / Lyrics */}
        <div
          className={`lg:col-span-5 rounded-[28px] border p-5 flex flex-col max-h-[500px] ${
            isDark ? 'bg-[#1F2329] border-zinc-700' : 'bg-white border-zinc-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-orange-500">
              {showLyrics ? 'OLED LYRIC MONITOR' : `TAPE QUEUE (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showLyrics ? 'Ver Fila' : 'Ver Letras'}
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
                        active ? 'bg-orange-500/20 border border-orange-500/50' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <span className="text-[10px] font-mono-tech font-bold text-orange-500 w-6">
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
        uiId="retro-synth-op1-studio"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
