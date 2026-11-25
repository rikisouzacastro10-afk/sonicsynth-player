import { useState } from 'react';
import { Pause, Play, Radio, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { AnalogVuMeter, AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernFmConsoleUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const queueIndex = useAppStore((s) => s.queueIndex);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  const dialPercent = queue.length > 1 ? Math.round((queueIndex / (queue.length - 1)) * 100) : 42;
  const freqMhz = (88.1 + dialPercent * 0.198).toFixed(1);

  const chassis = isDark
    ? 'bg-[#191817] border-zinc-700 text-stone-100'
    : 'bg-[#F2EFEA] border-stone-300 text-stone-900';

  const panelCard = isDark
    ? 'bg-[#22201E] border-zinc-700'
    : 'bg-white border-stone-300 shadow-sm';

  return (
    <div
      data-ui-id="modern-fm-console"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col justify-between gap-5 transition-colors ${
        isDark ? 'bg-[#11100F] text-stone-100' : 'bg-[#E5E0D8] text-stone-900'
      }`}
    >
      <div className={`max-w-6xl w-full mx-auto my-auto rounded-3xl border-2 p-5 sm:p-7 space-y-5 shadow-2xl ${chassis}`}>
        {/* Console Top Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-current/15 pb-4">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-orange-500" />
            <span className="font-display font-bold text-lg tracking-tight">Arquitetura FM Console</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono-tech opacity-75">
            <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-500 font-bold">RDS STEREO</span>
            <span>{freqMhz} MHz</span>
          </div>
        </header>

        {/* Precision Linear FM Frequency Ruler */}
        <div className={`rounded-2xl border p-4 space-y-2 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-stone-900 text-white border-stone-800'}`}>
          <div className="flex items-center justify-between text-xs font-mono-tech">
            <span className="text-orange-400">FM STEREO · {freqMhz} MHz</span>
            <span className="opacity-70">{currentTrack?.source?.toUpperCase() || 'RECEIVER'}</span>
          </div>
          <div className="relative h-8 flex items-center">
            <div className="w-full h-px bg-zinc-700" />
            <div className="absolute inset-x-0 flex justify-between px-1 pointer-events-none">
              {Array.from({ length: 21 }).map((_, idx) => (
                <div key={idx} className={`w-px ${idx % 5 === 0 ? 'h-4 bg-zinc-400' : 'h-2 bg-zinc-600'}`} />
              ))}
            </div>
            {/* Moving Tuning Needle (GPU transform) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-orange-500 rounded-full transition-transform duration-300"
              style={{ left: `${dialPercent}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        </div>

        {/* Split Console Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className={`lg:col-span-5 rounded-2xl border p-5 flex flex-col justify-between gap-4 ${panelCard}`}>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <ArtworkAura
                  isPlaying={isPlaying}
                  gradientClass="from-orange-500/40 via-amber-400/20 to-red-500/35"
                  roundedClass="rounded-xl"
                />
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-current/15">
                  <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <MarqueeText
                  text={currentTrack?.title || 'Sintonizando...'}
                  isPlaying={isPlaying}
                  className="font-display text-xl font-bold"
                />
                <p className="text-xs opacity-70 truncate mt-0.5">
                  {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'Arquitetura FM'}
                </p>
                <div className="mt-2">
                  {currentTrack && <DownloadButton track={currentTrack} compact />}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <AnalogVuMeter isPlaying={isPlaying} label="TUNER L" />
              <AnalogVuMeter isPlaying={isPlaying} label="TUNER R" altNeedle />
            </div>

            <AnimatedEqBars isPlaying={isPlaying} bars={18} barClass="bg-orange-500" heightClass="h-6" />
            <LedPeakMeter isPlaying={isPlaying} label="RF" isDark={isDark} />

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass={isDark ? 'bg-zinc-800' : 'bg-stone-200'}
              barFillClass="bg-orange-600"
              textClass={isDark ? 'text-stone-400' : 'text-stone-600'}
            />

            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-12 h-12 rounded-xl border flex items-center justify-center ${panelCard}`}>
                <SkipBack className="w-5 h-5" />
              </button>
              <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-16 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-md">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-12 h-12 rounded-xl border flex items-center justify-center ${panelCard}`}>
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={`lg:col-span-4 rounded-2xl border p-5 flex flex-col h-96 ${panelCard}`}>
            <div className="text-xs font-mono-tech uppercase opacity-60 mb-2">Estações / Fila</div>
            <div className="flex-1 overflow-y-auto divide-y divide-current/10 thin-scroll">
              {queue.map((t, idx) => {
                const active = currentTrack?.id === t.id;
                return (
                  <div key={t.id} className="py-2 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => void playTrack(t, queue)} className="flex-1 min-w-0 text-left flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${active ? 'text-orange-500 font-bold' : ''}`}>
                        {(88.1 + idx * 1.4).toFixed(1)} · {t.title}
                      </span>
                      <span className="text-[10px] font-mono-tech opacity-55 tabular-nums shrink-0">{formatDuration(t.duration)}</span>
                    </button>
                    <DownloadButton track={t} compact />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`lg:col-span-3 rounded-2xl border p-5 flex flex-col h-96 ${panelCard}`}>
            <div className="text-xs font-mono-tech uppercase opacity-60 mb-2">RDS Letras</div>
            <div className="flex-1 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </div>

      <ThemedDock
        uiId="modern-fm-console"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
