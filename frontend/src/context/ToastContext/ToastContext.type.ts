import type { ToastData, ToastVariant } from "../../components/shared/Toast";

export interface ShowToastOptions {
  durationMs?: number;
  message: string;
  variant: ToastVariant;
}

export interface ToastContextValue {
  dismissToast: (toastId: string) => void;
  showToast: (options: ShowToastOptions) => string;
  toasts: ToastData[];
}
