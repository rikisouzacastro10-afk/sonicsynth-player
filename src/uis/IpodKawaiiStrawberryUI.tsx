import { Heart, Layers, Sparkles, Volume2, Wifi, WifiOff } from 'lucide-react';
import { ClickWheel } from '../components/ClickWheel';
import { DownloadButton } from '../components/DownloadButton';
import { IsolatedProgress } from '../components/IsolatedProgress';
import { LyricsPanel } from '../components/LyricsPanel';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { TrackArtwork } from '../components/TrackArtwork';
import { UI_CATALOG } from '../types/music';
import { KawaiiBuddySvg } from './shared/RetroAnimatedParts';
import { IpodMenuList } from './shared/IpodMenuList';
import { UtilitySheet } from './shared/UtilitySheet';
import { useIpodOS } from './shared/useIpodOS';

export default function IpodKawaiiStrawberryUI() {
  const ipod = useIpodOS();
  const isDark = ipod.themeMode === 'dark';

  return (
    <div
      data-ui-id="ipod-kawaii-strawberry"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[#1F0F19] via-[#2A1322] to-[#190B14] text-pink-100'
          : 'bg-gradient-to-b from-[#FFF0F5] via-[#FCE7F3] to-[#FBCFE8] text-pink-950'
      }`}
    >
      <div className="w-full max-w-sm flex items-center justify-between mb-3 gap-2">
        <span className={`text-xs font-display font-bold flex items-center gap-1.5 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          Ichigo Milk Pod
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggleButton compact />
          <button
            type="button"
            onClick={() => ipod.setUISwitcherOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-500 text-white text-xs font-bold shadow min-h-[36px]"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{UI_CATALOG.length} UIs</span>
          </button>
        </div>
      </div>

      {/* Cute Kitty Ears Top Silhouette */}
      <div className="w-full max-w-[380px] relative pt-5 flex flex-col items-center">
        <div
          className={`absolute top-0 left-10 w-14 h-12 rounded-tl-[26px] rounded-tr-[14px] border-4 shadow rotate-[-12deg] ${
            isDark ? 'bg-pink-800 border-pink-400/50' : 'bg-pink-300 border-white'
          }`}
          aria-hidden="true"
        >
          <div className={`w-6 h-6 rounded-full m-2 ${isDark ? 'bg-rose-400/50' : 'bg-rose-200'}`} />
        </div>
        <div
          className={`absolute top-0 right-10 w-14 h-12 rounded-tr-[26px] rounded-tl-[14px] border-4 shadow rotate-[12deg] ${
            isDark ? 'bg-pink-800 border-pink-400/50' : 'bg-pink-300 border-white'
          }`}
          aria-hidden="true"
        >
          <div className={`w-6 h-6 rounded-full m-2 ml-4 ${isDark ? 'bg-rose-400/50' : 'bg-rose-200'}`} />
        </div>

        {/* Strawberry Shell (Pastel Cream vs Midnight Berry) */}
        <div
          className={`relative z-10 w-full rounded-[42px] border-4 p-5 flex flex-col items-center gap-6 ${
            isDark
              ? 'bg-gradient-to-b from-[#3A192E] via-[#2B1222] to-[#200C19] border-pink-400/40 shadow-[0_20px_50px_rgba(236,72,153,0.22)]'
              : 'bg-gradient-to-b from-[#FFE4EE] via-[#FFC8DD] to-[#FFAFCC] border-white shadow-[0_20px_50px_rgba(244,114,182,0.3)]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-pink-400 absolute top-4 right-5 anim-twinkle pointer-events-none" aria-hidden="true" />

          <div
            className={`w-full h-60 rounded-3xl border-4 shadow-inner flex flex-col overflow-hidden ${
              isDark ? 'bg-[#180A13] border-pink-500/40 text-pink-100' : 'bg-[#FFF9FB] border-pink-300 text-pink-950'
            }`}
          >
            <div
              className={`h-7 px-3 border-b flex items-center justify-between text-[11px] font-bold ${
                isDark ? 'bg-pink-950/80 border-pink-800 text-pink-300' : 'bg-pink-100 border-pink-200 text-pink-700'
              }`}
            >
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                {ipod.currentScreen === 'settings' ? 'Ajustes ♥' : 'Ichigo OS'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={ipod.toggleWheelMode}
                  className={`px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
                    ipod.wheelMode === 'volume'
                      ? 'bg-pink-500 text-white'
                      : isDark
                        ? 'bg-pink-900 text-pink-200'
                        : 'bg-pink-200 text-pink-800'
                  }`}
                >
                  <Volume2 className="w-2.5 h-2.5" /> {Math.round(ipod.volume * 100)}%
                </button>
                {ipod.isOnline ? <Wifi className="w-3 h-3 text-pink-500" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
              </div>
            </div>

            {ipod.currentScreen === 'now_playing' && ipod.currentTrack ? (
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-400/60 shadow shrink-0">
                    <TrackArtwork src={ipod.currentTrack.artwork} alt={ipod.currentTrack.title} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold truncate">{ipod.currentTrack.title}</div>
                    <div className={`text-xs truncate ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>
                      {ipod.currentTrack.artist}
                    </div>
                    <div className="mt-1">
                      <DownloadButton track={ipod.currentTrack} compact />
                    </div>
                  </div>
                  <div className="shrink-0 scale-75">
                    <KawaiiBuddySvg isPlaying={ipod.isPlaying} variant="cat" />
                  </div>
                </div>
                <IsolatedProgress
                  trackDuration={ipod.currentTrack.duration}
                  barBgClass={isDark ? 'bg-pink-950' : 'bg-pink-200'}
                  barFillClass="bg-pink-500"
                  textClass={isDark ? 'text-pink-300' : 'text-pink-600'}
                />
              </div>
            ) : ipod.currentScreen === 'lyrics' ? (
              <div className="flex-1 overflow-hidden touch-none select-none p-3">
                <LyricsPanel variant={isDark ? 'dark' : 'light'} />
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-12 overflow-hidden">
                <IpodMenuList
                  items={ipod.items}
                  selectedIndex={ipod.selectedIndex}
                  onSelectItem={(idx, item) => {
                    ipod.setSelectedIndex(idx);
                    item.action();
                  }}
                  containerClassName="col-span-8 py-1"
                  getItemClassName={(active) =>
                    `w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between ${
                      active
                        ? 'bg-pink-500 text-white rounded-r-full'
                        : isDark
                          ? 'text-pink-100 hover:bg-pink-900/40'
                          : 'text-pink-900 hover:bg-pink-100'
                    }`
                  }
                  renderIndicator={(active) => <span>{active ? '♥' : ''}</span>}
                />
                <div
                  className={`col-span-4 border-l flex flex-col items-center justify-center p-2 text-center ${
                    isDark ? 'bg-pink-950/40 border-pink-800/60' : 'bg-pink-50/80 border-pink-100'
                  }`}
                >
                  <KawaiiBuddySvg isPlaying={ipod.isPlaying} variant="cat" />
                  <span className="text-[10px] font-bold text-pink-400 mt-1">
                    {ipod.isPlaying ? 'Ouvindo ♪' : 'Descansando'}
                  </span>
                </div>
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
                ? 'bg-[#2C1323] border-4 border-pink-500/40 shadow-lg'
                : 'bg-white/95 border-4 border-pink-200 shadow-lg'
            }
            centerClass="bg-gradient-to-b from-pink-400 to-pink-500 border-2 border-white/70 shadow"
            labelClass={isDark ? 'text-pink-300 hover:text-white' : 'text-pink-500 hover:text-pink-700'}
          />
        </div>
      </div>

      <UtilitySheet sheet={ipod.activeSheet} onClose={() => ipod.setActiveSheet(null)} />
    </div>
  );
}
