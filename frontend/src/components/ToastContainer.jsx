import Icon from './Icon';

export default function ToastContainer({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-50 grid justify-items-center gap-2.5 sm:inset-x-auto sm:right-5 sm:left-auto sm:top-5" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex w-[min(380px,calc(100vw-1.5rem))] items-center gap-3 rounded-[22px] border border-white/25 bg-[#1c1c1e]/90 px-3.5 py-3 text-white shadow-[0_12px_35px_rgba(0,0,0,0.24)] backdrop-blur-xl animate-[toast-in_0.25s_ease-out]" role="status">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25d366] text-white shadow-inner shadow-black/10"><Icon name="chat" size={21} strokeWidth={2.3} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3"><strong className="truncate text-sm font-semibold">{toast.title}</strong><span className="shrink-0 text-[11px] text-white/60">now</span></div>
            <p className="mt-0.5 truncate text-[13px] leading-5 text-white/80">{toast.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
