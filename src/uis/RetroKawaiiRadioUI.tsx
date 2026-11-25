import { useState } from 'react';
import { Music, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
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
  FloatingKawaiiDecor,
  LedPeakMeter,
} from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroKawaiiRadioUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [rightTab, setRightTab] = useState<'queue' | 'lyrics'>('queue');
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-kawaii-bento-radio"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#121710] text-[#E6EFE2]' : 'bg-[#EFEAD8] text-[#3F4A3C]'
      }`}
    >
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 mb-4 px-2">
        <span className={`font-serif-editorial italic text-lg font-bold ${isDark ? 'text-lime-400' : 'text-[#52734D]'}`}>
          Matcha Cozy Radio ♪
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono-tech opacity-75 hidden sm:inline">FM 88.5 · COZY LO-FI</span>
          <FloatingKawaiiDecor isPlaying={isPlaying} accentClass={isDark ? 'text-lime-400' : 'text-[#65A30D]'} />
        </div>
      </div>

      {/* Matcha & Buttercream / Dark Matcha Forest Radio */}
      <div
        className={`w-full max-w-4xl rounded-[36px] border-4 shadow-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative ${
          isDark
            ? 'bg-gradient-to-b from-[#243020] to-[#1A2317] border-[#4A5E42]'
            : 'bg-gradient-to-b from-[#DDE8CE] to-[#C8DBB8] border-[#FFFDF7]'
        }`}
      >
        <div
          className={`hidden sm:flex absolute -top-3 right-12 w-10 h-14 rounded-b-2xl bg-[#FFD6E0] border-2 border-white shadow items-center justify-center anim-charm-sway ${
            !isPlaying ? 'anim-paused' : ''
          }`}
          aria-hidden="true"
        >
          <Music className="w-4 h-4 text-pink-600" />
        </div>

        <div
          className={`lg:col-span-6 rounded-3xl border-2 p-5 flex flex-col justify-between gap-4 shadow-inner ${
            isDark ? 'bg-[#141A12] border-[#3F5138] text-[#E6EFE2]' : 'bg-[#FFFDF7] border-[#B4C6A6] text-[#3F4A3C]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-lime-500/40 via-emerald-400/20 to-amber-300/35"
                roundedClass="rounded-2xl"
              />
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-lime-500/50">
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <MarqueeText
                text={currentTrack?.title || 'Carregando...'}
                isPlaying={isPlaying}
                className="font-serif-editorial text-base font-bold"
              />
              <div className="text-xs opacity-70 truncate">{currentTrack?.artist}</div>
            </div>
            {currentTrack && <DownloadButton track={currentTrack} compact />}
          </div>

          <div
            className={`rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 ${
              isDark ? 'bg-[#1D251A] border-[#3F5138]' : 'bg-[#F5F0E1] border-[#D4CBB3]'
            }`}
          >
            <CassetteReel isPlaying={isPlaying} light={!isDark} />
            <div className="flex-1 text-center space-y-1.5">
              <div className={`text-[11px] font-bold ${isDark ? 'text-lime-400' : 'text-[#52734D]'}`}>
                ★ MATCHA TAPE ★
              </div>
              <AnimatedEqBars
                isPlaying={isPlaying}
                bars={10}
                barClass={isDark ? 'bg-lime-400' : 'bg-[#65A30D]'}
                heightClass="h-6"
              />
            </div>
            <CassetteReel isPlaying={isPlaying} light={!isDark} />
          </div>

          <LedPeakMeter isPlaying={isPlaying} label="CHILL" isDark={isDark} />

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-[#263322]' : 'bg-[#E6EAD8]'}
            barFillClass="bg-[#65A30D]"
            textClass={isDark ? 'text-lime-300' : 'text-[#52734D]'}
          />

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => void prevTrack()}
              aria-label="Anterior"
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                isDark ? 'bg-[#222C1F] border-[#4A5E42] hover:bg-[#2B3727]' : 'bg-[#F5F0E1] border-[#C8DBB8] hover:bg-white'
              }`}
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Tocar'}
              className="w-14 h-14 rounded-2xl bg-[#65A30D] text-white shadow-md flex items-center justify-center hover:opacity-90"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Próxima"
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                isDark ? 'bg-[#222C1F] border-[#4A5E42] hover:bg-[#2B3727]' : 'bg-[#F5F0E1] border-[#C8DBB8] hover:bg-white'
              }`}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className={`lg:col-span-6 rounded-3xl border-2 p-4 flex flex-col h-[410px] ${
            isDark ? 'bg-[#141A12] border-[#3F5138]' : 'bg-[#FFFDF7] border-[#B4C6A6]'
          }`}
        >
          <div className="flex items-center gap-2 pb-2.5 border-b border-current/15 mb-2.5">
            <button
              type="button"
              onClick={() => setRightTab('queue')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                rightTab === 'queue' ? 'bg-[#65A30D] text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Músicas ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setRightTab('lyrics')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                rightTab === 'lyrics' ? 'bg-[#65A30D] text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Letrinhas
            </button>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll">
            {rightTab === 'lyrics' ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-2 p-2 rounded-2xl ${
                      currentTrack?.id === t.id
                        ? isDark
                          ? 'bg-[#2B3D24] border border-lime-500/40'
                          : 'bg-[#E9F3DC] border border-[#65A30D]/40'
                        : 'hover:bg-current/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void playTrack(t, queue)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                        <TrackArtwork src={t.artwork} alt={t.title} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{t.title}</div>
                        <div className="text-[11px] opacity-65 truncate">{t.artist}</div>
                      </div>
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
        uiId="retro-kawaii-bento-radio"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
