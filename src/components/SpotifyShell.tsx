import type { ComponentType } from 'react';
import { useArtworkPalette } from '../hooks/useArtworkPalette';
import { useAppStore } from '../stores/useAppStore';
import type { UIId } from '../types/music';
import { getThemePalette } from '../uis/shared/themePalette';
import { ArtistQuickModal } from './ArtistQuickModal';
import { FullscreenPlayerOverlay } from './FullscreenPlayerOverlay';
import { MiniPlayerBar } from './MiniPlayerBar';
import {
  AiGeneratorPanel,
  LibraryPanel,
  SearchPanel,
  SettingsStoragePanel,
} from './SectionPanels';
import { SpotifyHomeView } from './SpotifyHomeView';
import { ThemedDock } from './ThemedDock';

interface SpotifyShellProps {
  uiId: UIId;
  ActiveUIComponent: ComponentType;
}

export function SpotifyShell({ uiId, ActiveUIComponent }: SpotifyShellProps) {
  const activeSection = useAppStore((s) => s.activeSection);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const isPlayerExpanded = useAppStore((s) => s.isPlayerExpanded);
  const themeMode = useAppStore((s) => s.themeMode);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const ambientGlow = useAppStore((s) => s.preferences.ambientGlow);
  const liquidGlass = useAppStore((s) => s.preferences.liquidGlass);

  const isDark = themeMode === 'dark';
  const palette = getThemePalette(uiId);
  const showBackdrop = Boolean(currentTrack && (ambientGlow || liquidGlass !== 'off'));
  const albumColors = useArtworkPalette(currentTrack, showBackdrop);

  return (
    <div
      data-spotify-shell={uiId}
      className={`min-h-screen w-full relative transition-colors ${palette.shell(isDark)}`}
    >
      {/* Dynamic Translucent Album-Color Ambient Backdrop */}
      {showBackdrop && (
        <div
          aria-hidden="true"
          data-album-backdrop="shell"
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[800ms] ease-out"
          style={{
            opacity: liquidGlass === 'high' ? (isDark ? 0.42 : 0.34) : isDark ? 0.28 : 0.22,
            background: `radial-gradient(circle at 18% 12%, ${albumColors.primary}aa, transparent 52%), radial-gradient(circle at 82% 24%, ${albumColors.secondary}99, transparent 54%), radial-gradient(circle at 50% 88%, ${albumColors.tertiary}80, transparent 56%)`,
            transition: 'background 0.8s ease, opacity 0.8s ease',
          }}
        />
      )}

      {/* Active Navigation Page (Início, Buscar, Baixadas, IA, Ajustes) */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-44">
        {activeSection === 'home' && <SpotifyHomeView uiId={uiId} />}
        {activeSection !== 'home' && (
          <div
            data-lg-card="true"
            className={`max-w-4xl mx-auto p-4 sm:p-6 ${palette.radius} ${palette.card(isDark)}`}
          >
            {activeSection === 'search' && <SearchPanel light={!isDark} />}
            {activeSection === 'library' && <LibraryPanel light={!isDark} />}
            {activeSection === 'ai' && <AiGeneratorPanel light={!isDark} />}
            {activeSection === 'settings' && <SettingsStoragePanel light={!isDark} />}
          </div>
        )}
      </main>

      {/* Stacked Persistent Mini-Player + Themed Dock */}
      {!isPlayerExpanded && (
        <div className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] max-w-2xl pb-[env(safe-area-inset-bottom)] flex flex-col gap-2 pointer-events-none">
          <MiniPlayerBar uiId={uiId} />
          <ThemedDock
            uiId={uiId}
            activeTab={activeSection}
            onSelectTab={setActiveSection}
            inline
          />
        </div>
      )}

      {/* Fullscreen Spotify + Theme Player Overlay */}
      <FullscreenPlayerOverlay uiId={uiId} ActiveUIComponent={ActiveUIComponent} />

      {/* Artist Popular Songs Quick View */}
      <ArtistQuickModal uiId={uiId} />
    </div>
  );
}
