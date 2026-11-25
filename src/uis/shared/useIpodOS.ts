import { useCallback, useMemo, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { UI_CATALOG, type Track } from '../../types/music';
import { clampIpodSelectionIndex } from '../../utils/ipodMenuScroll';
import { LIQUID_GLASS_LABELS, type LiquidGlassLevel } from '../../utils/settingsAndFx';

export type IpodScreen =
  | 'home'
  | 'now_playing'
  | 'songs'
  | 'offline'
  | 'playlists'
  | 'lyrics'
  | 'settings';

export interface IpodMenuItem {
  id: string;
  label: string;
  sublabel?: string;
  action: () => void;
}

interface ScreenFrame {
  screen: IpodScreen;
  index: number;
}

export function useIpodOS() {
  const queue = useAppStore((s) => s.queue);
  const currentTrack = useAppStore((s) => s.currentTrack);
  const offlineTracks = useAppStore((s) => s.offlineTracks);
  const playlists = useAppStore((s) => s.playlists);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const isOnline = useAppStore((s) => s.isOnline);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const playTrack = useAppStore((s) => s.playTrack);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const nextTrack = useAppStore((s) => s.nextTrack);
  const prevTrack = useAppStore((s) => s.prevTrack);
  const downloadTrack = useAppStore((s) => s.downloadTrack);
  const setUISwitcherOpen = useAppStore((s) => s.setUISwitcherOpen);
  const themeMode = useAppStore((s) => s.themeMode);
  const toggleThemeMode = useAppStore((s) => s.toggleThemeMode);
  const repeatMode = useAppStore((s) => s.repeatMode);
  const cycleRepeatMode = useAppStore((s) => s.cycleRepeatMode);
  const shuffle = useAppStore((s) => s.shuffle);
  const toggleShuffle = useAppStore((s) => s.toggleShuffle);
  const sponsorBlockEnabled = useAppStore((s) => s.sponsorBlockEnabled);
  const toggleSponsorBlock = useAppStore((s) => s.toggleSponsorBlock);
  const preferences = useAppStore((s) => s.preferences);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const updateAudioFx = useAppStore((s) => s.updateAudioFx);
  const sleepTimerMode = useAppStore((s) => s.sleepTimerMode);
  const setSleepTimer = useAppStore((s) => s.setSleepTimer);

  const [screenStack, setScreenStack] = useState<ScreenFrame[]>([{ screen: 'home', index: 0 }]);
  const [wheelMode, setWheelMode] = useState<'menu' | 'volume'>('menu');
  const [activeSheet, setActiveSheet] = useState<'search' | 'ai' | 'settings' | 'library' | null>(null);

  const topFrame = screenStack[screenStack.length - 1];
  const currentScreen = topFrame.screen;
  const selectedIndex = topFrame.index;

  const setSelectedIndex = useCallback((nextIdx: number) => {
    setScreenStack((prev) => {
      const next = [...prev];
      const top = next[next.length - 1];
      if (!top) return prev;
      next[next.length - 1] = { ...top, index: Math.max(0, nextIdx) };
      return next;
    });
  }, []);

  const pushScreen = useCallback((next: IpodScreen) => {
    setScreenStack((prev) => [...prev, { screen: next, index: 0 }]);
  }, []);

  const popScreen = useCallback(() => {
    setScreenStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const toggleWheelMode = useCallback(() => {
    setWheelMode((m) => (m === 'menu' ? 'volume' : 'menu'));
  }, []);

  const items: IpodMenuItem[] = useMemo(() => {
    if (currentScreen === 'home') {
      return [
        { id: 'np', label: 'Tocando Agora', sublabel: currentTrack?.title, action: () => pushScreen('now_playing') },
        { id: 'off', label: `Baixadas (${offlineTracks.length})`, sublabel: !isOnline ? 'Modo Offline' : undefined, action: () => pushScreen('offline') },
        { id: 'songs', label: `Em Alta / Fila (${queue.length})`, action: () => pushScreen('songs') },
        { id: 'pl', label: `Playlists (${playlists.length})`, action: () => pushScreen('playlists') },
        { id: 'lyr', label: 'Letras Sincronizadas', action: () => pushScreen('lyrics') },
        { id: 'search', label: 'Buscar Streaming', action: () => setActiveSheet('search') },
        { id: 'ai', label: 'Gerador IA Playlist', action: () => setActiveSheet('ai') },
        { id: 'set', label: 'Ajustes', sublabel: 'Tema, Sleep, EQ, FX', action: () => pushScreen('settings') },
        { id: 'theme', label: themeMode === 'dark' ? 'Modo Claro' : 'Modo Escuro', action: () => toggleThemeMode() },
        { id: 'ui', label: `Trocar Interface (${UI_CATALOG.length})`, action: () => setUISwitcherOpen(true) },
      ];
    }

    if (currentScreen === 'settings') {
      const repeatLabel =
        repeatMode === 'one' ? 'Uma faixa' : repeatMode === 'all' ? 'Todas' : 'Desligado';
      const sleepOrder = ['off', '15', '30', '45', '60', 'end_of_track'] as const;
      const sleepLabels: Record<(typeof sleepOrder)[number], string> = {
        off: 'Desligado',
        '15': '15 min',
        '30': '30 min',
        '45': '45 min',
        '60': '60 min',
        end_of_track: 'Fim faixa',
      };
      const eqKeys = ['flat', 'bass_boost', 'rock', 'pop', 'electronic', 'vocal'] as const;
      const eqBandsMap: Record<(typeof eqKeys)[number], [number, number, number, number, number]> = {
        flat: [0, 0, 0, 0, 0],
        bass_boost: [7, 5, 0, 1, 2],
        rock: [5, 2, -2, 3, 5],
        pop: [-1, 3, 4, 3, -1],
        electronic: [6, 3, -1, 4, 6],
        vocal: [-3, 1, 5, 4, 1],
      };

      return [
        {
          id: 'set-theme',
          label: `Tema: ${themeMode === 'dark' ? 'Escuro' : 'Claro'}`,
          action: () => toggleThemeMode(),
        },
        {
          id: 'set-wheel',
          label: `Roda: ${wheelMode === 'menu' ? 'Navegar Menu' : 'Volume'}`,
          action: () => toggleWheelMode(),
        },
        {
          id: 'set-sleep',
          label: `Sleep Timer: ${sleepLabels[sleepTimerMode]}`,
          action: () => {
            const next = sleepOrder[(sleepOrder.indexOf(sleepTimerMode) + 1) % sleepOrder.length];
            setSleepTimer(next);
          },
        },
        {
          id: 'set-eq',
          label: `EQ Preset: ${preferences.audioFx.eqPreset.toUpperCase()}`,
          action: () => {
            const cur = preferences.audioFx.eqPreset;
            const idx = eqKeys.indexOf(cur as (typeof eqKeys)[number]);
            const next = eqKeys[(idx + 1) % eqKeys.length];
            updateAudioFx({ eqPreset: next, eqBands: eqBandsMap[next] });
          },
        },
        {
          id: 'set-spicy',
          label: `SpicyLyrics: ${preferences.spicyLyrics ? 'Ativo' : 'Clássico'}`,
          action: () => updatePreferences({ spicyLyrics: !preferences.spicyLyrics }),
        },
        {
          id: 'set-glass',
          label: `Liquid Glass: ${LIQUID_GLASS_LABELS[preferences.liquidGlass]}`,
          action: () => {
            const levels: LiquidGlassLevel[] = ['off', 'basic', 'medium', 'high'];
            const idx = levels.indexOf(preferences.liquidGlass);
            updatePreferences({ liquidGlass: levels[(idx + 1) % levels.length] });
          },
        },
        {
          id: 'set-glow',
          label: `Brilho Capa: ${preferences.ambientGlow ? 'Ligado' : 'Desligado'}`,
          action: () => updatePreferences({ ambientGlow: !preferences.ambientGlow }),
        },
        {
          id: 'set-fade',
          label: `Fade Suave: ${preferences.smoothFade ? 'Ligado' : 'Desligado'}`,
          action: () => updatePreferences({ smoothFade: !preferences.smoothFade }),
        },
        {
          id: 'set-cont',
          label: `Álbum Contínuo: ${preferences.keepAlbumContinuous ? 'Sim' : 'Não'}`,
          action: () => updatePreferences({ keepAlbumContinuous: !preferences.keepAlbumContinuous }),
        },
        {
          id: 'set-perf',
          label: `Bateria: ${preferences.performanceMode === 'battery' ? 'Econômico' : '60 FPS'}`,
          action: () =>
            updatePreferences({
              performanceMode: preferences.performanceMode === 'battery' ? 'full' : 'battery',
            }),
        },
        {
          id: 'set-repeat',
          label: `Repetir: ${repeatLabel}`,
          action: () => cycleRepeatMode(),
        },
        {
          id: 'set-shuffle',
          label: `Aleatório: ${shuffle ? 'Ligado' : 'Desligado'}`,
          action: () => toggleShuffle(),
        },
        {
          id: 'set-sb',
          label: `SponsorBlock: ${sponsorBlockEnabled ? 'Ativo' : 'Inativo'}`,
          action: () => toggleSponsorBlock(),
        },
        {
          id: 'set-cache',
          label: 'Ajustes Completos & Backup',
          action: () => setActiveSheet('settings'),
        },
        {
          id: 'set-ui',
          label: `Trocar Interface (${UI_CATALOG.length})`,
          action: () => setUISwitcherOpen(true),
        },
      ];
    }

    if (currentScreen === 'songs') {
      if (queue.length === 0) {
        return [{ id: 'empty-q', label: isOnline ? 'Carregando paradas...' : 'Nenhuma música offline', action: () => setActiveSheet('search') }];
      }
      return queue.map((t: Track) => ({
        id: t.id,
        label: t.title,
        sublabel: t.artist,
        action: () => {
          void playTrack(t, queue);
          pushScreen('now_playing');
        },
      }));
    }

    if (currentScreen === 'offline') {
      const list = offlineTracks.map((r) => r.track);
      if (list.length === 0) {
        return [
          {
            id: 'empty',
            label: 'Nenhuma baixada ainda',
            sublabel: currentTrack ? 'Toque para baixar a faixa atual' : 'Busque online para baixar',
            action: () => {
              if (currentTrack) void downloadTrack(currentTrack);
              else setActiveSheet('search');
            },
          },
        ];
      }
      return list.map((t) => ({
        id: t.id,
        label: t.title,
        sublabel: t.artist,
        action: () => {
          void playTrack(t, list);
          pushScreen('now_playing');
        },
      }));
    }

    if (currentScreen === 'playlists') {
      if (playlists.length === 0) {
        return [{ id: 'empty-pl', label: 'Gerar Playlist com IA', action: () => setActiveSheet('ai') }];
      }
      return playlists.map((p) => ({
        id: p.id,
        label: p.title,
        sublabel: `${p.tracks.length} faixas`,
        action: () => {
          if (p.tracks[0]) {
            void playTrack(p.tracks[0], p.tracks);
            pushScreen('now_playing');
          }
        },
      }));
    }

    return [];
  }, [
    currentScreen,
    currentTrack,
    offlineTracks,
    isOnline,
    queue,
    playlists,
    pushScreen,
    playTrack,
    downloadTrack,
    setUISwitcherOpen,
    themeMode,
    toggleThemeMode,
    wheelMode,
    toggleWheelMode,
    repeatMode,
    cycleRepeatMode,
    shuffle,
    toggleShuffle,
    sponsorBlockEnabled,
    toggleSponsorBlock,
    preferences,
    updatePreferences,
    updateAudioFx,
    sleepTimerMode,
    setSleepTimer,
  ]);

  const clampedSelectedIndex = items.length > 0 ? Math.min(selectedIndex, items.length - 1) : 0;

  const handleRotateStep = useCallback(
    (dir: 1 | -1) => {
      if (wheelMode === 'volume' || currentScreen === 'now_playing') {
        setVolume(volume + dir * 0.05);
        return;
      }
      if (items.length === 0) return;
      setScreenStack((prev) => {
        const next = [...prev];
        const top = next[next.length - 1];
        if (!top) return prev;
        next[next.length - 1] = {
          ...top,
          index: clampIpodSelectionIndex(top.index, dir, items.length),
        };
        return next;
      });
    },
    [wheelMode, currentScreen, volume, setVolume, items.length]
  );

  const handleSelect = useCallback(() => {
    if (currentScreen === 'now_playing') {
      pushScreen('lyrics');
      return;
    }
    if (currentScreen === 'lyrics') {
      popScreen();
      return;
    }
    const item = items[clampedSelectedIndex];
    item?.action();
  }, [currentScreen, items, clampedSelectedIndex, pushScreen, popScreen]);

  return {
    currentScreen,
    items,
    selectedIndex: clampedSelectedIndex,
    setSelectedIndex,
    wheelMode,
    toggleWheelMode,
    volume,
    setVolume,
    activeSheet,
    setActiveSheet,
    currentTrack,
    isPlaying,
    isOnline,
    pushScreen,
    popScreen,
    handleRotateStep,
    handleSelect,
    togglePlay,
    nextTrack,
    prevTrack,
    downloadTrack,
    setUISwitcherOpen,
    themeMode,
    toggleThemeMode,
  };
}
