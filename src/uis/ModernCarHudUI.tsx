import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Wifi, WifiOff } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernCarHudUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isOnline = useAppStore((s) => s.isOnline);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  const panelCard = isDark
    ? 'bg-[#10141C] border-2 border-zinc-800'
    : 'bg-white border-2 border-zinc-300 shadow-md';

  const bigTileBtn = isDark
    ? 'bg-[#141923] hover:bg-zinc-800 border-2 border-zinc-700 text-white'
    : 'bg-white hover:bg-zinc-100 border-2 border-zinc-300 text-zinc-950 shadow-sm';

  return (
    <div
      data-ui-id="modern-car-hud"
      className={`min-h-screen w-full p-4 sm:p-6 pb-28 sm:pb-28 flex flex-col justify-between gap-4 transition-colors ${
        isDark ? 'bg-[#07090D] text-white' : 'bg-[#E9EEF5] text-zinc-950'
      }`}
    >
      {/* Top Status Strip */}
      <header className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm font-condensed font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
          {isOnline ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-amber-500" />}
          <span>DRIVE HUD · {isOnline ? 'ONLINE' : 'MODO OFFLINE'}</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono-tech uppercase opacity-80">
          <span className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-500 font-bold">
            CARPLAY LINK
          </span>
          <span>SAFE TOUCH UI</span>
        </div>
      </header>

      {/* Main Split Automotive Dashboard */}
      <main className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto">
        {/* Left: Giant High-Contrast Track View */}
        <div className={`lg:col-span-6 rounded-3xl p-6 flex flex-col justify-between gap-5 ${panelCard}`}>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-blue-500/45 via-sky-400/20 to-indigo-500/40"
                roundedClass="rounded-2xl"
              />
              <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}>
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="text-xs font-mono-tech text-blue-500">
                {currentTrack?.source ? `FONTE · ${currentTrack.source.toUpperCase()}` : 'DRIVE AUDIO'}
              </div>
              <MarqueeText
                text={currentTrack?.title || 'Aguardando faixa...'}
                isPlaying={isPlaying}
                className="font-condensed font-black text-2xl sm:text-3xl leading-tight"
              />
              <p className={`text-lg sm:text-xl font-medium truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {currentTrack?.artist || 'Pronto para dirigir'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <AnimatedEqBars isPlaying={isPlaying} bars={22} barClass="bg-blue-500" heightClass="h-8" />
            <LedPeakMeter isPlaying={isPlaying} label="DAC" isDark={isDark} />
          </div>

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            variant="car"
            barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
            barFillClass="bg-blue-500"
            textClass={isDark ? 'text-zinc-300 text-sm' : 'text-zinc-700 text-sm'}
          />
        </div>

        {/* Right: Oversized >= 64px Touch Targets */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => void prevTrack()}
            aria-label="Anterior"
            className={`min-h-[110px] rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform ${bigTileBtn}`}
          >
            <SkipBack className="w-10 h-10 fill-current" />
            <span className="font-condensed font-bold text-lg">ANTERIOR</span>
          </button>

          <button
            type="button"
            onClick={() => void nextTrack()}
            aria-label="Próxima"
            className={`min-h-[110px] rounded-3xl flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform ${bigTileBtn}`}
          >
            <SkipForward className="w-10 h-10 fill-current" />
            <span className="font-condensed font-bold text-lg">PRÓXIMA</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            className="col-span-2 min-h-[120px] rounded-3xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-transform"
          >
            {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current" />}
            <span className="font-condensed font-black text-3xl uppercase">
              {isPlaying ? 'Pausar' : 'Tocar'}
            </span>
          </button>

          {currentTrack && (
            <div className={`col-span-2 rounded-2xl px-5 py-3 flex items-center justify-between ${panelCard}`}>
              <span className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Salvar faixa atual para estrada
              </span>
              <DownloadButton track={currentTrack} />
            </div>
          )}
        </div>
      </main>

      <ThemedDock
        uiId="modern-car-hud"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
