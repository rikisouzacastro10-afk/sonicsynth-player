import { BatteryCharging, Layers, Volume2, Wifi, WifiOff } from 'lucide-react';
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

export default function IpodCyberStealthUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-cyber-u2-stealth"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors ${
        isDark ? 'bg-[#070709] text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      <div className="w-full max-w-sm flex items-center justify-between mb-3 gap-2">
        <span className="text-xs font-mono-tech tracking-widest text-red-600 dark:text-red-500 font-bold">
          STEALTH CARBON OS
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Carbon / Matte Ceramic Chassis */}
      <div
        className={`w-full max-w-[390px] rounded-[36px] border-2 p-5 flex flex-col items-center gap-6 ${
          isDark
            ? 'border-zinc-700/80 shadow-[0_25px_70px_rgba(220,38,38,0.18)]'
            : 'border-zinc-300 shadow-[0_25px_60px_rgba(0,0,0,0.12)]'
        }`}
        style={{
          backgroundColor: isDark ? '#111216' : '#F4F4F5',
          backgroundImage: isDark
            ? 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.03) 75%)'
            : 'linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%), linear-gradient(-45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%)',
          backgroundSize: '12px 12px',
        }}
      >
        <div
          className={`w-full h-60 rounded-xl border-2 shadow-inner flex flex-col overflow-hidden ${
            isDark ? 'bg-black border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
          }`}
        >
          <div
            className={`h-7 px-3 border-b flex items-center justify-between text-[10px] font-mono-tech ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <span className="text-red-500 font-bold">
              {ipod.currentScreen === 'settings' ? 'AJUSTES' : 'CARBON.OS'} // {ipod.wheelMode === 'volume' ? 'VOL' : 'NAV'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={ipod.toggleWheelMode}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1 ${
                  ipod.wheelMode === 'volume'
                    ? 'bg-red-600 text-white'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                <Volume2 className="w-2.5 h-2.5" />
                {Math.round(ipod.volume * 100)}%
              </button>
              {ipod.isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
              <BatteryCharging className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>

          {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-red-500/40 shrink-0">
                  <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-bold truncate">{ipod.currentTrack.title}</div>
                  <div className="text-xs text-red-500 truncate">{ipod.currentTrack.artist}</div>
                  <AnimatedEqBars isPlaying={ipod.isPlaying} bars={12} barClass="bg-red-500" heightClass="h-4 mt-1" />
                </div>
                <DownloadButton track={ipod.currentTrack} compact />
              </div>
              <IsolatedProgress
                trackDuration={ipod.currentTrack.duration}
                barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-200'}
                barFillClass="bg-red-600"
                textClass={isDark ? 'text-zinc-400' : 'text-zinc-600'}
              />
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
              containerClassName="flex-1 py-1"
              getItemClassName={(active) =>
                `w-full px-3 py-1.5 text-left text-xs font-mono-tech flex items-center justify-between ${
                  active
                    ? 'bg-red-600 text-white font-bold'
                    : isDark
                      ? 'text-zinc-300 hover:bg-zinc-900'
                      : 'text-zinc-800 hover:bg-zinc-100'
                }`
              }
              renderIndicator={(active) => (active ? <span className="text-[10px]">▸</span> : null)}
            />
          )}
        </div>

        {/* Crimson Red Click Wheel */}
        <ClickWheel
          onRotateStep={ipod.handleRotateStep}
          onMenu={ipod.popScreen}
          onSelect={ipod.handleSelect}
          onPlayPause={ipod.togglePlay}
          onNext={() => void ipod.nextTrack()}
          onPrev={() => void ipod.prevTrack()}
          isPlaying={ipod.isPlaying}
          wheelClass="bg-gradient-to-b from-red-600 to-red-700 border-2 border-red-400/30 shadow-inner"
          centerClass={isDark ? 'bg-zinc-950 border-2 border-zinc-700' : 'bg-zinc-100 border-2 border-red-300'}
          labelClass="text-red-100 hover:text-white"
        />
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
