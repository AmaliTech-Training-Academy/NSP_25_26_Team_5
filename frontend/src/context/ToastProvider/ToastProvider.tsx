import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import Toast from "../../components/shared/Toast";
import { ToastContext } from "../ToastContext/ToastContext";
import type { ToastData } from "../../components/shared/Toast";
import type { ShowToastOptions } from "../ToastContext/ToastContext.type";
import type { ToastProviderProps } from "./ToastProvider.type";
import styles from "./ToastProvider.module.css";

const DEFAULT_TOAST_DURATION_MS = 4000;

function joinToastViewportClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}

function findToastId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return String(Date.now() + Math.random());
}

// Hosts the global toast queue and renders the fixed viewport.
export function ToastProvider({ children }: ToastProviderProps) {
  const location = useLocation();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timerIdsRef = useRef<Map<string, number>>(new Map());
  const hasNavOffset =
    location.pathname !== "/login" && location.pathname !== "/register";

  function dismissToast(toastId: string) {
    const timerId = timerIdsRef.current.get(toastId);

    if (timerId) {
      window.clearTimeout(timerId);
      timerIdsRef.current.delete(toastId);
    }

    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== toastId),
    );
  }

  function showToast(options: ShowToastOptions): string {
    const toastId = findToastId();
    const nextToast: ToastData = {
      id: toastId,
      message: options.message,
      variant: options.variant,
      durationMs: options.durationMs ?? DEFAULT_TOAST_DURATION_MS,
    };

    setToasts((previousToasts) => [...previousToasts, nextToast]);

    const timerId = window.setTimeout(() => {
      dismissToast(toastId);
    }, nextToast.durationMs);

    timerIdsRef.current.set(toastId, timerId);

    return toastId;
  }

  useEffect(() => {
    return () => {
      timerIdsRef.current.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timerIdsRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      dismissToast,
      showToast,
      toasts,
    }),
    [toasts],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className={joinToastViewportClassName(
          styles.viewport,
          hasNavOffset ? styles.withNavOffset : undefined,
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
