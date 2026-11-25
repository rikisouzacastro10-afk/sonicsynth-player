import { useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { AnimatedEqBars, ArtworkAura } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernKineticPosterUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);

  const surface = isDark ? 'bg-[#121215] border-zinc-700' : 'bg-white border-zinc-900';

  return (
    <div
      data-ui-id="modern-kinetic-poster"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col justify-between gap-6 transition-colors ${
        isDark ? 'bg-[#09090B] text-stone-100' : 'bg-[#F5F5F4] text-zinc-950'
      }`}
    >
      {/* Swiss Header Strip */}
      <header className="max-w-6xl w-full mx-auto flex items-baseline justify-between gap-3 border-b-4 border-[#E11D48] pb-3">
        <div className="flex items-baseline gap-3">
          <span className="font-condensed font-black text-3xl tracking-tighter uppercase">BASEL.08</span>
          <span className="text-xs font-mono-tech uppercase text-[#E11D48] font-bold">KINETIC AUDIO</span>
        </div>
        <span className="text-[11px] font-mono-tech uppercase opacity-65">
          SWISS GRID · {queue.length} TRACKS
        </span>
      </header>

      {/* Diagonal Swiss Grid Poster Composition */}
      <main className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={`lg:col-span-7 border p-6 sm:p-8 space-y-6 ${surface}`}>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Tilted Artwork Frame (GPU transform) */}
            <div className="relative shrink-0">
              <ArtworkAura
                isPlaying={isPlaying}
                gradientClass="from-[#E11D48]/45 via-rose-400/20 to-amber-400/35"
                roundedClass="rounded-none"
              />
              <div
                className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-[#E11D48] overflow-hidden shadow-xl transition-transform duration-500"
                style={{ transform: isPlaying ? 'rotate(-2deg) scale(1.02)' : 'rotate(0deg)' }}
              >
                <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2 w-full">
              <div className="text-xs font-mono-tech uppercase tracking-widest text-[#E11D48] font-bold">
                EM ROTAÇÃO · {currentTrack?.source?.toUpperCase() || 'STEREO'}
              </div>
              <MarqueeText
                text={currentTrack?.title || 'SWISS POSTER'}
                isPlaying={isPlaying}
                className="font-condensed font-black text-3xl sm:text-4xl uppercase leading-tight"
              />
              <p className="text-sm font-bold uppercase opacity-70 truncate">
                {currentTrack?.artist || 'Aguardando faixa'}
              </p>
              <div className="pt-2">
                {currentTrack && <DownloadButton track={currentTrack} />}
              </div>
            </div>
          </div>

          <AnimatedEqBars isPlaying={isPlaying} bars={24} barClass="bg-[#E11D48]" heightClass="h-6" />

          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
            barFillClass="bg-[#E11D48]"
            textClass={isDark ? 'text-zinc-300' : 'text-zinc-700'}
          />

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-14 h-14 border flex items-center justify-center ${surface}`}>
              <SkipBack className="w-5 h-5" />
            </button>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="flex-1 h-14 bg-[#E11D48] hover:bg-rose-500 text-white font-condensed font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 transition-transform active:scale-[0.99]">
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              <span>{isPlaying ? 'PAUSA' : 'TOCAR'}</span>
            </button>
            <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-14 h-14 border flex items-center justify-center ${surface}`}>
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Ledger + Lyrics */}
        <div className="lg:col-span-5 space-y-5">
          <div className={`border p-5 h-64 flex flex-col ${surface}`}>
            <div className="text-xs font-condensed font-black uppercase tracking-widest text-[#E11D48] mb-2">
              PROGRAMA / FILA ({queue.length})
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-current/10 thin-scroll">
              {queue.map((t, idx) => {
                const active = currentTrack?.id === t.id;
                return (
                  <div key={t.id} className="py-2 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => void playTrack(t, queue)} className={`text-left flex-1 min-w-0 flex items-center gap-2 ${active ? 'text-[#E11D48] font-bold' : ''}`}>
                      <span className="font-mono-tech text-xs opacity-50 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-xs font-bold uppercase truncate flex-1">{t.title}</span>
                      <span className="font-mono-tech text-[11px] opacity-55 tabular-nums">{formatDuration(t.duration)}</span>
                    </button>
                    <DownloadButton track={t} compact />
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`border p-5 h-60 flex flex-col ${surface}`}>
            <div className="text-xs font-condensed font-black uppercase tracking-widest text-[#E11D48] mb-2">
              TEXTO SINCRONIZADO
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </main>

      <ThemedDock
        uiId="modern-kinetic-poster"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
