import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface ThemeToggleButtonProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggleButton({ className = '', compact = false }: ThemeToggleButtonProps) {
  const themeMode = useAppStore((s) => s.themeMode);
  const toggleThemeMode = useAppStore((s) => s.toggleThemeMode);
  const isDark = themeMode === 'dark';

  return (
    <button
      type="button"
      onClick={toggleThemeMode}
      data-theme-toggle="true"
      aria-label={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
      title={isDark ? 'Modo Claro' : 'Modo Escuro'}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-current/15 hover:bg-current/10 transition-colors min-h-[38px] ${
        compact ? 'w-[38px] px-0' : 'px-3 text-xs font-medium'
      } ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
      {!compact && <span>{isDark ? 'Claro' : 'Escuro'}</span>}
    </button>
  );
}
