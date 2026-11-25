import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernKaraokeStageUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  return (
    <div
      data-ui-id="modern-karaoke-stage"
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#091114] text-teal-50' : 'bg-[#F0F9F8] text-teal-950'
      }`}
    >
      {/* Top Minimal Stage Bar */}
      <header
        className={`max-w-5xl w-full mx-auto flex items-center justify-between gap-3 pb-4 border-b ${
          isDark ? 'border-teal-500/20' : 'border-teal-200'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <ArtworkAura
              isPlaying={isPlaying}
              gradientClass="from-teal-400/45 via-emerald-400/20 to-cyan-400/35"
              roundedClass="rounded-xl"
            />
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-teal-400/50">
              <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <MarqueeText
              text={currentTrack?.title || 'Palco Karaoke'}
              isPlaying={isPlaying}
              className="font-display font-bold text-sm sm:text-base"
            />
            <div className={`text-xs truncate ${isDark ? 'text-teal-300/70' : 'text-teal-700/80'}`}>
              {currentTrack?.artist || 'Aguardando faixa real'}
            </div>
          </div>
        </div>

        <div className="w-24 sm:w-32 shrink-0">
          <AnimatedEqBars isPlaying={isPlaying} bars={12} barClass="bg-teal-500" heightClass="h-7" />
        </div>
      </header>

      {/* Center: Dominant Synchronized Lyrics Stage */}
      <main className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center py-5">
        <div className="h-[48vh] overflow-y-auto px-2 sm:px-6 thin-scroll">
          <LyricsPanel
            variant={isDark ? 'stage' : 'stage-light'}
            accentClass={isDark ? 'text-teal-300' : 'text-teal-700'}
          />
        </div>
      </main>

      {/* Bottom Compact Stage Transport */}
      <footer
        className={`max-w-4xl w-full mx-auto border rounded-2xl p-4 space-y-3 ${
          isDark ? 'bg-[#0E191E] border-teal-500/25' : 'bg-white border-teal-200 shadow-lg'
        }`}
      >
        <IsolatedProgress
          trackDuration={currentTrack?.duration}
          barBgClass={isDark ? 'bg-teal-950' : 'bg-teal-100'}
          barFillClass="bg-teal-500"
          textClass={isDark ? 'text-teal-300/80' : 'text-teal-700'}
        />
        <div className="flex items-center justify-between gap-4">
          <div className={`text-xs hidden sm:block ${isDark ? 'text-teal-300/70' : 'text-teal-700'}`}>
            Toque em qualquer verso para pular para o trecho
          </div>
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <button
              type="button"
              onClick={() => void prevTrack()}
              aria-label="Anterior"
              className={`w-11 h-11 rounded-full flex items-center justify-center ${
                isDark ? 'bg-teal-950 hover:bg-teal-900' : 'bg-teal-100 hover:bg-teal-200 text-teal-900'
              }`}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              className="w-12 h-12 rounded-full bg-teal-500 hover:bg-teal-400 text-zinc-950 flex items-center justify-center shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Próxima"
              className={`w-11 h-11 rounded-full flex items-center justify-center ${
                isDark ? 'bg-teal-950 hover:bg-teal-900' : 'bg-teal-100 hover:bg-teal-200 text-teal-900'
              }`}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          {currentTrack && <DownloadButton track={currentTrack} />}
        </div>
      </footer>

      <ThemedDock
        uiId="modern-karaoke-stage"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
