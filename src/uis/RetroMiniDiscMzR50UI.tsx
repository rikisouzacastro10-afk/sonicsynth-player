import { useState } from 'react';
import { Disc3, Mic2, Pause, Play, RotateCw, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroMiniDiscMzR50UI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
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
      data-ui-id="retro-minidisc-mz-r50"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#111722] text-slate-100' : 'bg-[#E8EDF3] text-slate-900'
      }`}
    >
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 mb-4 px-1">
        <div className="flex items-center gap-2">
          <Disc3 className={`w-4 h-4 text-amber-400 ${isPlaying ? 'anim-spin-disc' : ''}`} />
          <span className="text-xs sm:text-sm font-mono-tech font-bold tracking-widest uppercase">
            MZ-R50 PORTABLE MINIDISC RECORDER · 1997
          </span>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
          ATRAC 4.5 · 40s ESP
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Brushed Magnesium Alloy Body */}
        <div
          className={`lg:col-span-7 relative rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-br from-[#2B374B] via-[#1E293B] to-[#131B29] border-slate-500/60 shadow-[0_24px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]'
              : 'bg-gradient-to-br from-[#F1F5F9] via-[#DCE3EC] to-[#C8D2DF] border-slate-400 shadow-[0_20px_50px_rgba(15,23,42,0.16),inset_0_2px_0_rgba(255,255,255,0.9)]'
          }`}
        >
          {/* Top Side MiniDisc Cartridge Window + Spinning Optical Disc */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-5 aspect-square rounded-2xl bg-zinc-950/90 border-2 border-slate-400/50 p-2.5 flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute top-1.5 left-2 text-[8px] font-mono-tech text-amber-400/80 uppercase">
                MD 74 MIN
              </div>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass="from-amber-400/40 via-sky-400/25 to-orange-500/35"
                  roundedClass="rounded-full"
                />
                <div
                  className={`relative w-full h-full rounded-full border-4 border-zinc-400/70 overflow-hidden bg-[conic-gradient(from_0deg,#38bdf8_0deg,#a855f7_90deg,#f59e0b_180deg,#38bdf8_270deg,#38bdf8_360deg)] p-1.5 anim-spin-disc ${
                    !isPlaying ? 'anim-paused' : ''
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-zinc-900 relative">
                    <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'MD'} />
                    <div className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-zinc-200 border-2 border-zinc-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Amber / Blue Backlit Dot-Matrix LCD Screen */}
            <div className="col-span-7 rounded-2xl bg-[#0F172A] border-2 border-slate-500/60 p-3.5 text-amber-300 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between text-[9px] font-mono-tech border-b border-amber-400/25 pb-1">
                <span>{isPlaying ? '▶ TOC READING OK' : '❚❚ STANDBY'}</span>
                <span className="text-sky-300">DIGITAL SYNC</span>
              </div>

              <MarqueeText
                text={currentTrack?.title || 'Inserindo MiniDisc...'}
                isPlaying={isPlaying}
                className="text-sm font-mono-tech font-bold text-amber-200"
              />
              <div className="text-xs font-mono-tech text-sky-300 truncate">
                {currentTrack?.artist || 'SonicMorph'}
              </div>

              <AnimatedEqBars
                isPlaying={isPlaying}
                bars={16}
                barClass="bg-amber-400"
                heightClass="h-6"
              />
            </div>
          </div>

          {/* Serrated Jog Dial & Transport Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Faixa anterior"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-500 flex items-center justify-center active:scale-90 transition-transform"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="w-14 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold border border-amber-200 flex items-center justify-center active:scale-90 transition-transform shadow-md"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima faixa"
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-500 flex items-center justify-center active:scale-90 transition-transform"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                aria-label="Alternar Letras"
                className={`h-11 px-3 rounded-xl border text-xs font-mono-tech font-bold inline-flex items-center gap-1.5 ${
                  showLyrics
                    ? 'bg-sky-400 text-slate-950 border-white'
                    : 'bg-slate-800 text-amber-300 border-slate-500'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>LYRIC</span>
              </button>
            </div>

            {/* Serrated Jog Dial Widget */}
            <button
              type="button"
              onClick={() => void nextTrack()}
              title="Jog Dial (Avançar faixa)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-dashed border-amber-400/70 text-amber-300 text-[10px] font-mono-tech font-bold hover:bg-zinc-800 active:scale-95 transition-transform"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isPlaying ? 'anim-spin-gear' : ''}`} />
              <span>JOG DIAL</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume MiniDisc"
                className="flex-1 accent-amber-500"
              />
              <span className="font-mono-tech text-[10px] w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <IsolatedProgress
                  trackDuration={currentTrack?.duration}
                  barBgClass="bg-slate-900/70"
                  barFillClass="bg-amber-400"
                  compact
                />
              </div>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>
        </div>

        {/* Right: Disc Tracklist / Lyrics */}
        <div
          className={`lg:col-span-5 rounded-3xl border p-5 flex flex-col max-h-[460px] ${
            isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-amber-400">
              {showLyrics ? 'MD TEXT LYRICS' : `TOC TRACKS (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              {showLyrics ? 'Ver TOC' : 'Ver Letras'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {showLyrics ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t, i) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl ${
                        active ? 'bg-amber-500/20 border border-amber-400/50' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <Disc3 className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : 'opacity-40'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">
                            {String(i + 1).padStart(2, '0')}. {t.title}
                          </div>
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
        uiId="retro-minidisc-mz-r50"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
