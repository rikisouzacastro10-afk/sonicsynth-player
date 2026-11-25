import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { useAppStore } from '../stores/useAppStore';
import { AnalogVuMeter, LedPeakMeter, StudioMetalReel } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroReelToReelUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [tab, setTab] = useState<'tape' | 'lyrics'>('tape');
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-reel-to-reel"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#1A1816] text-zinc-100' : 'bg-[#EFECE6] text-zinc-900'
      }`}
    >
      <div className="w-full max-w-5xl flex items-center justify-between gap-2 mb-4 px-1">
        <span className={`font-mono-tech text-xs font-bold tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
          REVOX A77 // MASTER TAPE RECORDER
        </span>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech opacity-75">
          <span className="px-2 py-0.5 rounded border border-amber-500/40">7½ IPS · NAB EQ</span>
          <span>2-TRACK MASTER</span>
        </div>
      </div>

      {/* Brushed Steel & Wood Master Deck */}
      <div
        className={`w-full max-w-5xl rounded-2xl p-3 shadow-2xl border grid grid-cols-1 lg:grid-cols-12 gap-4 ${
          isDark ? 'bg-[#3D2719] border-amber-700/40' : 'bg-[#D6B898] border-amber-800/30'
        }`}
      >
        <div className="lg:col-span-7 relative rounded-xl bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 text-zinc-900 p-5 border border-white/60 flex flex-col justify-between gap-4">
          {/* Aluminum Faceplate Corner Screws */}
          <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-700" aria-hidden="true" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-700" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-700" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-zinc-500 border border-zinc-700" aria-hidden="true" />

          <div className="relative rounded-xl bg-zinc-900 p-4 border-2 border-zinc-700 flex items-center justify-around gap-4 shadow-inner overflow-hidden">
            {/* Magnetic Tape Glide Path */}
            <div
              aria-hidden="true"
              className={`absolute bottom-3 left-8 right-8 h-1 bg-[repeating-linear-gradient(90deg,#92400e_0_12px,#451a03_12px_24px)] opacity-80 anim-tape-glide ${
                !isPlaying ? 'anim-paused' : ''
              }`}
            />
            <StudioMetalReel isPlaying={isPlaying} sizeClass="w-32 h-32 sm:w-40 sm:h-40 relative z-10" />
            <div className="flex flex-col items-center gap-2 z-10 hidden sm:flex" aria-hidden="true">
              <div className="w-3 h-3 rounded-full bg-zinc-400 border-2 border-zinc-700" />
              <div className="w-4 h-16 rounded bg-zinc-700 border border-zinc-500" />
              <div className="w-3 h-3 rounded-full bg-zinc-400 border-2 border-zinc-700" />
            </div>
            <StudioMetalReel isPlaying={isPlaying} sizeClass="w-32 h-32 sm:w-40 sm:h-40 relative z-10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-5 grid grid-cols-2 gap-2">
              <AnalogVuMeter isPlaying={isPlaying} label="CH-L" />
              <AnalogVuMeter isPlaying={isPlaying} label="CH-R" altNeedle />
            </div>

            <div className="sm:col-span-7 space-y-2.5">
              <div className="bg-zinc-900 text-amber-300 rounded px-3 py-2 font-mono-tech">
                <MarqueeText
                  text={currentTrack?.title || 'Sem fita'}
                  isPlaying={isPlaying}
                  className="text-xs font-bold"
                />
                <div className="text-[11px] opacity-75 truncate">{currentTrack?.artist}</div>
              </div>

              <LedPeakMeter isPlaying={isPlaying} label="BIAS" isDark={false} />

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass="bg-zinc-500/40"
                barFillClass="bg-amber-600"
                textClass="text-zinc-800"
              />

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void prevTrack()}
                    aria-label="Anterior"
                    className="h-10 px-3 rounded bg-zinc-100 border border-zinc-600 hover:bg-white shadow"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                    className="h-10 px-5 rounded bg-amber-600 text-white font-bold shadow flex items-center gap-1.5"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span className="text-xs">{isPlaying ? 'STOP' : 'PLAY'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void nextTrack()}
                    aria-label="Próxima"
                    className="h-10 px-3 rounded bg-zinc-100 border border-zinc-600 hover:bg-white shadow"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
                {currentTrack && <DownloadButton track={currentTrack} compact />}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`lg:col-span-5 rounded-xl border p-4 flex flex-col h-[470px] ${
            isDark ? 'bg-[#181615] border-zinc-700 text-zinc-100' : 'bg-[#FAF7F2] border-amber-900/20 text-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-current/15 mb-2.5">
            <button
              type="button"
              onClick={() => setTab('tape')}
              className={`px-3 py-1.5 rounded text-xs font-bold ${
                tab === 'tape' ? 'bg-amber-500 text-zinc-950' : 'opacity-65 hover:opacity-100'
              }`}
            >
              Rolo de Sessão ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('lyrics')}
              className={`px-3 py-1.5 rounded text-xs font-bold ${
                tab === 'lyrics' ? 'bg-amber-500 text-zinc-950' : 'opacity-65 hover:opacity-100'
              }`}
            >
              Folha de Letras
            </button>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll">
            {tab === 'lyrics' ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded ${
                      currentTrack?.id === t.id ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-current/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void playTrack(t, queue)}
                      className="flex-1 min-w-0 text-left text-xs min-h-[38px]"
                    >
                      <div className="font-semibold truncate">
                        {String(i + 1).padStart(2, '0')}. {t.title}
                      </div>
                      <div className="text-[11px] opacity-65 truncate">{t.artist}</div>
                    </button>
                    <DownloadButton track={t} compact />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ThemedDock
        uiId="retro-reel-to-reel"
        activeTab={sheet || 'home'}
        onSelectTab={(tabVal) => setSheet(tabVal === 'home' ? null : tabVal)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
