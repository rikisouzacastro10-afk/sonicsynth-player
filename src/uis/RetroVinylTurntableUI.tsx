import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import {
  AnalogVuMeter,
  ArtworkAura,
  LedPeakMeter,
  VinylPlatterWithGrooves,
} from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroVinylTurntableUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [rightTab, setRightTab] = useState<'crate' | 'lyrics'>('crate');
  const isDark = themeMode === 'dark';

  return (
    <div
      data-ui-id="retro-vinyl-turntable"
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark ? 'bg-[#16110D] text-[#F2E9DF]' : 'bg-[#F5EFE6] text-[#2D1F14]'
      }`}
    >
      <header className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-current/15">
        <div className={`font-serif-editorial text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
          Walnut Hi-Fi Turntable
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono-tech uppercase opacity-75">
          <span
            className={`px-2 py-0.5 rounded border ${
              isDark ? 'border-amber-600/40 bg-amber-950/40' : 'border-amber-800/25 bg-white/70'
            }`}
          >
            PHONO STAGE · MM CARTRIDGE
          </span>
          <span className="hidden sm:inline">QUARTZ LOCK 33⅓</span>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto my-auto py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Turntable Plinth */}
        <div
          className={`lg:col-span-7 rounded-2xl border-2 p-6 shadow-2xl relative ${
            isDark
              ? 'bg-gradient-to-br from-[#4A2E1B] via-[#3A2314] to-[#26160C] border-amber-600/35'
              : 'bg-gradient-to-br from-[#E4CDB2] via-[#D6B896] to-[#C29B72] border-amber-800/30'
          }`}
        >
          {/* Brass Plinth Corner Feet / Screws */}
          <span className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-amber-500/70 border border-amber-900/50" aria-hidden="true" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500/70 border border-amber-900/50" aria-hidden="true" />
          <span className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-amber-500/70 border border-amber-900/50" aria-hidden="true" />
          <span className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500/70 border border-amber-900/50" aria-hidden="true" />

          <div
            className={`flex items-center justify-between text-[10px] font-mono-tech mb-1 ${
              isDark ? 'text-amber-300/80' : 'text-amber-950/75'
            }`}
          >
            <span>DIRECT DRIVE QUARTZ LOCK</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-zinc-600'
                }`}
              />
              33⅓ RPM · STROBE
            </span>
          </div>

          <div className="relative flex items-center justify-center py-4">
            <div className="relative">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-amber-500/35 via-orange-400/20 to-amber-300/35"
                roundedClass="rounded-full"
              />
              <VinylPlatterWithGrooves
                isPlaying={isPlaying}
                artwork={currentTrack?.artwork}
                title={currentTrack?.title}
                sizeClass="w-60 h-60 sm:w-76 sm:h-76"
              />
            </div>

            {/* Articulated Tonearm */}
            <div
              className="hidden sm:block absolute right-5 top-5 origin-top-right transition-transform duration-700 ease-out pointer-events-none"
              style={{ transform: isPlaying ? 'rotate(24deg)' : 'rotate(2deg)' }}
              aria-hidden="true"
            >
              <div className="w-10 h-10 rounded-full bg-amber-300/80 border-2 border-amber-700 shadow-lg flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-zinc-800" />
              </div>
              <div className="w-1.5 h-44 bg-gradient-to-b from-zinc-300 to-zinc-500 mx-auto -mt-2 rounded-full shadow" />
              <div className="w-5 h-8 bg-zinc-800 border border-amber-400/60 mx-auto rounded-sm" />
            </div>
          </div>

          <div className="mt-3 pt-4 border-t border-current/15 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <MarqueeText
                  text={currentTrack?.title || 'Carregando disco...'}
                  isPlaying={isPlaying}
                  className="font-serif-editorial text-xl font-bold"
                />
                <p className="text-sm opacity-75 truncate">
                  {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'Selecione uma música na estante'}
                </p>
              </div>
              {currentTrack && <DownloadButton track={currentTrack} />}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <AnalogVuMeter isPlaying={isPlaying} label="PHONO L" />
              <AnalogVuMeter isPlaying={isPlaying} label="PHONO R" altNeedle />
            </div>

            <LedPeakMeter isPlaying={isPlaying} label="PRE" isDark={isDark} />

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass={isDark ? 'bg-black/40' : 'bg-amber-950/20'}
              barFillClass="bg-amber-500"
              textClass="opacity-80"
            />

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => void prevTrack()}
                aria-label="Anterior"
                className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                  isDark
                    ? 'bg-amber-950 border-amber-500/40 hover:bg-amber-900'
                    : 'bg-white border-amber-700/30 hover:bg-amber-50'
                }`}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Tocar'}
                className="w-14 h-14 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg hover:bg-amber-300"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Próxima"
                className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                  isDark
                    ? 'bg-amber-950 border-amber-500/40 hover:bg-amber-900'
                    : 'bg-white border-amber-700/30 hover:bg-amber-50'
                }`}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Vinyl Crate / Lyrics */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-5 flex flex-col h-[520px] ${
            isDark ? 'bg-[#201914] border-amber-200/15' : 'bg-white border-amber-900/15 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-current/10 mb-3">
            <button
              type="button"
              onClick={() => setRightTab('crate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] ${
                rightTab === 'crate' ? 'bg-amber-500 text-zinc-950' : 'opacity-70 hover:opacity-100'
              }`}
            >
              LPs na Estante ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setRightTab('lyrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[36px] ${
                rightTab === 'lyrics' ? 'bg-amber-500 text-zinc-950' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Encarte & Letras
            </button>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll">
            {rightTab === 'lyrics' ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-2">
                {queue.map((t) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
                        active ? 'border-amber-500 bg-amber-500/10' : 'border-current/10 hover:bg-current/5'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void playTrack(t, queue)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left min-h-[44px]"
                      >
                        <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                          <TrackArtwork src={t.artwork} alt={t.title} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">{t.title}</div>
                          <div className="text-xs opacity-65 truncate">{t.artist}</div>
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
      </main>

      <ThemedDock
        uiId="retro-vinyl-turntable"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
