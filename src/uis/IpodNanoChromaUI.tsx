import { Layers, Volume2, Wifi, WifiOff } from 'lucide-react';
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

export default function IpodNanoChromaUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-nano-chroma"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
        isDark ? 'bg-zinc-950 text-white' : 'bg-orange-50 text-zinc-900'
      }`}
    >
      <div className="w-full max-w-xs flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-mono-tech font-bold ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>
          NANO CHROMA 4G
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Tall Anodized Vertical Chassis */}
      <div className="w-full max-w-[308px] rounded-[42px] bg-gradient-to-b from-orange-400 via-orange-600 to-amber-700 p-4 shadow-[0_24px_60px_rgba(249,115,22,0.28),inset_0_2px_0_rgba(255,255,255,0.4)] border border-orange-300/40 flex flex-col items-center gap-5">
        <div className="w-12 h-1 rounded-full bg-zinc-950/35" aria-hidden="true" />

        {/* Tall Vertical Display */}
        <div
          className={`w-full h-76 rounded-2xl border-2 overflow-hidden flex flex-col shadow-inner ${
            isDark ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-orange-800/40 text-zinc-900'
          }`}
        >
          <div
            className={`h-7 px-3 flex items-center justify-between border-b text-[10px] font-mono-tech ${
              isDark
                ? 'border-zinc-800 text-orange-400'
                : 'bg-orange-50 border-orange-200 text-orange-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${ipod.isPlaying ? 'bg-orange-500' : 'bg-zinc-500'}`} />
              {ipod.currentScreen === 'settings' ? 'AJUSTES' : 'CHROMA OS'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={ipod.toggleWheelMode}
                className={`px-1.5 py-0.5 rounded text-[9px] inline-flex items-center gap-1 ${
                  ipod.wheelMode === 'volume'
                    ? 'bg-orange-500 text-zinc-950 font-bold'
                    : isDark
                      ? 'bg-zinc-900 text-orange-300'
                      : 'bg-orange-100 text-orange-800'
                }`}
              >
                <Volume2 className="w-2.5 h-2.5" /> {Math.round(ipod.volume * 100)}%
              </button>
              {ipod.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
            </div>
          </div>

          {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden border border-orange-500/35 shadow-lg">
                <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold truncate">{ipod.currentTrack.title}</div>
                <div className="text-[11px] opacity-65 truncate">{ipod.currentTrack.artist}</div>
              </div>
              <AnimatedEqBars isPlaying={ipod.isPlaying} bars={14} barClass="bg-orange-500" heightClass="h-6" />
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <IsolatedProgress
                    trackDuration={ipod.currentTrack.duration}
                    barBgClass={isDark ? 'bg-zinc-800' : 'bg-orange-100'}
                    barFillClass="bg-orange-500"
                    textClass="opacity-70"
                    compact
                  />
                </div>
                <DownloadButton track={ipod.currentTrack} compact />
              </div>
            </div>
          ) : ipod.currentScreen === 'lyrics' ? (
            <div className="flex-1 overflow-hidden touch-none select-none p-2.5">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          ) : (
            <IpodMenuList
              items={ipod.items}
              selectedIndex={ipod.selectedIndex}
              onSelectItem={(idx, item) => {
                ipod.setSelectedIndex(idx);
                item.action();
              }}
              containerClassName="flex-1 py-1.5"
              getItemClassName={(active) =>
                `w-full px-3 py-2 text-left text-xs flex items-center justify-between ${
                  active
                    ? 'bg-orange-500 text-zinc-950 font-bold'
                    : isDark
                      ? 'text-zinc-200 hover:bg-zinc-900'
                      : 'text-zinc-800 hover:bg-orange-50'
                }`
              }
              renderIndicator={(active) => (active ? <span className="text-[10px]">▸</span> : null)}
            />
          )}
        </div>

        <ClickWheel
          onRotateStep={ipod.handleRotateStep}
          onMenu={ipod.popScreen}
          onSelect={ipod.handleSelect}
          onPlayPause={ipod.togglePlay}
          onNext={() => void ipod.nextTrack()}
          onPrev={() => void ipod.prevTrack()}
          isPlaying={ipod.isPlaying}
          sizeClass="w-48 h-48"
          wheelClass={
            isDark
              ? 'bg-zinc-900/90 border border-orange-300/25 shadow-lg'
              : 'bg-white/95 border border-orange-200 shadow-lg'
          }
          centerClass="bg-gradient-to-b from-orange-400 to-orange-600 border border-orange-200/50"
          labelClass={isDark ? 'text-orange-200 hover:text-white' : 'text-orange-700 hover:text-orange-950'}
        />
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
