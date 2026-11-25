import { useEffect } from 'react';
import { CheckCircle2, Crown, ShieldCheck, X } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export function YouTubePremiumModal() {
  const isOpen = useAppStore((s) => s.isYtPremiumModalOpen);
  const setOpen = useAppStore((s) => s.setYtPremiumModalOpen);
  const ytPremiumSession = useAppStore((s) => s.preferences.ytPremiumSession);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const setStatusBanner = useAppStore((s) => s.setStatusBanner);
  const themeMode = useAppStore((s) => s.themeMode);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleToggleSession = (enable: boolean) => {
    updatePreferences({ ytPremiumSession: enable });
    setStatusBanner(
      enable
        ? 'Sessão YouTube Premium ativada para o player integrado'
        : 'Sessão YouTube Premium encerrada'
    );
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sessão YouTube Premium"
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        data-lg-surface="true"
        className={`w-full max-w-lg rounded-t-2xl sm:rounded-2xl border overflow-hidden shadow-2xl ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-stone-50 border-zinc-300 text-zinc-900'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-display font-bold">Sessão YouTube Premium</h2>
              <p className="text-[11px] opacity-70">
                Persistência de cookies no WebView (Android APK & Navegador)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar modal YouTube Premium"
            className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center hover:bg-current/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs leading-relaxed">
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'
            }`}
          >
            <div className="font-semibold flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Como funciona a sessão integrada</span>
            </div>
            <p className="opacity-80">
              Ao conectar sua conta Google via OAuth e habilitar o modo de sessão persistente, o
              YouTube IFrame Player e o WebView do Android (Capacitor CookieManager) aproveitam seus
              cookies de assinante Premium para remover anúncios e liberar streaming em alta qualidade.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleToggleSession(true)}
              className="flex-1 h-11 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {ytPremiumSession
                  ? 'Manter Sessão Premium Ativa'
                  : 'Ativar Sessão YouTube Premium'}
              </span>
            </button>
            {ytPremiumSession && (
              <button
                type="button"
                onClick={() => handleToggleSession(false)}
                className="h-11 px-4 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-semibold"
              >
                Desativar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
