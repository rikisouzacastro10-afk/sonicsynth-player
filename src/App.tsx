import { Suspense, useEffect } from 'react';
import { Loader2, Wifi, WifiOff, X } from 'lucide-react';
import { AudioFxModal } from './components/AudioFxModal';
import { QueueManagerModal } from './components/QueueManagerModal';
import { SpicyLyricsFullscreenModal } from './components/SpicyLyricsFullscreenModal';
import { SpotifyShell } from './components/SpotifyShell';
import { UISwitcherModal } from './components/UISwitcherModal';
import { YouTubePremiumModal } from './components/YouTubePremiumModal';
import { useAppStore } from './stores/useAppStore';
import { UI_COMPONENTS } from './uis/registry';

export default function App() {
  const activeUI = useAppStore((s) => s.activeUI);
  const themeMode = useAppStore((s) => s.themeMode);
  const liquidGlass = useAppStore((s) => s.preferences.liquidGlass);
  const performanceMode = useAppStore((s) => s.preferences.performanceMode);
  const statusBanner = useAppStore((s) => s.statusBanner);
  const isOnline = useAppStore((s) => s.isOnline);
  const setStatusBanner = useAppStore((s) => s.setStatusBanner);
  const bootstrap = useAppStore((s) => s.bootstrap);

  useEffect(() => {
    const cleanup = bootstrap();
    const syncVisibility = () => {
      document.documentElement.classList.toggle('app-hidden', document.hidden);
    };
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      cleanup();
    };
  }, [bootstrap]);

  const ActiveUIComponent = UI_COMPONENTS[activeUI] || UI_COMPONENTS['modern-simpmusic-flow'];
  const isDark = themeMode === 'dark';
  const isIpod = activeUI.startsWith('ipod-');

  return (
    <div
      data-liquid-glass={liquidGlass}
      className={`min-h-screen w-full relative ${isDark ? 'dark' : ''} ${
        performanceMode === 'battery' ? 'battery-saver' : ''
      }`}
    >
      {/* Discreet Network / SponsorBlock Status Toast */}
      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          data-lg-surface="true"
          className={`fixed bottom-40 sm:bottom-auto sm:top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] px-4 py-2.5 rounded-xl border text-xs font-medium shadow-xl flex items-center justify-between gap-3 ${
            isDark
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
              : 'bg-white border-zinc-300 text-zinc-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className="truncate">{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            aria-label="Fechar aviso"
            className="opacity-60 hover:opacity-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lazy-Loaded Active UI: iPods stay pure Click Wheel; 37 Modern/Retro UIs use SpotifyShell */}
      <Suspense
        fallback={
          <div
            className={`min-h-screen w-full flex items-center justify-center gap-3 text-sm ${
              isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-stone-50 text-zinc-800'
            }`}
          >
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Carregando interface...</span>
          </div>
        }
      >
        {isIpod ? (
          <ActiveUIComponent />
        ) : (
          <SpotifyShell uiId={activeUI} ActiveUIComponent={ActiveUIComponent} />
        )}
      </Suspense>

      {/* Global Modals & 45-UI Switcher */}
      <UISwitcherModal />
      <AudioFxModal />
      <QueueManagerModal />
      <SpicyLyricsFullscreenModal />
      <YouTubePremiumModal />
    </div>
  );
}
