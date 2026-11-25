import { useState } from 'react';
import { Check, Disc, Heart, Layers, Smartphone, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { UI_CATALOG, type UICategory } from '../types/music';
import { ThemeToggleButton } from './ThemeToggleButton';

type FilterTab = 'all' | UICategory | 'kawaii';

export function UISwitcherModal() {
  const isOpen = useAppStore((s) => s.isUISwitcherOpen);
  const activeUI = useAppStore((s) => s.activeUI);
  const themeMode = useAppStore((s) => s.themeMode);
  const setActiveUI = useAppStore((s) => s.setActiveUI);
  const setOpen = useAppStore((s) => s.setUISwitcherOpen);
  const [filter, setFilter] = useState<FilterTab>('all');

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const filtered =
    filter === 'all'
      ? UI_CATALOG
      : filter === 'kawaii'
        ? UI_CATALOG.filter((u) => u.isKawaii)
        : UI_CATALOG.filter((u) => u.category === filter);

  const ipodCount = UI_CATALOG.filter((u) => u.category === 'ipod').length;
  const retroCount = UI_CATALOG.filter((u) => u.category === 'retro').length;
  const kawaiiCount = UI_CATALOG.filter((u) => u.isKawaii).length;
  const modernCount = UI_CATALOG.filter((u) => u.category === 'modern').length;

  const categoryLabel: Record<UICategory, string> = {
    ipod: 'iPod Custom OS',
    retro: 'Retrô Animada',
    modern: 'Moderna Criativa',
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Seletor de ${UI_CATALOG.length} Interfaces`}
    >
      <div
        data-lg-surface="true"
        className={`w-full max-w-5xl max-h-[88vh] border rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-colors ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-stone-50 border-zinc-300 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between gap-3 px-5 py-4 border-b ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="min-w-0">
            <h2 className="text-lg font-display font-bold truncate">
              {UI_CATALOG.length} Interfaces Exclusivas
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Carregamento sob demanda via React.lazy — todas compatíveis com Modo Claro e Escuro
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggleButton />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar seletor de interfaces"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div
          className={`flex items-center gap-2 px-5 py-3 border-b overflow-x-auto ${
            isDark ? 'border-zinc-800/80' : 'border-zinc-200'
          }`}
        >
          {[
            { id: 'all', label: `Todas (${UI_CATALOG.length})`, icon: Layers },
            { id: 'ipod', label: `iPods Custom (${ipodCount})`, icon: Smartphone },
            { id: 'retro', label: `Retrô (${retroCount})`, icon: Disc },
            { id: 'kawaii', label: `Fofinhas (${kawaiiCount})`, icon: Heart },
            { id: 'modern', label: `Modernas (${modernCount})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as FilterTab)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[40px] ${
                  active
                    ? isDark
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-900 text-white'
                    : isDark
                      ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      : 'bg-zinc-200/80 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 thin-scroll">
          {filtered.map((ui, idx) => {
            const isSelected = ui.id === activeUI;
            return (
              <button
                key={ui.id}
                type="button"
                onClick={() => setActiveUI(ui.id)}
                className={`group text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 min-h-[124px] ${
                  isSelected
                    ? isDark
                      ? 'border-white bg-zinc-900 ring-1 ring-white/40'
                      : 'border-zinc-900 bg-white ring-1 ring-zinc-900/20 shadow-sm'
                    : isDark
                      ? 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900'
                      : 'border-zinc-200 bg-white hover:border-zinc-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-lg shrink-0 border border-black/15 dark:border-white/15 flex items-center justify-center text-[11px] font-mono-tech font-bold"
                      style={{ backgroundColor: ui.bgHex, color: ui.accentHex }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div
                        className={`text-sm font-semibold leading-tight flex items-center gap-1.5 ${
                          isDark ? 'text-white' : 'text-zinc-950'
                        }`}
                      >
                        <span>{ui.name}</span>
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {categoryLabel[ui.category]}
                        {ui.isKawaii ? ' · Fofinha' : ''}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-emerald-500 shrink-0" aria-label="Interface ativa">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div>
                  <p className={`text-xs font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {ui.tagline}
                  </p>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {ui.layoutStyle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
