import { Cpu, Layers, Volume2, Wifi, WifiOff } from 'lucide-react';
import { ClickWheel } from '../components/ClickWheel';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { TrackArtwork } from '../components/TrackArtwork';
import { UI_CATALOG } from '../types/music';
import { AnimatedEqBars } from './shared/RetroAnimatedParts';
import { IpodMenuList } from './shared/IpodMenuList';
import { UtilitySheet } from './shared/UtilitySheet';
import { useIpodOS } from './shared/useIpodOS';

export default function IpodAtomicClearUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-transparent-atomic"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
        isDark ? 'bg-[#0F151F] text-amber-100' : 'bg-[#EEF2F7] text-slate-900'
      }`}
    >
      <div className="w-full max-w-sm flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-mono-tech font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
          ATOMIC CLEAR EDITION 2002
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Translucent Polycarbonate Shell */}
      <div
        className={`relative w-full max-w-[380px] rounded-[34px] border-2 p-5 shadow-2xl overflow-hidden flex flex-col items-center gap-6 ${
          isDark
            ? 'bg-slate-800/45 border-slate-400/35'
            : 'bg-white/75 border-slate-300 shadow-[0_20px_50px_rgba(15,23,42,0.12)]'
        }`}
      >
        {/* Internal PCB Copper Trace Decoration */}
        <div
          className={`pointer-events-none absolute inset-0 ${isDark ? 'opacity-25' : 'opacity-20'}`}
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 22% 82%, #f59e0b 2.5px, transparent 2.5px), radial-gradient(circle at 78% 76%, #38bdf8 2.5px, transparent 2.5px), radial-gradient(circle at 16% 14%, #94a3b8 2px, transparent 2px), radial-gradient(circle at 84% 14%, #94a3b8 2px, transparent 2px), linear-gradient(90deg, rgba(148,163,184,0.22) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, 24px 24px',
          }}
        />

        {/* Amber / Daylight LCD Screen */}
        <div
          className={`relative z-10 w-full h-58 rounded-xl border-2 flex flex-col overflow-hidden font-mono-tech ${
            isDark
              ? 'bg-[#2B1B05] border-amber-500/50 text-amber-200 shadow-[inset_0_0_24px_rgba(245,158,11,0.28)]'
              : 'bg-[#FFF9EC] border-amber-400 text-amber-950 shadow-inner'
          }`}
        >
          <div
            className={`h-7 px-3 border-b flex items-center justify-between text-[11px] ${
              isDark
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              {ipod.currentScreen === 'settings' ? 'ATOMIC.CFG' : 'ATOMIC.OS'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={ipod.toggleWheelMode}
                className={`px-1.5 py-0.5 rounded text-[9px] inline-flex items-center gap-1 ${
                  ipod.wheelMode === 'volume'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : isDark
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-amber-200 text-amber-900'
                }`}
              >
                <Volume2 className="w-2.5 h-2.5" /> {Math.round(ipod.volume * 100)}%
              </button>
              {ipod.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-rose-500" />}
            </div>
          </div>

          {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded border border-amber-500/50 sepia opacity-95 overflow-hidden shrink-0">
                  <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{ipod.currentTrack.title}</div>
                  <div className="text-[11px] opacity-75 truncate">{ipod.currentTrack.artist}</div>
                  <div className="mt-1">
                    <DownloadButton track={ipod.currentTrack} compact />
                  </div>
                </div>
              </div>
              <AnimatedEqBars isPlaying={ipod.isPlaying} bars={18} barClass="bg-amber-500" heightClass="h-4" />
              <IsolatedProgress
                trackDuration={ipod.currentTrack.duration}
                barBgClass={isDark ? 'bg-amber-950' : 'bg-amber-200'}
                barFillClass="bg-amber-500"
                textClass={isDark ? 'text-amber-300' : 'text-amber-800'}
              />
            </div>
          ) : ipod.currentScreen === 'lyrics' ? (
            <div className="flex-1 overflow-hidden touch-none select-none p-2.5">
              <LyricsPanel variant={isDark ? 'crt' : 'light'} />
            </div>
          ) : (
            <IpodMenuList
              items={ipod.items}
              selectedIndex={ipod.selectedIndex}
              onSelectItem={(idx, item) => {
                ipod.setSelectedIndex(idx);
                item.action();
              }}
              containerClassName="flex-1 py-1"
              getItemClassName={(active) =>
                `w-full px-3 py-1.5 text-left text-xs flex items-center justify-between ${
                  active
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : isDark
                      ? 'text-amber-200 hover:bg-amber-500/10'
                      : 'text-amber-950 hover:bg-amber-200/50'
                }`
              }
              renderIndicator={(active) => <span>{active ? '◀' : ''}</span>}
            />
          )}
        </div>

        {/* Frosted Translucent Click Wheel */}
        <div className="relative z-10">
          <ClickWheel
            onRotateStep={ipod.handleRotateStep}
            onMenu={ipod.popScreen}
            onSelect={ipod.handleSelect}
            onPlayPause={ipod.togglePlay}
            onNext={() => void ipod.nextTrack()}
            onPrev={() => void ipod.prevTrack()}
            isPlaying={ipod.isPlaying}
            wheelClass={
              isDark
                ? 'bg-slate-400/20 border-2 border-slate-300/35 shadow-inner'
                : 'bg-slate-200/70 border-2 border-slate-300 shadow-inner'
            }
            centerClass={
              isDark
                ? 'bg-amber-500/30 border border-amber-300/50'
                : 'bg-amber-400/40 border border-amber-500/50'
            }
            labelClass={isDark ? 'text-amber-200 hover:text-white' : 'text-slate-700 hover:text-amber-950'}
          />
        </div>
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
