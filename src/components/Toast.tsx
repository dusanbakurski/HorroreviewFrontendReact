import { useToast } from '../context/ToastContext';

export default function Toast() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => {
        const style =
          t.kind === 'error'
            ? 'bg-red-950/95 border-red-800 text-red-100'
            : t.kind === 'success'
              ? 'bg-emerald-950/95 border-emerald-800 text-emerald-100'
              : 'bg-zinc-900/95 border-zinc-700 text-zinc-100';
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 border rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-right-4 ${style}`}
          >
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-zinc-400 hover:text-zinc-200 text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
