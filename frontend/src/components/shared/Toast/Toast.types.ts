export type ToastVariant = "success" | "error";

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs?: number;
}

export interface ToastProps {
  toast: ToastData;
  onDismiss?: (toastId: string) => void;
}
