import { useState } from 'react';
import { Gamepad2, Pause, Play, Search, SkipBack, SkipForward, Sparkles } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroDualScreen3dsUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);
  const setUISwitcherOpen = useAppStore((s) => s.setUISwitcherOpen);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [bottomTab, setBottomTab] = useState<'menu' | 'lyrics'>('menu');
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-dualscreen-3ds-sp"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#141222] text-slate-100' : 'bg-[#ECEAF5] text-slate-900'
      }`}
    >
      {/* Clamshell Console Frame */}
      <div className="w-full max-w-2xl space-y-2">
        {/* Top Widescreen Lid */}
        <div
          className={`rounded-t-3xl rounded-b-xl border-4 p-4 sm:p-5 shadow-2xl ${
            isDark
              ? 'bg-gradient-to-b from-[#292446] to-[#1D1933] border-indigo-400/35'
              : 'bg-gradient-to-b from-white to-slate-200 border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[10px] font-mono-tech uppercase opacity-70">
              3DS / SP DUAL-SCREEN AUDIO
            </span>
            <span className="text-[10px] font-mono-tech text-emerald-400 font-bold">
              ● 3D STEREO
            </span>
          </div>

          <div className="rounded-2xl bg-zinc-950 border-4 border-zinc-800 p-4 text-white space-y-3 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-red-400/60 shrink-0 shadow-lg">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <MarqueeText
                  text={currentTrack?.title || 'Cartucho pronto...'}
                  isPlaying={isPlaying}
                  className="text-base sm:text-lg font-display font-bold text-white"
                />
                <div className="text-xs text-rose-300 truncate">{currentTrack?.artist}</div>
                <AnimatedEqBars
                  isPlaying={isPlaying}
                  bars={14}
                  barClass="bg-gradient-to-t from-red-500 to-amber-300"
                  heightClass="h-6"
                />
              </div>
            </div>

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass="bg-white/15"
              barFillClass="bg-red-500"
              textClass="text-zinc-300"
              compact
            />
          </div>
        </div>

        {/* Center Articulated Hinge */}
        <div className="mx-6 h-4 rounded-full bg-gradient-to-b from-zinc-700 via-zinc-500 to-zinc-800 border border-zinc-400/40 flex items-center justify-between px-6 shadow-md">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400' : 'bg-amber-500'}`} />
          <span className="text-[8px] font-mono-tech text-white/80 tracking-widest">HINGE LOCK</span>
          <span className="w-2 h-2 rounded-full bg-sky-400" />
        </div>

        {/* Bottom Clamshell Deck: Cross D-Pad + Touch HOME Screen + A/B/X/Y */}
        <div
          className={`rounded-t-xl rounded-b-3xl border-4 p-4 sm:p-5 shadow-2xl ${
            isDark
              ? 'bg-gradient-to-b from-[#231F3D] to-[#181529] border-indigo-400/35'
              : 'bg-gradient-to-b from-slate-100 to-slate-300 border-slate-400'
          }`}
        >
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Cross D-Pad */}
            <div className="col-span-3 flex flex-col items-center justify-center gap-1">
              <div className="grid grid-cols-3 gap-0.5 w-20 h-20">
                <div />
                <button
                  type="button"
                  onClick={() => setBottomTab('menu')}
                  aria-label="Cima"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-t text-[10px] font-bold"
                >
                  ▲
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Anterior"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-l text-[10px] font-bold"
                >
                  ◀
                </button>
                <div className="bg-zinc-900 rounded-sm" />
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Próxima"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-r text-[10px] font-bold"
                >
                  ▶
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => setBottomTab('lyrics')}
                  aria-label="Baixo"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-b text-[10px] font-bold"
                >
                  ▼
                </button>
                <div />
              </div>
              <span className="text-[9px] font-mono-tech opacity-65">D-PAD</span>
            </div>

            {/* Bottom Touch Screen (HOME Icon Grid or Synced Lyrics) */}
            <div className="col-span-6 rounded-2xl bg-zinc-950 border-2 border-zinc-700 p-2.5 h-56 flex flex-col overflow-hidden text-white">
              <div className="flex items-center justify-between text-[9px] font-mono-tech border-b border-white/10 pb-1.5 mb-2">
                <span>{bottomTab === 'menu' ? 'HOME MENU' : 'LYRICS VIEW'}</span>
                <button
                  type="button"
                  onClick={() => setBottomTab((t) => (t === 'menu' ? 'lyrics' : 'menu'))}
                  className="text-red-400 underline"
                >
                  {bottomTab === 'menu' ? 'Letras' : 'Home'}
                </button>
              </div>

              {bottomTab === 'lyrics' ? (
                <div className="flex-1 overflow-y-auto thin-scroll">
                  <LyricsPanel variant="dark" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto thin-scroll space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSheet('search')}
                      className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-400/40 flex flex-col items-center gap-0.5 text-[9px]"
                    >
                      <Search className="w-3.5 h-3.5 text-sky-400" />
                      <span>Buscar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheet('ai')}
                      className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex flex-col items-center gap-0.5 text-[9px]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>IA Mix</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUISwitcherOpen(true)}
                      className="p-1.5 rounded-lg bg-red-500/20 border border-red-400/40 flex flex-col items-center gap-0.5 text-[9px]"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-red-400" />
                      <span>UIs</span>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {queue.slice(0, 8).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className={`w-full text-left px-2 py-1 rounded text-[10px] truncate ${
                          currentTrack?.id === t.id
                            ? 'bg-red-500 text-white font-bold'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        ♪ {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* A / B / X / Y Action Buttons */}
            <div className="col-span-3 flex flex-col items-center justify-center gap-2">
              <div className="grid grid-cols-3 gap-1 w-20 h-20 items-center justify-items-center">
                <div />
                <button
                  type="button"
                  onClick={() => setBottomTab((t) => (t === 'menu' ? 'lyrics' : 'menu'))}
                  aria-label="Botão X"
                  className="w-6 h-6 rounded-full bg-sky-500 text-white text-[10px] font-black shadow"
                >
                  X
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => void prevTrack()}
                  aria-label="Botão Y"
                  className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow"
                >
                  Y
                </button>
                <div />
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Botão A Play/Pause"
                  className="w-7 h-7 rounded-full bg-red-500 text-white text-[11px] font-black shadow-md"
                >
                  {isPlaying ? '❚❚' : 'A'}
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => void nextTrack()}
                  aria-label="Botão B Próxima"
                  className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black shadow"
                >
                  B
                </button>
                <div />
              </div>
              {currentTrack && <DownloadButton track={currentTrack} compact />}
            </div>
          </div>

          {/* Bottom L / R / Play / Mic bar */}
          <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-mono-tech">
            <button type="button" onClick={() => void prevTrack()} className="px-3 py-1 rounded-full bg-black/25">
              L ◀ PREV
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-1 rounded-full bg-red-500 text-white font-bold inline-flex items-center gap-1"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button type="button" onClick={() => void nextTrack()} className="px-3 py-1 rounded-full bg-black/25">
              NEXT ▶ R
            </button>
          </div>
        </div>
      </div>

      <ThemedDock
        uiId="retro-dualscreen-3ds-sp"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
