export interface DeletePostModalProps {
  className?: string;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}
