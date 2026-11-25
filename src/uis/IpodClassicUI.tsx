import { BatteryCharging, ChevronRight, Disc3, Layers, Volume2, Wifi, WifiOff } from 'lucide-react';
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

export default function IpodClassicUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-classic"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'
          : 'bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-200 text-zinc-900'
      }`}
    >
      {/* Top Quick Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-1 gap-2">
        <span className={`text-xs font-semibold tracking-wide ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          Classic 6th Gen OS · {isDark ? 'Space Gray' : 'Alumínio'}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium min-h-[36px] shadow ${
              isDark ? 'bg-zinc-100 hover:bg-white text-zinc-950' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Brushed Aluminum / Space Gray iPod Shell */}
      <div
        className={`w-full max-w-[395px] rounded-[36px] border-2 p-5 flex flex-col items-center gap-6 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-zinc-700 shadow-[0_24px_60px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)]'
            : 'bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 border-zinc-400/80 shadow-[0_24px_60px_rgba(0,0,0,0.22),inset_0_2px_0_rgba(255,255,255,0.85)]'
        }`}
      >
        {/* Color LCD Screen */}
        <div
          className={`w-full aspect-[4/3] rounded-xl border-[4px] overflow-hidden flex flex-col ${
            isDark
              ? 'bg-zinc-950 border-zinc-950 text-zinc-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]'
              : 'bg-white border-zinc-800 text-zinc-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)]'
          }`}
        >
          {/* LCD Status Bar */}
          <div
            className={`h-6 border-b px-2.5 flex items-center justify-between text-[11px] font-semibold shrink-0 ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                : 'bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 border-zinc-400 text-zinc-800'
            }`}
          >
            <span className="truncate flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${ipod.isPlaying ? 'bg-blue-500' : 'bg-zinc-400'}`}
                aria-hidden="true"
              />
              {ipod.currentScreen === 'home'
                ? 'SonicPod OS'
                : ipod.currentScreen === 'now_playing'
                  ? 'Tocando Agora'
                  : ipod.currentScreen === 'lyrics'
                    ? 'Letras'
                    : ipod.currentScreen === 'settings'
                      ? 'Ajustes'
                      : 'Biblioteca'}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={ipod.toggleWheelMode}
                title="Alternar rotação entre Menu e Volume"
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono-tech inline-flex items-center gap-1 transition-colors ${
                  ipod.wheelMode === 'volume'
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-300/80 text-zinc-700'
                }`}
              >
                <Volume2 className="w-2.5 h-2.5" />
                {Math.round(ipod.volume * 100)}%
              </button>
              {ipod.isOnline ? <Wifi className="w-3 h-3 text-blue-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

          {/* LCD Body */}
          {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
            <div
              className={`flex-1 p-3 flex flex-col justify-between overflow-hidden ${
                isDark ? 'bg-gradient-to-b from-zinc-900 to-zinc-950' : 'bg-gradient-to-b from-slate-50 to-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-md overflow-hidden border border-current/15 shadow shrink-0">
                  <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate">{ipod.currentTrack.title}</div>
                  <div className="text-xs opacity-70 truncate">{ipod.currentTrack.artist}</div>
                  <div className="text-[11px] opacity-55 truncate mt-0.5">{ipod.currentTrack.album}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <DownloadButton track={ipod.currentTrack} />
                  </div>
                </div>
              </div>
              <AnimatedEqBars isPlaying={ipod.isPlaying} bars={18} barClass="bg-blue-500" heightClass="h-4" />
              <IsolatedProgress
                trackDuration={ipod.currentTrack.duration}
                barBgClass={isDark ? 'bg-zinc-800' : 'bg-zinc-300'}
                barFillClass="bg-blue-600"
                textClass={isDark ? 'text-zinc-400' : 'text-zinc-600'}
              />
            </div>
          ) : ipod.currentScreen === 'lyrics' ? (
            <div className={`flex-1 overflow-hidden touch-none select-none p-2.5 ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
              <IpodMenuList
                items={ipod.items}
                selectedIndex={ipod.selectedIndex}
                onSelectItem={(idx, item) => {
                  ipod.setSelectedIndex(idx);
                  item.action();
                }}
                containerClassName={`border-r py-1 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}
                getItemClassName={(selected) =>
                  `w-full px-2.5 py-1.5 text-left text-xs font-medium flex items-center justify-between gap-1 ${
                    selected
                      ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-sm'
                      : isDark
                        ? 'text-zinc-200 hover:bg-zinc-900'
                        : 'text-zinc-800 hover:bg-zinc-100'
                  }`
                }
                renderIndicator={() => <ChevronRight className="w-3 h-3 shrink-0 opacity-75" />}
              />

              <div
                className={`p-2.5 flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-zinc-900/60' : 'bg-gradient-to-b from-zinc-100 to-zinc-200/70'
                }`}
              >
                {ipod.currentTrack ? (
                  <>
                    <div className="w-24 h-24 rounded-md overflow-hidden shadow-md border border-current/15">
                      <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                    </div>
                    <div className="text-[11px] font-semibold truncate w-full mt-2">{ipod.currentTrack.title}</div>
                    <div className="text-[10px] opacity-65 truncate w-full">{ipod.currentTrack.artist}</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 opacity-60">
                    <Disc3 className="w-9 h-9 opacity-45" />
                    <span className="text-[10px] font-medium">
                      {ipod.isOnline ? 'Carregando...' : 'Modo Offline'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Classic Click Wheel */}
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
              ? 'bg-zinc-950 border border-zinc-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.7),0_4px_14px_rgba(0,0,0,0.4)]'
              : 'bg-white border border-zinc-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)]'
          }
          centerClass={
            isDark
              ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-600 shadow-inner'
              : 'bg-gradient-to-b from-zinc-200 to-zinc-300 border border-zinc-400/60 shadow-inner'
          }
          labelClass={isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}
        />
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
