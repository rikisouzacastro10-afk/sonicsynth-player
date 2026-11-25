import { useState } from 'react';
import { Disc, Mic2, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import {
  AnalogVuMeter,
  AnimatedEqBars,
  ArtworkAura,
  CassetteReel,
  LedPeakMeter,
} from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroWalkmanUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isOnline = useAppStore((s) => s.isOnline);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const isDark = themeMode === 'dark';

  const screwCls = isDark
    ? 'bg-slate-400/70 border-slate-700'
    : 'bg-slate-400 border-slate-600/60';

  return (
    <div
      data-ui-id="retro-walkman-cassette"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#141A24] text-slate-100' : 'bg-[#EAEFF6] text-slate-900'
      }`}
    >
      {/* Hardware Branding Header */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isPlaying ? 'bg-orange-500 shadow-[0_0_10px_#fb923c]' : 'bg-slate-400'
            }`}
          />
          <span
            className={`text-xs sm:text-sm font-condensed font-black tracking-wider uppercase truncate ${
              isDark ? 'text-orange-400' : 'text-orange-600'
            }`}
          >
            WALKMAN TPS-M90 · METAL STEREO
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech shrink-0">
          <span
            className={`px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            DOLBY B · MEGA BASS
          </span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              isOnline ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
            }`}
          >
            {isOnline ? 'HI-FI' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Main Walkman Split Chassis */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div
          className={`lg:col-span-7 relative rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between gap-4 ${
            isDark
              ? 'bg-gradient-to-br from-[#233B5C] via-[#1C2E4A] to-[#132036] border-slate-400/45 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]'
              : 'bg-gradient-to-br from-[#DCE7F7] via-[#C9D8EE] to-[#B6C9E4] border-slate-400/70 shadow-[0_24px_60px_rgba(15,23,42,0.14),inset_0_2px_0_rgba(255,255,255,0.8)]'
          }`}
        >
          {/* Corner Chassis Screws */}
          <span className={`absolute top-2.5 left-2.5 w-2 h-2 rounded-full border ${screwCls}`} aria-hidden="true" />
          <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border ${screwCls}`} aria-hidden="true" />
          <span className={`absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full border ${screwCls}`} aria-hidden="true" />
          <span className={`absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full border ${screwCls}`} aria-hidden="true" />

          {/* Mechanical Top Deck Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={() => void prevTrack()}
              className="h-12 rounded-t-md rounded-b-xl bg-zinc-100 hover:bg-white text-zinc-900 font-condensed font-bold text-xs flex flex-col items-center justify-center shadow active:translate-y-0.5 transition-transform"
            >
              <SkipBack className="w-4 h-4 fill-current" />
              <span>REW</span>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={`h-12 rounded-t-md rounded-b-xl font-condensed font-bold text-xs flex flex-col items-center justify-center shadow active:translate-y-0.5 transition-transform ${
                isPlaying ? 'bg-orange-500 text-white' : 'bg-zinc-100 hover:bg-white text-zinc-900'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              className="h-12 rounded-t-md rounded-b-xl bg-zinc-100 hover:bg-white text-zinc-900 font-condensed font-bold text-xs flex flex-col items-center justify-center shadow active:translate-y-0.5 transition-transform"
            >
              <SkipForward className="w-4 h-4 fill-current" />
              <span>FF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className={`h-12 rounded-t-md rounded-b-xl font-condensed font-bold text-xs flex flex-col items-center justify-center shadow active:translate-y-0.5 transition-transform ${
                showLyrics ? 'bg-amber-400 text-zinc-950' : 'bg-orange-600 text-white'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>HOTLINE</span>
            </button>
          </div>

          {/* Transparent Cassette Window */}
          <div className="rounded-2xl bg-zinc-900/95 border-4 border-zinc-400/50 p-3.5 sm:p-4 shadow-inner">
            <div className="rounded-xl bg-[#F4EBD9] text-zinc-900 p-3 border border-zinc-700">
              <div className="flex items-center justify-between border-b border-zinc-400 pb-1.5 mb-2">
                <span className="text-[10px] font-mono-tech font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-[#F4EBD9]">
                  TYPE IV · METAL 90
                </span>
                <span className="text-[11px] font-mono-tech font-semibold truncate max-w-[180px]">
                  {currentTrack?.artist || 'SonicMorph'}
                </span>
              </div>

              <MarqueeText
                text={currentTrack?.title || 'Carregando paradas reais...'}
                isPlaying={isPlaying}
                className="text-sm font-display font-bold mb-2.5"
              />

              <div className="relative bg-zinc-950 rounded-lg px-4 py-3 flex items-center justify-between gap-4 border border-zinc-700 overflow-hidden">
                {/* Gliding magnetic tape guide line */}
                <div
                  aria-hidden="true"
                  className={`absolute bottom-1.5 left-0 right-0 h-0.5 opacity-35 bg-[repeating-linear-gradient(90deg,#fb923c_0_12px,transparent_12px_24px)] anim-tape-glide ${
                    !isPlaying ? 'anim-paused' : ''
                  }`}
                />
                <CassetteReel isPlaying={isPlaying} />
                <div className="flex-1 flex flex-col items-center gap-2 relative z-10">
                  <div className="relative">
                    <ArtworkAura
                      isPlaying={isPlaying}
                      gradientClass="from-orange-500/45 via-amber-400/25 to-red-500/40"
                      roundedClass="rounded-lg"
                    />
                    <div className="relative w-16 h-16 rounded border border-zinc-600 overflow-hidden shadow-md">
                      <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                    </div>
                  </div>
                  <AnimatedEqBars isPlaying={isPlaying} bars={12} barClass="bg-orange-500" heightClass="h-4 w-full" />
                </div>
                <CassetteReel isPlaying={isPlaying} />
              </div>
            </div>
          </div>

          {/* Stereo VU + LED Peak + Volume + Tape Counter */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-6 sm:col-span-5 grid grid-cols-2 gap-1.5">
                <AnalogVuMeter isPlaying={isPlaying} label="L" />
                <AnalogVuMeter isPlaying={isPlaying} label="R" altNeedle />
              </div>
              <div className="col-span-6 sm:col-span-7 space-y-2">
                <LedPeakMeter isPlaying={isPlaying} label="PEAK" isDark={isDark} />
                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  <Volume2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Volume"
                    className="flex-1 accent-orange-500"
                  />
                  <span className="font-mono-tech text-[10px] w-8 text-right">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <IsolatedProgress
                  trackDuration={currentTrack?.duration}
                  barBgClass={isDark ? 'bg-slate-900' : 'bg-slate-400/50'}
                  barFillClass="bg-orange-500"
                  textClass={isDark ? 'text-slate-300' : 'text-slate-800'}
                  compact
                />
              </div>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>
        </div>

        {/* Right: Tape Rack / Lyrics Drawer */}
        <div
          className={`lg:col-span-5 rounded-3xl border p-5 flex flex-col max-h-[480px] ${
            isDark ? 'bg-slate-900/80 border-slate-700/60' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
            <span
              className={`text-xs font-mono-tech uppercase tracking-wider font-bold ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`}
            >
              {showLyrics ? 'Letras Sincronizadas' : `Fitas na Fila (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={() => setShowLyrics((v) => !v)}
              className="text-xs opacity-75 hover:opacity-100 underline"
            >
              {showLyrics ? 'Ver Fila' : 'Ver Letras'}
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
        uiId="retro-walkman-cassette"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
