import { useEffect, useId, type MouseEvent as ReactMouseEvent } from "react";
import CloseIcon from "../../../../assets/Icons/CloseIcon";
import styles from "./PostImageModal.module.css";
import type { PostImageModalProps } from "./PostImageModal.types";

export default function PostImageModal({
  authorName,
  description,
  imageUrl,
  isOpen,
  onClose,
  title,
}: PostImageModalProps) {
  const titleId = useId();

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscapeKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscapeKeyDown);

    return () => {
      document.removeEventListener("keydown", handleEscapeKeyDown);
    };
  }, [isOpen, onClose]);

  function handleBackdropMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={handleBackdropMouseDown}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.modalHeader}>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close post image"
            onClick={onClose}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.imageFrame}>
          <img className={styles.image} src={imageUrl} alt={title} />
        </div>

        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>

          <div className={styles.authorBlock}>
            <p className={styles.authorLabel}>Posted by</p>
            <p className={styles.authorName}>{authorName}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
