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

export default function IpodGoldAtelierUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-gold-atelier"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors ${
        isDark ? 'bg-[#1C140F] text-amber-50' : 'bg-[#F3ECE0] text-amber-950'
      }`}
    >
      <div className="w-full max-w-sm flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-serif-editorial italic ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          Atelier Brass 24K
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Brushed Gold + Walnut / Ivory Inlay Chassis */}
      <div className="w-full max-w-[390px] rounded-[36px] bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#8C6214] p-2 shadow-2xl border border-amber-200/50">
        <div
          className={`rounded-[30px] p-5 flex flex-col items-center gap-6 border border-amber-400/30 ${
            isDark ? 'bg-gradient-to-b from-[#3A2618] to-[#24160D]' : 'bg-gradient-to-b from-[#FAF3E5] to-[#EAE0CC]'
          }`}
        >
          <div
            className={`w-full h-60 rounded-xl border-[3px] border-amber-700/70 shadow-inner flex flex-col overflow-hidden ${
              isDark ? 'bg-[#17110B] text-amber-100' : 'bg-[#FBF7EE] text-zinc-900'
            }`}
          >
            <div
              className={`h-7 px-3 border-b flex items-center justify-between text-[11px] font-serif-editorial font-semibold ${
                isDark ? 'bg-[#261B12] border-amber-500/20' : 'bg-[#EFE6D2] border-amber-900/20'
              }`}
            >
              <span>{ipod.currentScreen === 'settings' ? 'Ajustes' : 'Atelier OS'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={ipod.toggleWheelMode}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono-tech inline-flex items-center gap-1 ${
                    ipod.wheelMode === 'volume'
                      ? 'bg-amber-600 text-white'
                      : isDark
                        ? 'bg-amber-500/15 text-amber-200'
                        : 'bg-amber-900/10 text-amber-900'
                  }`}
                >
                  <Volume2 className="w-3 h-3" /> {Math.round(ipod.volume * 100)}%
                </button>
                {ipod.isOnline ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
              </div>
            </div>

            {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
              <div className="flex-1 p-3.5 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-md overflow-hidden border border-amber-800/30 shadow shrink-0">
                    <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-serif-editorial text-sm font-bold leading-snug line-clamp-2">
                      {ipod.currentTrack.title}
                    </div>
                    <div className="text-xs opacity-70 truncate mt-0.5">{ipod.currentTrack.artist}</div>
                    <div className="mt-1">
                      <DownloadButton track={ipod.currentTrack} compact />
                    </div>
                  </div>
                </div>
                <IsolatedProgress
                  trackDuration={ipod.currentTrack.duration}
                  barBgClass={isDark ? 'bg-amber-900/40' : 'bg-amber-900/15'}
                  barFillClass="bg-amber-600"
                  textClass={isDark ? 'text-amber-300/80' : 'text-amber-900/70'}
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
                containerClassName={`flex-1 divide-y ${isDark ? 'divide-amber-500/10' : 'divide-amber-900/10'}`}
                getItemClassName={(active) =>
                  `w-full px-3 py-2 text-left font-serif-editorial text-xs flex items-center justify-between ${
                    active
                      ? 'bg-amber-700 text-amber-50 font-bold'
                      : isDark
                        ? 'text-amber-100 hover:bg-amber-500/10'
                        : 'text-zinc-800 hover:bg-amber-900/5'
                  }`
                }
                renderIndicator={(active) => <span>{active ? '◆' : ''}</span>}
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
            wheelClass="bg-gradient-to-br from-[#E5C158] via-[#C99B2B] to-[#9A7116] border-2 border-amber-200/60 shadow-lg"
            centerClass={isDark ? 'bg-[#2D1D12] border-2 border-amber-300/60' : 'bg-[#FAF3E5] border-2 border-amber-700/50'}
            labelClass="text-amber-950 font-extrabold hover:text-black"
          />
        </div>
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
