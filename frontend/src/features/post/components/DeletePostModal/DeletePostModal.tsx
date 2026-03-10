import { useEffect, type MouseEvent as ReactMouseEvent } from "react";
import Trash2Icon from "../../../../assets/Icons/Trash2Icon";
import Button from "../../../../components/ui/Button/Button";
import styles from "./DeletePostModal.module.css";
import type { DeletePostModalProps } from "./DeletePostModal.types";

// Renders a confirmation popup before permanently deleting a post.
export default function DeletePostModal({
  className,
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeletePostModalProps) {
  const overlayClassName = [styles.overlay, className].filter(Boolean).join(" ");

  // Locks body scrolling while the confirmation dialog is visible.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Allows keyboard users to dismiss the dialog with Escape.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscapeKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscapeKeyDown);

    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
  }, [isDeleting, isOpen, onClose]);

  // Closes the dialog when the backdrop itself is clicked.
  function handleBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && !isDeleting) {
      onClose();
    }
  }

  // Confirms the delete action through the parent callback.
  async function handleConfirm() {
    if (!onConfirm) {
      return;
    }

    await onConfirm();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={overlayClassName} role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-title"
        aria-describedby="delete-post-description"
      >
        <div className={styles.content}>
          <h2 id="delete-post-title" className={styles.title}>
            Delete Post
          </h2>
          <p id="delete-post-description" className={styles.description}>
            Are you sure you want to delete this post?
          </p>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.actionRow}>
          <Button
            type="button"
            variant="secondary"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className={styles.deleteButton}
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            <span className={styles.deleteButtonContent}>
              <Trash2Icon className={styles.deleteIcon} />
              <span>{isDeleting ? "Deleting..." : "Delete"}</span>
            </span>
          </Button>
        </div>
      </section>
    </div>
  );
}
