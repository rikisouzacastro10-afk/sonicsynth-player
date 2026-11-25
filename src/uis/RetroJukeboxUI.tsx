import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { useAppStore } from '../stores/useAppStore';
import {
  AnalogVuMeter,
  AnimatedEqBars,
  ArtworkAura,
  VinylPlatterWithGrooves,
} from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroJukeboxUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-arcade-jukebox"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#140A10] text-rose-50' : 'bg-[#FFF1F3] text-rose-950'
      }`}
    >
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 mb-4 px-1">
        <span className={`font-serif-editorial italic text-xl font-bold ${isDark ? 'text-amber-300' : 'text-rose-700'}`}>
          Wurlitzer Diner ’58
        </span>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech uppercase">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-bold">
            CREDIT 02
          </span>
          <span className="opacity-75">HI-FI 45 RPM</span>
        </div>
      </div>

      {/* Arched Jukebox Cabinet */}
      <div
        className={`w-full max-w-4xl rounded-t-[140px] rounded-b-3xl border-4 p-6 sm:p-8 space-y-5 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-b from-[#451428] via-[#2B0D19] to-[#1A080F] border-zinc-300/70 shadow-[0_0_60px_rgba(244,63,94,0.28)]'
            : 'bg-gradient-to-b from-[#FCE7F3] via-[#FFE4E6] to-[#FECDD3] border-rose-400 shadow-xl'
        }`}
      >
        {/* Top Neon Tube + Glowing Marquee Bulbs */}
        <div className="space-y-2">
          <div
            className={`h-3 w-2/3 mx-auto rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-cyan-300 anim-jukebox-neon ${
              !isPlaying ? 'anim-paused' : ''
            }`}
            aria-hidden="true"
          />
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6].map((bulb) => (
              <span
                key={bulb}
                className={`w-2 h-2 rounded-full ${
                  bulb % 2 === 0 ? 'bg-amber-300' : 'bg-rose-400'
                } anim-twinkle ${!isPlaying ? 'anim-paused opacity-40' : ''}`}
                style={{ animationDelay: `${bulb * 0.18}s` }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex flex-col items-center gap-4">
            <div className="relative">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-amber-400/45 via-rose-500/30 to-cyan-400/35"
                roundedClass="rounded-full"
              />
              <VinylPlatterWithGrooves
                isPlaying={isPlaying}
                artwork={currentTrack?.artwork}
                title={currentTrack?.title}
                sizeClass="w-52 h-52 sm:w-56 sm:h-56"
                labelRingClass="border-amber-300"
              />
            </div>

            <div className="text-center w-full px-2">
              <MarqueeText
                text={currentTrack?.title || 'Selecione um disco'}
                isPlaying={isPlaying}
                className={`font-serif-editorial text-xl font-bold ${isDark ? 'text-amber-100' : 'text-rose-950'}`}
              />
              <p className={`text-xs truncate ${isDark ? 'text-rose-200/80' : 'text-rose-700'}`}>
                {currentTrack?.artist}
              </p>
            </div>

            <AnimatedEqBars
              isPlaying={isPlaying}
              bars={14}
              barClass="bg-gradient-to-t from-rose-500 to-amber-300"
              heightClass="h-8 w-full"
            />

            <AnalogVuMeter isPlaying={isPlaying} label="TUBE AMP" />

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass={isDark ? 'bg-rose-950' : 'bg-rose-200'}
              barFillClass="bg-amber-400"
              textClass={isDark ? 'text-rose-200' : 'text-rose-800'}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Anterior"
                className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow border border-zinc-300"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-white"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima"
                className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow border border-zinc-300"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>

          <div
            className={`lg:col-span-7 rounded-2xl border-4 p-4 shadow-inner flex flex-col h-[440px] ${
              isDark
                ? 'bg-[#211018] text-rose-50 border-rose-400/40'
                : 'bg-[#FFF7E6] text-zinc-900 border-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between border-b-2 border-rose-600 pb-2 mb-3">
              <span className={`font-condensed font-black uppercase text-sm ${isDark ? 'text-amber-300' : 'text-rose-800'}`}>
                {showLyrics ? 'LETRA DA CANÇÃO' : 'SELETOR DE DISCOS A1 – B8'}
              </span>
              <button
                type="button"
                onClick={() => setShowLyrics((v) => !v)}
                className="px-3 py-1 rounded bg-rose-600 text-white text-xs font-bold"
              >
                {showLyrics ? 'Ver Discos' : 'Ver Letras'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto thin-scroll">
              {showLyrics ? (
                <LyricsPanel variant={isDark ? 'dark' : 'light'} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {queue.slice(0, 12).map((t, i) => {
                    const code = `${i < 6 ? 'A' : 'B'}${(i % 6) + 1}`;
                    const active = currentTrack?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded-lg border-2 ${
                          active
                            ? isDark
                              ? 'border-amber-400 bg-rose-900/60'
                              : 'border-rose-600 bg-rose-100'
                            : isDark
                              ? 'border-rose-800/60 bg-rose-950/60 hover:border-rose-500'
                              : 'border-zinc-300 bg-white hover:border-rose-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void playTrack(t, queue)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        >
                          <span className="px-2 py-1 rounded bg-rose-700 text-white font-mono-tech text-[11px] font-bold shrink-0">
                            {code}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate">{t.title}</div>
                            <div className="text-[10px] opacity-70 truncate">{t.artist}</div>
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
      </div>

      <ThemedDock
        uiId="retro-arcade-jukebox"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
