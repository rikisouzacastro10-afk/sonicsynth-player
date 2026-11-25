import { useState } from 'react';
import { Mic2, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernSpatialGlassUI() {
  const currentTrack = useAppStore((s) => s.currentTrack);
  const queue = useAppStore((s) => s.queue);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const themeMode = useAppStore((s) => s.themeMode);
  const isDark = themeMode === 'dark';

  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const playTrack = useAppStore((s) => s.playTrack);

  const [sheet, setSheet] = useState<UtilitySheetType>(null);
  const [drawerTab, setDrawerTab] = useState<'lyrics' | 'queue'>('lyrics');

  const panelSurface = isDark
    ? 'bg-slate-900/75 border-white/15 text-slate-100 backdrop-blur-xl'
    : 'bg-white/85 border-slate-300/80 text-slate-900 backdrop-blur-xl';

  const dockSurface = isDark
    ? 'bg-slate-950/85 border-white/15 text-white'
    : 'bg-white/95 border-slate-300 text-slate-900';

  return (
    <div
      data-ui-id="modern-spatial-glass"
      className={`min-h-screen w-full p-4 sm:p-8 pb-28 sm:pb-28 flex flex-col justify-between gap-4 transition-colors ${
        isDark
          ? 'bg-gradient-to-br from-[#08101E] via-[#0E182B] to-[#0A1320] text-slate-100'
          : 'bg-gradient-to-br from-[#E2ECF9] via-[#F2F6FC] to-[#DDE8F8] text-slate-900'
      }`}
    >
      {/* Floating Spatial Header Pill */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-3">
        <div className={`px-4 py-2 rounded-2xl border shadow-lg flex items-center gap-2.5 ${panelSurface}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-400'}`} />
          <span className="font-display font-bold text-sm tracking-tight">Spatial Horizon OS</span>
        </div>

        <div className={`px-3.5 py-2 rounded-2xl border shadow-lg text-[11px] font-mono-tech ${panelSurface}`}>
          AUDIO ENGINE · {isPlaying ? 'ACTIVE' : 'IDLE'}
        </div>
      </header>

      {/* Suspended Spatial Window */}
      <main className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section className={`lg:col-span-6 rounded-3xl border p-6 shadow-2xl flex flex-col justify-between gap-4 ${panelSurface}`}>
          <div className="flex items-center justify-between text-xs font-mono-tech opacity-70">
            <span>JANELA ESPACIAL</span>
            <span>{currentTrack?.source?.toUpperCase() || 'STREAM'}</span>
          </div>

          <div className="relative max-w-[230px] w-full mx-auto">
            <ArtworkAura
              isPlaying={isPlaying}
              gradientClass="from-cyan-400/45 via-sky-500/20 to-indigo-500/40"
              roundedClass="rounded-3xl"
            />
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/25">
              <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Capa'} />
            </div>
          </div>

          <AnimatedEqBars isPlaying={isPlaying} bars={18} barClass="bg-cyan-400" heightClass="h-5" />
          <LedPeakMeter isPlaying={isPlaying} label="FX" isDark={isDark} />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <MarqueeText
                text={currentTrack?.title || 'Spatial Horizon'}
                isPlaying={isPlaying}
                className="font-display text-2xl font-bold"
              />
              <p className="text-sm opacity-70 truncate">
                {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'Pronto para reproduzir'}
              </p>
            </div>
            {currentTrack && <DownloadButton track={currentTrack} />}
          </div>
        </section>

        <section className={`lg:col-span-6 rounded-3xl border p-6 shadow-2xl flex flex-col h-[420px] ${panelSurface}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerTab('lyrics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${
                  drawerTab === 'lyrics' ? 'bg-cyan-500 text-slate-950' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Mic2 className="w-3.5 h-3.5" /> Letras
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('queue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  drawerTab === 'queue' ? 'bg-cyan-500 text-slate-950' : 'opacity-70 hover:opacity-100'
                }`}
              >
                Fila ({queue.length})
              </button>
            </div>
            <div className="flex items-center gap-2 w-28">
              <Volume2 className="w-3.5 h-3.5 opacity-65 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll">
            {drawerTab === 'lyrics' ? (
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            ) : (
              <div className="space-y-1.5">
                {queue.map((t) => {
                  const active = currentTrack?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-xl transition-colors ${
                        active ? 'bg-cyan-500/20 border border-cyan-500/40' : 'hover:bg-cyan-500/10'
                      }`}
                    >
                      <button type="button" onClick={() => void playTrack(t, queue)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <TrackArtwork src={t.artwork} alt={t.title} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{t.title}</div>
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
        </section>
      </main>

      {/* Spatial Transport Bar */}
      <footer className={`max-w-3xl w-full mx-auto rounded-3xl border px-5 py-3 shadow-2xl flex flex-col sm:flex-row items-center gap-4 ${dockSurface}`}>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className="w-10 h-10 rounded-full hover:bg-cyan-500/15 flex items-center justify-center">
            <SkipBack className="w-4 h-4" />
          </button>
          <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg">
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className="w-10 h-10 rounded-full hover:bg-cyan-500/15 flex items-center justify-center">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full flex-1">
          <IsolatedProgress
            trackDuration={currentTrack?.duration}
            barBgClass={isDark ? 'bg-slate-800' : 'bg-slate-200'}
            barFillClass="bg-cyan-500"
            textClass={isDark ? 'text-slate-300' : 'text-slate-600'}
          />
        </div>
      </footer>

      <ThemedDock
        uiId="modern-spatial-glass"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
