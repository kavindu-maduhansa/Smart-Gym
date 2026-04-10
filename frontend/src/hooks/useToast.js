import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Auto-dismissing toast state. Types: "success" | "error" | "info".
 */
export function useToast(defaultDurationMs = 4800) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (type, message, durationMs = defaultDurationMs) => {
      if (!message) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ type, message });
      if (durationMs != null && durationMs > 0) {
        timerRef.current = window.setTimeout(hideToast, durationMs);
      }
    },
    [defaultDurationMs, hideToast],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, showToast, hideToast };
}
