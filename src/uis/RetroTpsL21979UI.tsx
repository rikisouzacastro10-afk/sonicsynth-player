import { useState } from 'react';
import { Disc, Mic2, Pause, Play, SkipBack, SkipForward, Square, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import {
  AnimatedEqBars,
  ArtworkAura,
  CassetteReel,
} from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroTpsL21979UI() {
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
  const seekTo = useAppStore((s) => s.seekTo);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [hotlineOn, setHotlineOn] = useState(false);
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-tps-l2-1979"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#0F1E33] text-slate-100' : 'bg-[#E6ECF4] text-slate-900'
      }`}
    >
      {/* Top 1979 Hardware Stamp */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPlaying ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-red-900'
            }`}
          />
          <span className="text-xs sm:text-sm font-condensed font-black tracking-[0.18em] uppercase">
            TPS-L2 STEREO CASSETTE · 1979 EDITION
          </span>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded border border-current/25">
          DUAL PHONES A/B
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Metallic Blue & Brushed Silver 1979 Chassis */}
        <div
          className={`lg:col-span-7 relative rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between gap-4 overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-[#2B6CB0] via-[#1D4E89] to-[#143763] border-slate-300/60 shadow-[0_24px_60px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.35)]'
              : 'bg-gradient-to-b from-[#4C89CE] via-[#346EB3] to-[#27558E] border-slate-100 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22),inset_0_2px_0_rgba(255,255,255,0.75)]'
          }`}
        >
          {/* Brushed Silver Top Control Strip with 4 Exposed Screws */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 text-zinc-900 p-3 border border-white/70 shadow-inner">
            <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-700" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-700" aria-hidden="true" />

            <div className="flex items-center justify-between px-3 pb-2 border-b border-zinc-400/70">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full border border-black/40 ${
                    isPlaying
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                      : 'bg-red-800'
                  }`}
                />
                <span className="text-[10px] font-mono-tech font-bold tracking-widest">
                  BATT / OPR
                </span>
              </div>
              <span className="text-[11px] font-condensed font-black tracking-widest">
                STEREO · HOTLINE
              </span>
            </div>

            {/* 3D Tactile 1979 Transport Keys + Iconic Orange Hotline Key */}
            <div className="grid grid-cols-5 gap-1.5 pt-2.5">
              <button
                type="button"
                onClick={() => void prevTrack()}
                className="h-12 rounded-md bg-gradient-to-b from-zinc-50 to-zinc-300 border border-zinc-500 shadow-[0_3px_0_#52525b] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-[10px] font-condensed font-bold"
              >
                <SkipBack className="w-3.5 h-3.5 fill-current" />
                <span>REW</span>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className={`h-12 rounded-md border shadow-[0_3px_0_#52525b] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-[10px] font-condensed font-bold ${
                  isPlaying
                    ? 'bg-emerald-400 text-zinc-950 border-emerald-700'
                    : 'bg-gradient-to-b from-zinc-50 to-zinc-300 border-zinc-500'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) togglePlay();
                  seekTo(0);
                }}
                className="h-12 rounded-md bg-gradient-to-b from-zinc-50 to-zinc-300 border border-zinc-500 shadow-[0_3px_0_#52525b] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-[10px] font-condensed font-bold"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                className="h-12 rounded-md bg-gradient-to-b from-zinc-50 to-zinc-300 border border-zinc-500 shadow-[0_3px_0_#52525b] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-[10px] font-condensed font-bold"
              >
                <SkipForward className="w-3.5 h-3.5 fill-current" />
                <span>FF</span>
              </button>
              <button
                type="button"
                onClick={() => setHotlineOn((v) => !v)}
                aria-pressed={hotlineOn}
                className={`h-12 rounded-md border shadow-[0_3px_0_#9a3412] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center text-[10px] font-condensed font-black text-white ${
                  hotlineOn ? 'bg-orange-400 border-orange-700' : 'bg-orange-500 border-orange-700'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span>HOTLINE</span>
              </button>
            </div>
          </div>

          {/* Transparent Cassette Window Door */}
          <div className="rounded-2xl bg-zinc-950/90 border-4 border-slate-300/75 p-3.5 shadow-inner relative">
            <div className="rounded-xl bg-[#F3EAD3] text-zinc-900 p-3 border-2 border-zinc-700">
              <div className="flex items-center justify-between border-b border-zinc-400 pb-1.5 mb-2">
                <span className="text-[10px] font-mono-tech font-bold px-1.5 py-0.5 bg-orange-500 text-white rounded">
                  SIDE A · 60 MIN
                </span>
                <span className="text-[11px] font-mono-tech font-bold truncate max-w-[170px]">
                  {currentTrack?.artist || 'SonicMorph'}
                </span>
              </div>

              <MarqueeText
                text={currentTrack?.title || 'Carregando fita...'}
                isPlaying={isPlaying}
                className="text-sm font-display font-bold mb-2.5"
              />

              {/* Reels & Tape Motion Window */}
              <div className="relative rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-3 flex items-center justify-between gap-3 overflow-hidden">
                <div
                  aria-hidden="true"
                  className={`absolute bottom-1 left-0 right-0 h-0.5 opacity-45 bg-[repeating-linear-gradient(90deg,#f97316_0_12px,transparent_12px_24px)] anim-tape-glide ${
                    !isPlaying ? 'anim-paused' : ''
                  }`}
                />
                <CassetteReel isPlaying={isPlaying} />
                <div className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
                  <div className="relative">
                    <ArtworkAura
                      isPlaying={isPlaying}
                      gradientClass="from-orange-500/45 via-sky-400/25 to-amber-500/40"
                      roundedClass="rounded-md"
                    />
                    <div className="relative w-14 h-14 rounded border border-zinc-600 overflow-hidden shadow">
                      <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                    </div>
                  </div>
                  <AnimatedEqBars isPlaying={isPlaying} bars={10} barClass="bg-orange-500" heightClass="h-3.5 w-full" />
                </div>
                <CassetteReel isPlaying={isPlaying} />
              </div>
            </div>
          </div>

          {/* Dual Slider Volume & Progress */}
          <div className="space-y-2.5 bg-black/20 rounded-xl p-3 border border-white/15">
            <div className="flex items-center gap-2 text-xs text-white">
              <Volume2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-[10px] font-mono-tech uppercase opacity-80">L+R GAIN</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume TPS-L2"
                className="flex-1 accent-orange-500"
              />
              <span className="font-mono-tech text-[11px] w-9 text-right">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <IsolatedProgress
                  trackDuration={currentTrack?.duration}
                  barBgClass="bg-black/40"
                  barFillClass="bg-orange-500"
                  textClass="text-white/85"
                  compact
                />
              </div>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>
        </div>

        {/* Right: Hotline Lyrics or Tape Index */}
        <div
          className={`lg:col-span-5 rounded-3xl border p-5 flex flex-col max-h-[480px] ${
            isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span className="text-xs font-mono-tech uppercase tracking-wider font-bold text-orange-500">
              {hotlineOn ? 'HOTLINE · LETRA AO VIVO' : `Fitas na Fila (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setHotlineOn((v) => !v)}
              className="text-xs underline opacity-80 hover:opacity-100"
            >
              {hotlineOn ? 'Ver Fitas' : 'Ver Letra'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto thin-scroll">
            {hotlineOn ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t, idx) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                        active ? 'bg-orange-500/20 border border-orange-500/50' : 'hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 text-left min-h-[40px]"
                      >
                        <Disc className={`w-4 h-4 shrink-0 ${active ? 'text-orange-500' : 'opacity-40'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">
                            {String(idx + 1).padStart(2, '0')}. {t.title}
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
        uiId="retro-tps-l2-1979"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
