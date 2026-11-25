import { Layers, Volume2, Wifi, WifiOff } from 'lucide-react';
import { ClickWheel } from '../components/ClickWheel';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { TrackArtwork } from '../components/TrackArtwork';
import { UI_CATALOG } from '../types/music';
import { IpodMenuList } from './shared/IpodMenuList';
import { UtilitySheet } from './shared/UtilitySheet';
import { useIpodOS } from './shared/useIpodOS';

export default function IpodMiniEinkUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-mini-eink"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
        isDark ? 'bg-[#121316] text-stone-100' : 'bg-[#DDD8CE] text-zinc-950'
      }`}
    >
      <div className="w-full max-w-sm flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-serif-editorial italic ${isDark ? 'text-stone-400' : 'text-zinc-700'}`}>
          PaperPod E-Ink · {isDark ? 'Night Ink' : '300 DPI'}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold min-h-[36px] ${
              isDark
                ? 'border-stone-400 bg-zinc-900 hover:bg-zinc-800 text-stone-100 shadow-[3px_3px_0px_#a8a29e]'
                : 'border-zinc-950 bg-[#EAE7DF] hover:bg-white text-zinc-950 shadow-[3px_3px_0px_#18181b]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Matte Paper E-Ink Hardware */}
      <div
        className={`w-full max-w-[368px] border-2 p-5 flex flex-col items-center gap-6 ${
          isDark
            ? 'bg-[#1D1F23] border-stone-500 shadow-[10px_10px_0px_#09090b]'
            : 'bg-[#EAE7DF] border-zinc-950 shadow-[10px_10px_0px_#18181b]'
        }`}
      >
        <div
          className={`w-full h-58 border-2 flex flex-col overflow-hidden ${
            isDark ? 'bg-[#111215] border-stone-500 text-stone-100' : 'bg-[#F4F1EA] border-zinc-950 text-zinc-950'
          }`}
        >
          <div
            className={`h-7 px-3 border-b flex items-center justify-between text-[11px] font-mono-tech ${
              isDark ? 'border-stone-600' : 'border-zinc-950'
            }`}
          >
            <span>
              {ipod.currentScreen === 'settings' ? 'AJUSTES' : 'E-INK OS'} · {ipod.isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={ipod.toggleWheelMode}
                className={`px-1.5 py-0.5 border text-[9px] inline-flex items-center gap-1 ${
                  ipod.wheelMode === 'volume'
                    ? isDark
                      ? 'bg-stone-100 text-zinc-950 border-stone-100'
                      : 'bg-zinc-950 text-[#F4F1EA] border-zinc-950'
                    : isDark
                      ? 'border-stone-500 text-stone-200'
                      : 'border-zinc-950 text-zinc-950'
                }`}
              >
                <Volume2 className="w-2.5 h-2.5" />
                {Math.round(ipod.volume * 100)}%
              </button>
              {ipod.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            </div>
          </div>

          {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-20 h-20 border-2 grayscale shrink-0 overflow-hidden ${
                    isDark ? 'border-stone-400' : 'border-zinc-950'
                  }`}
                >
                  <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-serif-editorial text-base font-bold leading-tight line-clamp-2">
                    {ipod.currentTrack.title}
                  </div>
                  <div className="text-xs opacity-70 mt-1 truncate">{ipod.currentTrack.artist}</div>
                  <div className="mt-1.5">
                    <DownloadButton track={ipod.currentTrack} compact />
                  </div>
                </div>
              </div>
              <IsolatedProgress
                trackDuration={ipod.currentTrack.duration}
                variant="eink"
                barBgClass={isDark ? 'bg-zinc-700' : 'bg-zinc-300'}
                barFillClass={isDark ? 'bg-stone-100' : 'bg-zinc-950'}
                textClass={isDark ? 'text-stone-300' : 'text-zinc-800'}
              />
            </div>
          ) : ipod.currentScreen === 'lyrics' ? (
            <div className="flex-1 overflow-hidden touch-none select-none p-3 font-serif-editorial">
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
              containerClassName={`flex-1 divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-300'}`}
              getItemClassName={(selected) =>
                `w-full px-3 py-2 text-left font-serif-editorial text-sm flex items-center justify-between ${
                  selected
                    ? isDark
                      ? 'bg-stone-100 text-zinc-950 font-bold'
                      : 'bg-zinc-950 text-[#F4F1EA]'
                    : isDark
                      ? 'text-stone-200 hover:bg-zinc-800/70'
                      : 'text-zinc-950 hover:bg-zinc-200/70'
                }`
              }
              renderIndicator={(selected) => <span className="text-xs font-mono-tech">{selected ? '▸' : ''}</span>}
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
          wheelClass={
            isDark
              ? 'bg-[#26282E] border-2 border-stone-500 shadow-inner'
              : 'bg-[#DFDBD0] border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]'
          }
          centerClass={
            isDark ? 'bg-[#111215] border-2 border-stone-400' : 'bg-[#F4F1EA] border-2 border-zinc-950'
          }
          labelClass={isDark ? 'text-stone-200 hover:text-white' : 'text-zinc-900'}
        />
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
