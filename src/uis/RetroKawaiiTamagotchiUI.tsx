import { useState } from 'react';
import { Heart, Mic2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
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
  FloatingKawaiiDecor,
  KawaiiBuddySvg,
} from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function RetroKawaiiTamagotchiUI() {
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [screenMode, setScreenMode] = useState<'pet' | 'lyrics' | 'queue'>('pet');
  const isDark = themeMode === 'dark';

  const circleBtn = isDark
    ? 'bg-[#2C1524] border-2 border-pink-500/40 text-pink-300'
    : 'bg-white border-2 border-pink-200 text-pink-600';

  return (
    <div
      data-ui-id="retro-kawaii-tamagotchi"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 pb-28 sm:pb-28 transition-colors ${
        isDark
          ? 'bg-gradient-to-br from-[#1C0D17] via-[#271120] to-[#170913] text-pink-100'
          : 'bg-gradient-to-br from-[#FFE4EC] via-[#FFF0F6] to-[#FCE7F3] text-pink-950'
      }`}
    >
      <div className="w-full max-w-md flex items-center justify-between gap-2 mb-4 px-2">
        <span className={`font-display font-extrabold text-sm flex items-center gap-1.5 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
          <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> TamaBeats Pocket
        </span>
        <FloatingKawaiiDecor isPlaying={isPlaying} accentClass={isDark ? 'text-pink-300' : 'text-pink-500'} />
      </div>

      {/* Egg-Shaped Pastel / Midnight Berry Console */}
      <div
        className={`w-full max-w-[400px] rounded-[72px] border-4 p-6 sm:p-7 flex flex-col items-center gap-4 relative ${
          isDark
            ? 'bg-gradient-to-b from-[#3E1A31] via-[#2F1224] to-[#220B1A] border-pink-400/35 shadow-[0_24px_60px_rgba(236,72,153,0.22)]'
            : 'bg-gradient-to-b from-[#FFC2D4] via-[#FFB3C6] to-[#FF8FAB] border-white shadow-[0_24px_60px_rgba(244,114,182,0.35)]'
        }`}
      >
        {/* Top Ballchain Loop */}
        <div
          className="w-8 h-3 rounded-full border-2 border-white/80 bg-pink-300/60 -mt-2"
          aria-hidden="true"
        />

        <div className="flex items-center gap-2">
          {[
            { id: 'pet', label: 'Pet & Capa' },
            { id: 'lyrics', label: 'Letras' },
            { id: 'queue', label: `Lista (${queue.length})` },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setScreenMode(m.id as 'pet' | 'lyrics' | 'queue')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                screenMode === m.id ? 'bg-white text-pink-600 shadow' : 'bg-pink-500/45 text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div
          className={`w-full h-64 rounded-3xl border-4 shadow-inner p-3.5 flex flex-col justify-between overflow-hidden ${
            isDark ? 'bg-[#170912] border-pink-500/40 text-pink-100' : 'bg-[#FFFDF7] border-pink-400/60 text-pink-950'
          }`}
        >
          {screenMode === 'pet' ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <ArtworkAura
                      isPlaying={isPlaying}
                      gradientClass="from-pink-500/45 via-rose-400/25 to-amber-300/35"
                      roundedClass="rounded-2xl"
                    />
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-pink-400/70">
                      <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <MarqueeText
                      text={currentTrack?.title || 'Carregando...'}
                      isPlaying={isPlaying}
                      className="text-xs font-extrabold"
                    />
                    <div className={`text-[11px] truncate ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                      {currentTrack?.artist}
                    </div>
                  </div>
                </div>
                {currentTrack && <DownloadButton track={currentTrack} compact />}
              </div>

              <div className="flex items-center justify-around py-1">
                <KawaiiBuddySvg isPlaying={isPlaying} variant="bunny" />
                <div className="w-28 space-y-1.5">
                  <div className="text-[10px] font-bold text-pink-400 text-center">
                    {isPlaying ? '♪ Feliz ouvindo! ♪' : 'Zzz... em pausa'}
                  </div>
                  <AnimatedEqBars isPlaying={isPlaying} bars={8} barClass="bg-pink-400" heightClass="h-8" />
                </div>
              </div>

              <IsolatedProgress
                trackDuration={currentTrack?.duration}
                barBgClass={isDark ? 'bg-pink-950' : 'bg-pink-200'}
                barFillClass="bg-pink-500"
                textClass={isDark ? 'text-pink-300' : 'text-pink-700'}
              />
            </>
          ) : screenMode === 'lyrics' ? (
            <div className="flex-1 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-1 thin-scroll">
              {queue.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    void playTrack(t, queue);
                    setScreenMode('pet');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex justify-between ${
                    currentTrack?.id === t.id
                      ? 'bg-pink-500 text-white'
                      : isDark
                        ? 'hover:bg-pink-900/40 text-pink-100'
                        : 'hover:bg-pink-100 text-pink-900'
                  }`}
                >
                  <span className="truncate">{t.title}</span>
                  <span className="opacity-70 ml-2 shrink-0">{t.artist}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void prevTrack()}
              aria-label="Anterior"
              className={`w-11 h-11 rounded-2xl shadow active:translate-y-0.5 flex items-center justify-center ${circleBtn}`}
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => void nextTrack()}
              aria-label="Próxima"
              className={`w-11 h-11 rounded-2xl shadow active:translate-y-0.5 flex items-center justify-center ${circleBtn}`}
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            className="w-16 h-16 rounded-full bg-white border-4 border-pink-400 text-pink-600 shadow-lg active:scale-95 transition-transform flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setScreenMode((m) => (m === 'lyrics' ? 'pet' : 'lyrics'))}
            aria-label="Letras"
            className="w-11 h-11 rounded-full bg-amber-200 border-2 border-white text-pink-700 shadow active:translate-y-0.5 flex items-center justify-center"
          >
            <Mic2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ThemedDock
        uiId="retro-kawaii-tamagotchi"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
