import { X } from 'lucide-react';
import {
  AiGeneratorPanel,
  LibraryPanel,
  SearchPanel,
  SettingsStoragePanel,
} from '../../components/SectionPanels';
import { ThemeToggleButton } from '../../components/ThemeToggleButton';
import { useAppStore } from '../../stores/useAppStore';
import { useIsEmbeddedPlayer } from './PlayerEmbedContext';

export type UtilitySheetType = 'search' | 'library' | 'ai' | 'settings' | null;

interface UtilitySheetProps {
  sheet: UtilitySheetType;
  onClose: () => void;
  light?: boolean;
}

export function UtilitySheet({ sheet, onClose }: UtilitySheetProps) {
  const isEmbedded = useIsEmbeddedPlayer();
  const themeMode = useAppStore((s) => s.themeMode);
  if (isEmbedded || !sheet) return null;

  const isLight = themeMode === 'light';

  const titles: Record<Exclude<UtilitySheetType, null>, string> = {
    search: 'Buscar Músicas',
    library: 'Biblioteca & Baixadas',
    ai: 'Gerador IA',
    settings: 'Ajustes & Cache',
  };

  return (
    <div
      className="fixed inset-0 z-35 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-6 pb-28 sm:pb-28"
      role="dialog"
      aria-modal="true"
      aria-label={titles[sheet]}
    >
      <div
        className={`w-full max-w-2xl max-h-[78vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl mx-2 sm:mx-0 ${
          isLight
            ? 'bg-stone-50 text-zinc-900 border-zinc-300'
            : 'bg-zinc-950 text-zinc-100 border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-current/10">
          <span className="text-sm font-display font-bold">{titles[sheet]}</span>
          <div className="flex items-center gap-2">
            <ThemeToggleButton compact />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-current/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 thin-scroll">
          {sheet === 'search' && <SearchPanel light={isLight} />}
          {sheet === 'library' && <LibraryPanel light={isLight} />}
          {sheet === 'ai' && <AiGeneratorPanel light={isLight} />}
          {sheet === 'settings' && <SettingsStoragePanel light={isLight} />}
        </div>
      </div>
    </div>
  );
}
