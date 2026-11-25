import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnalogVuMeter, AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

function SpeakerCone({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-zinc-900 border-4 border-zinc-400/50 shadow-inner flex items-center justify-center mx-auto">
      <div
        className={`w-[84%] h-[84%] rounded-full bg-[radial-gradient(circle,#3f3f46_15%,#18181b_55%,#09090b_90%)] border border-zinc-600 flex items-center justify-center anim-speaker-pulse ${
          !isPlaying ? 'anim-paused' : ''
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-red-500/70 shadow-lg flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-zinc-400/40" />
        </div>
      </div>
    </div>
  );
}

export default function RetroBoomboxUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [centerMode, setCenterMode] = useState<'queue' | 'lyrics'>('queue');
  const isDark = themeMode === 'dark';

  const toolBtn = isDark
    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
    : 'bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300';

  return (
    <div
      data-ui-id="retro-boombox-ghettoblaster"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#1C1816] text-zinc-100' : 'bg-[#ECEAE7] text-zinc-900'
      }`}
    >
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 mb-3 px-1">
        <span className="font-condensed font-black text-lg tracking-wider text-red-600 dark:text-red-500 uppercase">
          BLASTER 84 STEREO
        </span>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech uppercase opacity-75">
          <span className="px-2 py-0.5 rounded bg-red-600/15 text-red-500 font-bold">SUPER BASS</span>
          <span>240W PMPO · TWIN DECK</span>
        </div>
      </div>

      {/* Chrome Carry Handle */}
      <div className="w-full max-w-3xl h-6 border-x-8 border-t-8 border-zinc-400 rounded-t-2xl mx-auto" aria-hidden="true" />

      {/* Main Boombox Chassis */}
      <div
        className={`w-full max-w-5xl rounded-2xl border-2 p-5 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative ${
          isDark
            ? 'bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border-zinc-500/60'
            : 'bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 border-zinc-400'
        }`}
      >
        <div className="lg:col-span-3 flex flex-col items-center gap-3">
          <SpeakerCone isPlaying={isPlaying} />
          <AnalogVuMeter isPlaying={isPlaying} label="LEFT" />
          <span className={`text-[10px] font-mono-tech ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
            LEFT WOOFER 120W
          </span>
        </div>

        <div
          className={`lg:col-span-6 border-2 rounded-xl p-4 space-y-3.5 ${
            isDark ? 'bg-zinc-950 border-zinc-600 text-zinc-100' : 'bg-white border-zinc-400 text-zinc-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-red-500/45 via-orange-500/20 to-rose-500/40"
                roundedClass="rounded-md"
              />
              <div className="relative w-16 h-16 rounded border border-red-500/50 overflow-hidden">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Track'} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <MarqueeText
                text={currentTrack?.title || 'BLASTER READY'}
                isPlaying={isPlaying}
                className="font-condensed text-lg font-bold"
              />
              <div className="text-xs opacity-65 truncate">
                {currentTrack?.artist || 'Escolha uma faixa na fila'}
              </div>
            </div>
            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>

          <AnimatedEqBars isPlaying={isPlaying} bars={18} barClass="bg-red-500" heightClass="h-8" />
          <LedPeakMeter isPlaying={isPlaying} label="AMP" isDark={isDark} />

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
            barFillClass="bg-red-500"
            textClass={isDark ? 'text-zinc-400' : 'text-zinc-600'}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Anterior"
                className="h-11 w-12 rounded bg-zinc-200 text-zinc-950 flex items-center justify-center font-bold hover:bg-white border border-zinc-400"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="h-11 px-6 rounded bg-red-600 hover:bg-red-500 text-white font-condensed font-bold flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima"
                className="h-11 w-12 rounded bg-zinc-200 text-zinc-950 flex items-center justify-center font-bold hover:bg-white border border-zinc-400"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCenterMode((m) => (m === 'queue' ? 'lyrics' : 'queue'))}
              className={`px-3 py-2 rounded text-xs font-semibold min-h-[40px] ${toolBtn}`}
            >
              {centerMode === 'queue' ? 'Ver Letras' : 'Ver Fila'}
            </button>
          </div>

          <div className="h-44 overflow-y-auto border-t border-current/15 pt-2 thin-scroll">
            {centerMode === 'lyrics' ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1">
                {queue.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => void playTrack(t, queue)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex justify-between min-h-[36px] ${
                      currentTrack?.id === t.id
                        ? 'bg-red-600/20 text-red-500 font-bold'
                        : 'hover:bg-current/5'
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    <span className="opacity-60 ml-2 shrink-0">{t.artist}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col items-center gap-3">
          <SpeakerCone isPlaying={isPlaying} />
          <AnalogVuMeter isPlaying={isPlaying} label="RIGHT" altNeedle />
          <span className={`text-[10px] font-mono-tech ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
            RIGHT WOOFER 120W
          </span>
        </div>
      </div>

      <ThemedDock
        uiId="retro-boombox-ghettoblaster"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
