import { Cloud, Layers, Moon, Star, Volume2, Wifi, WifiOff } from 'lucide-react';
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

export default function IpodKawaiiCloudUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-kawaii-cloud-dream"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[#0B1224] via-[#131936] to-[#1D1533] text-sky-100'
          : 'bg-gradient-to-b from-[#E0F2FE] via-[#EDE9FE] to-[#FCE7F3] text-sky-950'
      }`}
    >
      <div className="w-full max-w-sm flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-display font-bold flex items-center gap-1.5 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
          <Cloud className="w-4 h-4 fill-sky-400 text-sky-500" />
          Cloud Dream Pod
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500 text-white text-xs font-bold shadow min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Dreamy Pastel Sky / Starry Night Shell */}
      <div
        className={`w-full max-w-[385px] rounded-[44px] border-4 p-5 flex flex-col items-center gap-6 ${
          isDark
            ? 'bg-gradient-to-b from-[#162040] via-[#1E254D] to-[#26204E] border-sky-400/35 shadow-[0_20px_50px_rgba(56,189,248,0.18)]'
            : 'bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE] to-[#DDD6FE] border-white shadow-[0_20px_50px_rgba(56,189,248,0.28)]'
        }`}
      >
        <div
          className={`w-full h-60 rounded-3xl border-4 shadow-inner flex flex-col overflow-hidden relative ${
            isDark
              ? 'bg-gradient-to-b from-[#0E152E] to-[#17183B] border-sky-500/40 text-sky-100'
              : 'bg-gradient-to-b from-[#EFF6FF] to-[#F5F3FF] border-sky-200 text-sky-950'
          }`}
        >
          <div
            className={`h-7 px-3 border-b flex items-center justify-between text-[11px] font-bold ${
              isDark ? 'bg-sky-950/70 border-sky-800 text-sky-300' : 'bg-sky-100/80 border-sky-200 text-sky-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Moon className="w-3 h-3 fill-amber-300 text-amber-400" />
              {ipod.currentScreen === 'settings' ? 'Ajustes' : 'DreamOS'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={ipod.toggleWheelMode}
                className={`px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
                  ipod.wheelMode === 'volume'
                    ? 'bg-sky-500 text-white'
                    : isDark
                      ? 'bg-sky-900 text-sky-200'
                      : 'bg-white text-sky-700'
                }`}
              >
                <Volume2 className="w-2.5 h-2.5" /> {Math.round(ipod.volume * 100)}%
              </button>
              {ipod.isOnline ? <Wifi className="w-3 h-3 text-sky-400" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
            </div>
          </div>

          {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
            <div className="flex-1 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-sky-400/60 shadow shrink-0">
                  <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate">{ipod.currentTrack.title}</div>
                  <div className={`text-xs truncate ${isDark ? 'text-sky-300' : 'text-sky-600'}`}>
                    {ipod.currentTrack.artist}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <DownloadButton track={ipod.currentTrack} compact />
                    <Cloud className={`w-5 h-5 fill-sky-300 text-sky-400 anim-cloud-drift ${!ipod.isPlaying ? 'anim-paused' : ''}`} />
                  </div>
                </div>
              </div>
              <IsolatedProgress
                trackDuration={ipod.currentTrack.duration}
                barBgClass={isDark ? 'bg-sky-950' : 'bg-sky-200'}
                barFillClass="bg-sky-500"
                textClass={isDark ? 'text-sky-300' : 'text-sky-700'}
              />
            </div>
          ) : ipod.currentScreen === 'lyrics' ? (
            <div className="flex-1 overflow-hidden touch-none select-none p-3">
              <LyricsPanel variant={isDark ? 'dark' : 'light'} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div
                className={`px-3 py-2 border-b flex items-center justify-between shrink-0 ${
                  isDark ? 'bg-sky-950/40 border-sky-800/70' : 'bg-white/60 border-sky-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cloud className={`w-5 h-5 fill-white text-sky-400 anim-cloud-drift ${!ipod.isPlaying ? 'anim-paused' : ''}`} />
                  <span className={`text-[11px] font-semibold truncate max-w-[170px] ${isDark ? 'text-sky-200' : 'text-sky-700'}`}>
                    {ipod.currentTrack?.title || 'Pronto para tocar'}
                  </span>
                </div>
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-400 anim-twinkle" />
              </div>
              <IpodMenuList
                items={ipod.items}
                selectedIndex={ipod.selectedIndex}
                onSelectItem={(idx, item) => {
                  ipod.setSelectedIndex(idx);
                  item.action();
                }}
                containerClassName="flex-1 py-1"
                getItemClassName={(active) =>
                  `w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between ${
                    active
                      ? 'bg-sky-500 text-white'
                      : isDark
                        ? 'text-sky-100 hover:bg-sky-900/40'
                        : 'text-sky-900 hover:bg-sky-100/70'
                  }`
                }
                renderIndicator={(active) => <span>{active ? '★' : ''}</span>}
              />
            </div>
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
              ? 'bg-[#121936] border-4 border-sky-500/40 shadow-lg'
              : 'bg-white border-4 border-sky-200 shadow-lg'
          }
          centerClass="bg-gradient-to-br from-sky-400 to-violet-400 border-2 border-white/70 shadow"
          labelClass={isDark ? 'text-sky-300 hover:text-white' : 'text-sky-600 hover:text-sky-900'}
        />
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
