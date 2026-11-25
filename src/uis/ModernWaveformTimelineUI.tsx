import { useMemo, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { MarqueeText } from '../components/MarqueeText';
import { ThemedDock } from '../components/ThemedDock';
import { TrackArtwork } from '../components/TrackArtwork';
import { useAppStore } from '../stores/useAppStore';
import { formatDuration } from '../utils/formatters';
import { AnimatedEqBars, ArtworkAura, LedPeakMeter } from './shared/RetroAnimatedParts';
import { UtilitySheet, type UtilitySheetType } from './shared/UtilitySheet';

export default function ModernWaveformTimelineUI() {
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

  const rulerMarks = useMemo(() => ['00:00', '00:45', '01:30', '02:15', '03:00', '03:45'], []);

  const panelClass = isDark
    ? 'bg-[#161C1B] border-emerald-950/80 text-emerald-50'
    : 'bg-white border-zinc-200 text-zinc-900 shadow-sm';

  const laneBtn = isDark
    ? 'bg-[#1D2523] border-emerald-900/60 hover:bg-[#232D2A]'
    : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200';

  return (
    <div
      data-ui-id="modern-waveform-timeline"
      className={`min-h-screen w-full p-4 sm:p-6 pb-28 sm:pb-28 flex flex-col gap-4 transition-colors ${
        isDark ? 'bg-[#0E1212] text-emerald-50' : 'bg-[#EEF2F0] text-zinc-900'
      }`}
    >
      {/* Top DAW Transport Bar */}
      <header className={`max-w-7xl w-full mx-auto rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${panelClass}`}>
        <div className="flex items-center gap-3">
          <span className="font-mono-tech text-xs font-bold uppercase tracking-wider text-emerald-500">
            DAW MASTER STUDIO
          </span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => void prevTrack()} aria-label="Anterior" className={`w-9 h-9 rounded-lg border flex items-center justify-center ${laneBtn}`}>
              <SkipBack className="w-4 h-4" />
            </button>
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Tocar'} className="w-11 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center font-bold">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button type="button" onClick={() => void nextTrack()} aria-label="Próxima" className={`w-9 h-9 rounded-lg border flex items-center justify-center ${laneBtn}`}>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono-tech opacity-75">
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">44.1 kHz</span>
          <span>24-BIT BUS</span>
        </div>
      </header>

      {/* Main Multitrack Grid */}
      <main className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Waveform Master Bus & Lyrics */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className={`rounded-xl border p-5 space-y-4 ${panelClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <ArtworkAura
                    isPlaying={isPlaying}
                    gradientClass="from-emerald-500/40 via-teal-400/20 to-lime-400/35"
                    roundedClass="rounded-lg"
                  />
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/40">
                    <TrackArtwork src={currentTrack?.artwork} alt={currentTrack?.title || 'Track'} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-mono-tech text-emerald-500 uppercase">
                    MASTER BUS · {currentTrack?.source?.toUpperCase() || 'AUDIO'}
                  </div>
                  <MarqueeText
                    text={currentTrack?.title || 'Aguardando faixa...'}
                    isPlaying={isPlaying}
                    className="font-display text-xl font-bold"
                  />
                  <p className="text-xs opacity-70 truncate">
                    {currentTrack ? `${currentTrack.artist} · ${currentTrack.album}` : 'DAW Timeline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 w-28">
                  <Volume2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Fader Master"
                    className="w-full accent-emerald-500"
                  />
                </div>
                {currentTrack && <DownloadButton track={currentTrack} />}
              </div>
            </div>

            {/* Ruler */}
            <div className="flex justify-between text-[10px] font-mono-tech opacity-50 border-b border-current/15 pb-1 tabular-nums">
              {rulerMarks.map((mark) => (
                <span key={mark}>{mark}</span>
              ))}
            </div>

            {/* Waveform Bars Lane */}
            <div className={`rounded-lg p-3 border space-y-2 ${isDark ? 'bg-[#0A0E0D] border-emerald-950' : 'bg-zinc-100 border-zinc-200'}`}>
              <AnimatedEqBars isPlaying={isPlaying} bars={36} barClass="bg-emerald-500" heightClass="h-24" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <LedPeakMeter isPlaying={isPlaying} label="L-OUT" isDark={isDark} />
                <LedPeakMeter isPlaying={isPlaying} label="R-OUT" isDark={isDark} />
              </div>
            </div>

            <IsolatedProgress
              trackDuration={currentTrack?.duration}
              barBgClass={isDark ? 'bg-emerald-950' : 'bg-zinc-200'}
              barFillClass="bg-emerald-500"
              textClass={isDark ? 'text-emerald-300' : 'text-emerald-800'}
            />
          </div>

          <div className={`rounded-xl border p-5 flex-1 flex flex-col min-h-[240px] ${panelClass}`}>
            <div className="text-xs font-mono-tech text-emerald-500 mb-2">VOCAL / LYRIC TRACK</div>
            <div className="flex-1 max-h-60 overflow-y-auto thin-scroll">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          </div>
        </div>

        {/* Right: Channel Rack / Track Queue */}
        <aside className={`lg:col-span-4 rounded-xl border p-4 flex flex-col ${panelClass}`}>
          <div className="flex items-center justify-between border-b border-current/15 pb-3 mb-3">
            <span className="text-xs font-mono-tech font-bold text-emerald-500">CLIP BROWSER ({queue.length})</span>
            <span className="text-[10px] font-mono-tech opacity-55">44.1 kHz</span>
          </div>
          <div className="flex-1 max-h-[480px] overflow-y-auto space-y-1.5 thin-scroll">
            {queue.map((t, i) => {
              const active = currentTrack?.id === t.id;
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-colors ${
                    active ? 'border-emerald-500 bg-emerald-500/15' : 'border-transparent hover:bg-emerald-500/10'
                  }`}
                >
                  <button type="button" onClick={() => void playTrack(t, queue)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                    <span className="text-[11px] font-mono-tech opacity-50 w-5 tabular-nums">{i + 1}</span>
                    <div className="w-9 h-9 rounded overflow-hidden shrink-0">
                      <TrackArtwork src={t.artwork} alt={t.title} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{t.title}</div>
                      <div className="text-[11px] opacity-60 truncate">{t.artist}</div>
                    </div>
                    <span className="text-[10px] font-mono-tech opacity-55 tabular-nums">{formatDuration(t.duration)}</span>
                  </button>
                  <DownloadButton track={t} compact />
                </div>
              );
            })}
          </div>
        </aside>
      </main>

      <ThemedDock
        uiId="modern-waveform-timeline"
        activeTab={sheet || 'home'}
        onSelectTab={(tab) => setSheet(tab === 'home' ? null : tab)}
      />
      <UtilitySheet sheet={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
