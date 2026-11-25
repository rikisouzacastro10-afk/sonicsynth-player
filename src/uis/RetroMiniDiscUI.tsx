import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroMiniDiscUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isOnline = useAppStore((s) => s.isOnline);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [panelTab, setPanelTab] = useState<'tracks' | 'lyrics'>('tracks');
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-minidisc-y2k"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark
          ? 'bg-gradient-to-br from-[#0D1829] via-[#13233A] to-[#08101C] text-sky-50'
          : 'bg-gradient-to-br from-[#E2EDF8] via-[#EDF4FB] to-[#DCE8F5] text-slate-900'
      }`}
    >
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 mb-4 px-1">
        <span className={`font-mono-tech text-xs font-bold tracking-widest ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
          NET-MD MZ-Y2K // ATRAC-R
        </span>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech">
          <span className="px-2 py-0.5 rounded-full border border-sky-400/35">80MIN DISC</span>
          <span className={isOnline ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
            {isOnline ? 'USB-SYNC' : 'LOCAL'}
          </span>
        </div>
      </div>

      <div
        className={`w-full max-w-4xl rounded-3xl p-5 shadow-2xl border-2 grid grid-cols-1 lg:grid-cols-12 gap-5 relative ${
          isDark
            ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-slate-100 border-slate-500/50'
            : 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 border-white/80'
        }`}
      >
        <div className="lg:col-span-6 rounded-2xl bg-gradient-to-b from-[#1E3A5F] to-[#132944] text-white p-5 flex flex-col justify-between gap-4 border border-sky-300/40">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-sky-400/45 via-cyan-300/20 to-indigo-500/40"
                roundedClass="rounded-2xl"
              />
              <div className="relative w-28 h-28 rounded-2xl bg-sky-950/90 border-2 border-sky-300/50 flex items-center justify-center shadow-inner">
                <div
                  className={`w-22 h-22 rounded-full bg-[conic-gradient(from_0deg,#38bdf8,#e0f2fe,#0284c7,#bae6fd,#38bdf8)] flex items-center justify-center anim-spin-disc ${
                    !isPlaying ? 'anim-paused' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                    <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'MD'} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#1A2922] border-2 border-slate-700 rounded-lg p-3 font-mono-tech text-emerald-300 min-w-0 space-y-1.5">
              <div className="text-[10px] opacity-75 flex justify-between">
                <span>MDLP2 · GROUP 01</span>
                <span>{isPlaying ? '▶ DISC' : '❚❚ HOLD'}</span>
              </div>
              <MarqueeText
                text={currentTrack?.title || 'INSERT DISC'}
                isPlaying={isPlaying}
                className="text-sm font-bold"
              />
              <div className="text-xs opacity-80 truncate">{currentTrack?.artist || 'Aguardando faixa'}</div>
              <AnimatedEqBars isPlaying={isPlaying} bars={12} barClass="bg-emerald-400" heightClass="h-4" />
              {currentTrack && (
                <div className="pt-0.5">
                  <DownloadButton track={currentTrack} compact className="text-emerald-300" />
                </div>
              )}
            </div>
          </div>

          <LedPeakMeter isPlaying={isPlaying} label="ATRAC" isDark />

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass="bg-sky-950"
            barFillClass="bg-sky-400"
            textClass="text-sky-200"
          />

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => void prevTrack()}
              aria-label="Anterior"
              className="w-12 h-12 rounded-full bg-slate-200 text-slate-900 shadow flex items-center justify-center hover:bg-white"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              className="w-16 h-16 rounded-full bg-gradient-to-b from-sky-300 to-sky-500 text-slate-950 shadow-lg border-2 border-white flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Próxima"
              className="w-12 h-12 rounded-full bg-slate-200 text-slate-900 shadow flex items-center justify-center hover:bg-white"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className={`lg:col-span-6 rounded-2xl border p-4 flex flex-col h-[390px] ${
            isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-current/15 pb-2.5 mb-2.5">
            <button
              type="button"
              onClick={() => setPanelTab('tracks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] ${
                panelTab === 'tracks' ? 'bg-sky-600 text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Índice do Disco ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setPanelTab('lyrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[36px] ${
                panelTab === 'lyrics' ? 'bg-sky-600 text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Letras
            </button>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll">
            {panelTab === 'lyrics' ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1">
                {queue.map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-lg ${
                      currentTrack?.id === t.id ? 'bg-sky-600 text-white' : 'hover:bg-current/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void playTrack(t, queue)}
                      className="flex-1 min-w-0 text-left text-xs font-medium truncate min-h-[38px]"
                    >
                      {String(i + 1).padStart(2, '0')} · {t.title} — {t.artist}
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
        uiId="retro-minidisc-y2k"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
