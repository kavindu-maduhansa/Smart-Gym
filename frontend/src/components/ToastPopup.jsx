import { createPortal } from "react-dom";

const STYLES = {
  success:
    "border-green-500/45 bg-green-50 text-green-900 dark:border-green-500/35 dark:bg-green-950/85 dark:text-green-100",
  error:
    "border-red-500/45 bg-red-50 text-red-900 dark:border-red-500/35 dark:bg-red-950/60 dark:text-red-100",
  info: "border-blue-500/45 bg-blue-50 text-blue-900 dark:border-blue-500/35 dark:bg-blue-950/50 dark:text-blue-100",
};

/**
 * Fixed top-center notification; portaled to document.body for z-index above nav.
 * @param {{ type: string, message: string } | null} toast
 */
export default function ToastPopup({ toast, onDismiss }) {
  if (!toast?.message) return null;

  const type = toast.type === "error" || toast.type === "success" ? toast.type : "info";
  const panel = STYLES[type] || STYLES.info;

  return createPortal(
    <div
      className="pointer-events-none fixed left-1/2 top-20 z-[10000] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 px-0"
      role="alert"
      aria-live="polite"
    >
      <div className="pointer-events-auto animate-toast-in rounded-xl border border-slate-200/80 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-slate-600/80 dark:bg-slate-900/95">
        <div className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${panel}`}>
          <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg px-2 py-0.5 text-lg font-bold leading-none text-current opacity-70 transition hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
