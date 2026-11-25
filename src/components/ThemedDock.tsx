import {
  FolderDown,
  Home,
  Layers,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { UI_CATALOG, type AppSection, type UIId } from '../types/music';
import { useIsEmbeddedPlayer } from '../uis/shared/PlayerEmbedContext';

export type DockTab = AppSection;

interface ThemedDockProps {
  uiId: UIId;
  activeTab: DockTab;
  onSelectTab: (tab: DockTab) => void;
  inline?: boolean;
}

interface DockStyleSpec {
  container: (isDark: boolean) => string;
  itemBase: string;
  itemActive: (isDark: boolean) => string;
  itemInactive: (isDark: boolean) => string;
  accentAction: (isDark: boolean) => string;
}

const DEFAULT_MODERN_DOCK = (
  darkShell: string,
  lightShell: string,
  activeDark: string,
  activeLight: string
): DockStyleSpec => ({
  container: (isDark) =>
    `rounded-2xl border backdrop-blur-xl shadow-2xl px-1.5 py-1.5 ${
      isDark ? darkShell : lightShell
    }`,
  itemBase: 'rounded-xl',
  itemActive: (isDark) => (isDark ? activeDark : activeLight),
  itemInactive: (isDark) =>
    isDark
      ? 'text-zinc-400 hover:text-white hover:bg-white/10'
      : 'text-zinc-600 hover:text-zinc-950 hover:bg-black/5',
  accentAction: (isDark) => (isDark ? activeDark : activeLight),
});

const RETRO_MECHANICAL_DOCK = (
  darkShell: string,
  lightShell: string,
  activeClass: string,
  keyDark: string,
  keyLight: string
): DockStyleSpec => ({
  container: (isDark) =>
    `rounded-xl border-2 px-2 py-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.45)] ${
      isDark ? darkShell : lightShell
    }`,
  itemBase:
    'rounded-lg border shadow-[0_3px_0_rgba(0,0,0,0.38)] active:translate-y-0.5 active:shadow-none',
  itemActive: () => activeClass,
  itemInactive: (isDark) => (isDark ? keyDark : keyLight),
  accentAction: () => activeClass,
});

const DOCK_THEMES: Partial<Record<UIId, DockStyleSpec>> = {
  // 10 Retro + Kawaii Retro
  'retro-walkman-cassette': RETRO_MECHANICAL_DOCK(
    'bg-[#1B2C47]/95 border-slate-400/50',
    'bg-[#C8D8EE]/95 border-slate-500/60',
    'bg-orange-500 text-white border-orange-300',
    'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700',
    'bg-white text-slate-900 border-slate-400 hover:bg-slate-50'
  ),
  'retro-winamp-rack': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-mono-tech shadow-2xl ${
        isDark
          ? 'bg-[#1D222D]/95 border-t-zinc-500 border-l-zinc-500 border-r-zinc-900 border-b-zinc-950'
          : 'bg-[#D8DDE6]/95 border-t-white border-l-white border-r-zinc-500 border-b-zinc-600'
      }`,
    itemBase: 'rounded-none border',
    itemActive: () => 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-[#282E3B] text-emerald-400 border-zinc-600 hover:bg-zinc-700'
        : 'bg-white text-zinc-900 border-zinc-400 hover:bg-zinc-100',
    accentAction: () => 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold',
  },
  'retro-vinyl-turntable': RETRO_MECHANICAL_DOCK(
    'bg-[#2C1A0F]/95 border-amber-600/45',
    'bg-[#E1C6A8]/95 border-amber-900/35',
    'bg-amber-500 text-zinc-950 border-amber-300 font-bold',
    'bg-[#1A120D] text-amber-200 border-amber-800/50 hover:bg-amber-950',
    'bg-[#FAF4EC] text-amber-950 border-amber-700/30 hover:bg-white'
  ),
  'retro-vfd-crt': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-mono-tech backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.2)] ${
        isDark
          ? 'bg-[#040E0A]/95 border-emerald-500/60'
          : 'bg-[#EDF7F1]/95 border-emerald-700/50'
      }`,
    itemBase: 'rounded-none border',
    itemActive: () => 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-[#071912] text-emerald-400 border-emerald-600/40 hover:bg-emerald-500/15'
        : 'bg-white text-emerald-950 border-emerald-700/30 hover:bg-emerald-50',
    accentAction: () => 'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold',
  },
  'retro-boombox-ghettoblaster': RETRO_MECHANICAL_DOCK(
    'bg-zinc-900/95 border-zinc-500',
    'bg-zinc-300/95 border-zinc-500',
    'bg-red-600 text-white border-red-400',
    'bg-zinc-800 text-zinc-100 border-zinc-600 hover:bg-zinc-700',
    'bg-zinc-100 text-zinc-950 border-zinc-400 hover:bg-white'
  ),
  'retro-minidisc-y2k': {
    container: (isDark) =>
      `rounded-full border-2 px-2 py-1.5 backdrop-blur-xl shadow-2xl ${
        isDark
          ? 'bg-[#10213A]/95 border-sky-400/45'
          : 'bg-[#DCE8F7]/95 border-white shadow-lg'
      }`,
    itemBase: 'rounded-full border',
    itemActive: () => 'bg-sky-400 text-slate-950 border-white font-bold shadow-sm',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-sky-950/70 text-sky-200 border-sky-500/30 hover:bg-sky-900'
        : 'bg-white/90 text-slate-800 border-sky-200 hover:bg-white',
    accentAction: () => 'bg-sky-400 text-slate-950 border-white font-bold',
  },
  'retro-arcade-jukebox': {
    container: (isDark) =>
      `rounded-full border-2 px-2 py-1.5 shadow-[0_0_30px_rgba(244,63,94,0.28)] ${
        isDark
          ? 'bg-[#290D18]/95 border-amber-300/65'
          : 'bg-[#FFE4EA]/95 border-rose-400'
      }`,
    itemBase: 'rounded-full border',
    itemActive: () => 'bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 border-white font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-rose-950/80 text-rose-100 border-rose-500/35 hover:bg-rose-900'
        : 'bg-white text-rose-900 border-rose-300 hover:bg-rose-50',
    accentAction: () => 'bg-rose-500 text-white border-amber-200 font-bold',
  },
  'retro-reel-to-reel': RETRO_MECHANICAL_DOCK(
    'bg-[#282421]/95 border-amber-600/45',
    'bg-[#DED7CC]/95 border-zinc-500/50',
    'bg-amber-600 text-white border-amber-300 font-bold',
    'bg-zinc-800 text-zinc-200 border-zinc-600 hover:bg-zinc-700',
    'bg-zinc-100 text-zinc-900 border-zinc-400 hover:bg-white'
  ),
  'retro-kawaii-tamagotchi': {
    container: (isDark) =>
      `rounded-full border-4 px-2 py-1.5 shadow-[0_10px_28px_rgba(244,114,182,0.35)] ${
        isDark
          ? 'bg-[#351428]/95 border-pink-400/50'
          : 'bg-[#FFE3EC]/95 border-white'
      }`,
    itemBase: 'rounded-full',
    itemActive: () => 'bg-pink-500 text-white shadow-md font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'text-pink-200 hover:bg-pink-500/20'
        : 'text-pink-700 hover:bg-white/80',
    accentAction: () => 'bg-pink-500 text-white shadow-md font-bold',
  },
  'retro-kawaii-bento-radio': {
    container: (isDark) =>
      `rounded-3xl border-2 px-2 py-1.5 shadow-xl ${
        isDark
          ? 'bg-[#1D2719]/95 border-[#5B754E]'
          : 'bg-[#FFFDF5]/95 border-[#A6BC96]'
      }`,
    itemBase: 'rounded-2xl',
    itemActive: () => 'bg-[#65A30D] text-white shadow-sm font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'text-[#CFE3C3] hover:bg-[#2C3A26]'
        : 'text-[#44533E] hover:bg-[#EAF3DC]',
    accentAction: () => 'bg-[#65A30D] text-white shadow-sm font-bold',
  },
  // +10 Hyper-Detailed Retro Devices
  'retro-tps-l2-1979': RETRO_MECHANICAL_DOCK(
    'bg-[#13335A]/95 border-slate-300/60',
    'bg-[#CBD5E1]/95 border-slate-500/70',
    'bg-orange-500 text-white border-orange-300',
    'bg-[#1D4E89] text-slate-100 border-slate-400/60 hover:bg-[#2563A8]',
    'bg-white text-slate-900 border-slate-400 hover:bg-slate-50'
  ),
  'retro-winamp-classic-291': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-mono-tech shadow-2xl ${
        isDark
          ? 'bg-[#1C1E26]/95 border-t-zinc-500 border-l-zinc-500 border-r-zinc-950 border-b-zinc-950'
          : 'bg-[#D4D8E0]/95 border-t-white border-l-white border-r-zinc-500 border-b-zinc-600'
      }`,
    itemBase: 'rounded-none border',
    itemActive: () => 'bg-lime-400 text-zinc-950 border-lime-200 font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-[#262934] text-lime-400 border-zinc-600 hover:bg-zinc-700'
        : 'bg-white text-zinc-900 border-zinc-400 hover:bg-zinc-100',
    accentAction: () => 'bg-lime-400 text-zinc-950 border-lime-200 font-bold',
  },
  'retro-minidisc-mz-r50': RETRO_MECHANICAL_DOCK(
    'bg-[#1A2230]/95 border-amber-400/50',
    'bg-[#DCE2EA]/95 border-slate-400',
    'bg-amber-500 text-zinc-950 border-amber-300 font-bold',
    'bg-slate-800 text-amber-200 border-slate-600 hover:bg-slate-700',
    'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
  ),
  'retro-tv-crt-trinitron-vhs': RETRO_MECHANICAL_DOCK(
    'bg-[#261F1B]/95 border-amber-800/50',
    'bg-[#E6DFD5]/95 border-stone-400',
    'bg-emerald-500 text-zinc-950 border-emerald-300 font-bold',
    'bg-[#1B1714] text-emerald-400 border-stone-700 hover:bg-stone-800',
    'bg-white text-stone-900 border-stone-400 hover:bg-stone-50'
  ),
  'retro-dualscreen-3ds-sp': RETRO_MECHANICAL_DOCK(
    'bg-[#1C192E]/95 border-rose-500/45',
    'bg-[#E7E5F2]/95 border-slate-400',
    'bg-red-500 text-white border-red-300 font-bold',
    'bg-[#2A2644] text-slate-100 border-indigo-500/40 hover:bg-[#353057]',
    'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
  ),
  'retro-synth-op1-studio': RETRO_MECHANICAL_DOCK(
    'bg-[#23252A]/95 border-zinc-500',
    'bg-[#E5E7EB]/95 border-zinc-400',
    'bg-orange-500 text-white border-orange-300 font-bold',
    'bg-zinc-800 text-zinc-100 border-zinc-600 hover:bg-zinc-700',
    'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50'
  ),
  'retro-cyberdeck-dos-92': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-mono-tech shadow-2xl ${
        isDark ? 'bg-[#120E08]/95 border-amber-500/60' : 'bg-[#F3ECD8]/95 border-amber-800/60'
      }`,
    itemBase: 'rounded-none border',
    itemActive: () => 'bg-amber-500 text-zinc-950 border-amber-300 font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-[#1D170E] text-amber-400 border-amber-600/40 hover:bg-amber-500/15'
        : 'bg-white text-amber-950 border-amber-700/40 hover:bg-amber-50',
    accentAction: () => 'bg-amber-500 text-zinc-950 border-amber-300 font-bold',
  },
  'retro-flipclock-hi-fi-77': RETRO_MECHANICAL_DOCK(
    'bg-[#241913]/95 border-orange-500/45',
    'bg-[#EDE3D6]/95 border-stone-400',
    'bg-orange-600 text-white border-orange-400 font-bold',
    'bg-[#19110D] text-amber-100 border-stone-700 hover:bg-stone-800',
    'bg-white text-stone-900 border-stone-300 hover:bg-stone-50'
  ),
  'retro-oscilloscope-tektronix-74': {
    container: (isDark) =>
      `rounded-lg border-2 px-2 py-1.5 font-mono-tech shadow-2xl ${
        isDark ? 'bg-[#0C181A]/95 border-teal-400/50' : 'bg-[#E2ECEE]/95 border-teal-800/50'
      }`,
    itemBase: 'rounded border',
    itemActive: () => 'bg-teal-400 text-zinc-950 border-teal-200 font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'bg-[#122427] text-teal-300 border-teal-600/40 hover:bg-teal-900'
        : 'bg-white text-teal-950 border-teal-600/30 hover:bg-teal-50',
    accentAction: () => 'bg-teal-400 text-zinc-950 border-teal-200 font-bold',
  },
  'retro-pager-beeper-95': RETRO_MECHANICAL_DOCK(
    'bg-[#1D231D]/95 border-lime-400/45',
    'bg-[#DCE4D5]/95 border-stone-500',
    'bg-lime-400 text-zinc-950 border-lime-200 font-bold',
    'bg-[#293129] text-lime-300 border-zinc-600 hover:bg-zinc-700',
    'bg-white text-zinc-900 border-stone-400 hover:bg-stone-50'
  ),

  // 17 Modern UIs
  'modern-simpmusic-flow': DEFAULT_MODERN_DOCK(
    'bg-[#111522]/85 border-white/15',
    'bg-white/90 border-zinc-200',
    'bg-indigo-600 text-white shadow-md',
    'bg-indigo-600 text-white shadow-md'
  ),
  'modern-editorial-broadsheet': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-serif-editorial shadow-xl ${
        isDark
          ? 'bg-[#161412]/95 border-stone-500'
          : 'bg-[#F9F7F2]/95 border-zinc-900'
      }`,
    itemBase: 'rounded-none',
    itemActive: (isDark) =>
      isDark ? 'bg-red-600 text-white font-bold' : 'bg-red-700 text-white font-bold',
    itemInactive: (isDark) =>
      isDark
        ? 'text-stone-300 hover:bg-stone-800'
        : 'text-zinc-800 hover:bg-zinc-200/70',
    accentAction: (isDark) =>
      isDark ? 'bg-[#F3EFE6] text-zinc-950 font-bold' : 'bg-zinc-900 text-white font-bold',
  },
  'modern-bento-studio': DEFAULT_MODERN_DOCK(
    'bg-[#161A23]/88 border-zinc-700/80',
    'bg-white/92 border-zinc-300',
    'bg-sky-500 text-zinc-950 font-bold',
    'bg-sky-500 text-zinc-950 font-bold'
  ),
  'modern-spatial-vinyl-shelf': DEFAULT_MODERN_DOCK(
    'bg-[#1B1622]/85 border-white/15',
    'bg-white/90 border-zinc-200',
    'bg-rose-500 text-white shadow-md',
    'bg-rose-500 text-white shadow-md'
  ),
  'modern-brutalist-zine': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-condensed uppercase ${
        isDark
          ? 'bg-zinc-950 border-zinc-100 shadow-[5px_5px_0px_#f4f4f5]'
          : 'bg-white border-zinc-950 shadow-[5px_5px_0px_#09090b]'
      }`,
    itemBase: 'rounded-none border border-transparent',
    itemActive: () => 'bg-[#FF4D00] text-white font-black',
    itemInactive: (isDark) =>
      isDark
        ? 'text-zinc-200 hover:border-zinc-100'
        : 'text-zinc-950 hover:border-zinc-950',
    accentAction: () => 'bg-[#FF4D00] text-white font-black',
  },
  'modern-karaoke-stage': DEFAULT_MODERN_DOCK(
    'bg-[#0C181C]/88 border-teal-500/30',
    'bg-white/92 border-teal-200',
    'bg-teal-500 text-zinc-950 font-bold',
    'bg-teal-600 text-white font-bold'
  ),
  'modern-car-hud': {
    container: (isDark) =>
      `rounded-2xl border-2 px-2 py-1.5 shadow-2xl ${
        isDark
          ? 'bg-[#0B0F17]/95 border-blue-500/40'
          : 'bg-white/95 border-zinc-400'
      }`,
    itemBase: 'rounded-xl font-condensed font-bold',
    itemActive: () => 'bg-blue-600 text-white shadow-md',
    itemInactive: (isDark) =>
      isDark
        ? 'text-zinc-200 hover:bg-zinc-800'
        : 'text-zinc-900 hover:bg-zinc-100',
    accentAction: () => 'bg-blue-600 text-white shadow-md',
  },
  'modern-zen-minimal': {
    container: (isDark) =>
      `rounded-full border px-2 py-1.5 backdrop-blur-md shadow-lg ${
        isDark
          ? 'bg-[#1D1D1E]/90 border-zinc-700'
          : 'bg-[#F4F3EF]/95 border-zinc-300'
      }`,
    itemBase: 'rounded-full',
    itemActive: () => 'bg-[#E85D04] text-white font-semibold',
    itemInactive: (isDark) =>
      isDark
        ? 'text-zinc-300 hover:bg-zinc-800'
        : 'text-zinc-700 hover:bg-zinc-200/70',
    accentAction: (isDark) =>
      isDark ? 'bg-[#F4F3EF] text-zinc-950 font-semibold' : 'bg-zinc-900 text-white font-semibold',
  },
  'modern-cyber-sampler': RETRO_MECHANICAL_DOCK(
    'bg-[#1D1E22]/95 border-zinc-600 font-mono-tech',
    'bg-[#EAEAEF]/95 border-zinc-400 font-mono-tech',
    'bg-rose-500 text-white border-rose-600 font-bold',
    'bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700',
    'bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50'
  ),
  'modern-vinyl-liner': DEFAULT_MODERN_DOCK(
    'bg-[#18161E]/90 border-zinc-700',
    'bg-white/95 border-stone-300',
    'bg-violet-600 text-white font-semibold',
    'bg-violet-600 text-white font-semibold'
  ),
  'modern-spatial-glass': DEFAULT_MODERN_DOCK(
    'bg-slate-950/75 border-cyan-400/25',
    'bg-white/80 border-slate-300',
    'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_16px_rgba(6,182,212,0.4)]',
    'bg-cyan-500 text-slate-950 font-bold shadow-md'
  ),
  'modern-waveform-timeline': DEFAULT_MODERN_DOCK(
    'bg-[#121817]/92 border-emerald-900/70 font-mono-tech',
    'bg-white/95 border-zinc-300 font-mono-tech',
    'bg-emerald-500 text-zinc-950 font-bold',
    'bg-emerald-600 text-white font-bold'
  ),
  'modern-fm-console': DEFAULT_MODERN_DOCK(
    'bg-[#1D1B1A]/95 border-zinc-700',
    'bg-[#F2EFEA]/95 border-stone-300',
    'bg-orange-600 text-white font-bold',
    'bg-orange-600 text-white font-bold'
  ),
  'modern-kinetic-poster': {
    container: (isDark) =>
      `rounded-none border-2 px-2 py-1.5 font-condensed shadow-2xl ${
        isDark
          ? 'bg-[#121215]/95 border-zinc-600'
          : 'bg-white/95 border-zinc-900'
      }`,
    itemBase: 'rounded-none',
    itemActive: () => 'bg-[#E11D48] text-white font-black',
    itemInactive: (isDark) =>
      isDark
        ? 'text-zinc-300 hover:bg-zinc-800'
        : 'text-zinc-900 hover:bg-zinc-100',
    accentAction: () => 'bg-[#E11D48] text-white font-black',
  },
  'modern-ambient-cinema': DEFAULT_MODERN_DOCK(
    'bg-black/88 border-amber-500/30',
    'bg-stone-100/95 border-stone-300',
    'bg-amber-500 text-zinc-950 font-bold',
    'bg-amber-500 text-zinc-950 font-bold'
  ),
  'modern-tactile-sculpted': {
    container: (isDark) =>
      `rounded-3xl px-2 py-2 ${
        isDark
          ? 'bg-[#1D202A] shadow-[8px_8px_18px_#101218,-8px_-8px_18px_#2A2E3C]'
          : 'bg-[#EBEEF5] shadow-[8px_8px_18px_#C6CBD6,-8px_-8px_18px_#FFFFFF]'
      }`,
    itemBase: 'rounded-2xl',
    itemActive: (isDark) =>
      isDark
        ? 'bg-indigo-600 text-white shadow-md'
        : 'bg-indigo-600 text-white shadow-md',
    itemInactive: (isDark) =>
      isDark
        ? 'text-slate-300 hover:bg-white/5'
        : 'text-slate-700 hover:bg-black/5',
    accentAction: () => 'bg-indigo-600 text-white shadow-md',
  },
  'modern-nordic-catalog': DEFAULT_MODERN_DOCK(
    'bg-[#131817]/92 border-zinc-700',
    'bg-white/95 border-zinc-200',
    'bg-teal-700 text-white font-semibold',
    'bg-teal-700 text-white font-semibold'
  ),
};

export function ThemedDock({ uiId, activeTab, onSelectTab, inline = false }: ThemedDockProps) {
  const isEmbedded = useIsEmbeddedPlayer();
  const themeMode = useAppStore((s) => s.themeMode);
  const toggleThemeMode = useAppStore((s) => s.toggleThemeMode);
  const setUISwitcherOpen = useAppStore((s) => s.setUISwitcherOpen);
  const offlineCount = useAppStore((s) => s.offlineTracks.length);

  if (isEmbedded) return null;

  const isDark = themeMode === 'dark';
  const spec =
    DOCK_THEMES[uiId] ||
    DEFAULT_MODERN_DOCK(
      'bg-zinc-900/90 border-white/15',
      'bg-white/95 border-zinc-200',
      'bg-indigo-600 text-white',
      'bg-indigo-600 text-white'
    );

  const tactileMotion =
    'group relative flex flex-col items-center justify-center gap-0.5 min-h-[46px] px-1 py-1 cursor-pointer select-none transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:scale-[1.04] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

  const navItems: Array<{
    id: DockTab;
    label: string;
    icon: typeof Home;
    badge?: number;
  }> = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    {
      id: 'library',
      label: 'Baixadas',
      icon: FolderDown,
      badge: offlineCount > 0 ? offlineCount : undefined,
    },
    { id: 'ai', label: 'IA', icon: Sparkles },
  ];

  const navNode = (
    <nav
      aria-label="Dock de navegação"
      data-dock-ui={uiId}
      className={`pointer-events-auto grid grid-cols-7 gap-1 sm:gap-1.5 items-center ${spec.container(
        isDark
      )}`}
    >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`${tactileMotion} ${spec.itemBase} ${
                active ? spec.itemActive(isDark) : spec.itemInactive(isDark)
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-150 group-hover:scale-110 group-active:scale-90" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-emerald-500 text-[9px] font-mono-tech font-bold text-zinc-950 flex items-center justify-center leading-none tabular-nums">
                    {item.badge > 99 ? '99' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium leading-none whitespace-nowrap truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* UI Switcher */}
        <button
          type="button"
          onClick={() => setUISwitcherOpen(true)}
          aria-label={`Trocar Interface (${UI_CATALOG.length} UIs)`}
          className={`${tactileMotion} ${spec.itemBase} ${spec.accentAction(isDark)}`}
        >
          <Layers className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-150 group-hover:scale-110 group-active:scale-90" />
          <span className="text-[9px] sm:text-[10px] font-bold leading-none whitespace-nowrap">
            {UI_CATALOG.length} UIs
          </span>
        </button>

        {/* Light / Dark Mode */}
        <button
          type="button"
          onClick={toggleThemeMode}
          data-theme-toggle="true"
          aria-label={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          className={`${tactileMotion} ${spec.itemBase} ${spec.itemInactive(isDark)}`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-400 transition-transform duration-150 group-hover:rotate-12 group-active:scale-90" />
          ) : (
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-indigo-600 transition-transform duration-150 group-hover:-rotate-12 group-active:scale-90" />
          )}
          <span className="text-[9px] sm:text-[10px] font-medium leading-none whitespace-nowrap">
            {isDark ? 'Claro' : 'Escuro'}
          </span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          aria-current={activeTab === 'settings' ? 'page' : undefined}
          aria-label="Ajustes"
          className={`${tactileMotion} ${spec.itemBase} ${
            activeTab === 'settings' ? spec.itemActive(isDark) : spec.itemInactive(isDark)
          }`}
        >
          <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-150 group-hover:rotate-45 group-active:scale-90" />
          <span className="text-[9px] sm:text-[10px] font-medium leading-none whitespace-nowrap">
            Ajustes
          </span>
        </button>
    </nav>
  );

  if (inline) return navNode;

  return (
    <div className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] max-w-2xl pb-[env(safe-area-inset-bottom)] pointer-events-none">
      {navNode}
    </div>
  );
}
