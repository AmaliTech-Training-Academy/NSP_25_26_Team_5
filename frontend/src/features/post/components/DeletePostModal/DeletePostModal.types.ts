export interface DeletePostModalProps {
  className?: string;
  confirmLabel?: string;
  description?: string;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  title?: string;
}
