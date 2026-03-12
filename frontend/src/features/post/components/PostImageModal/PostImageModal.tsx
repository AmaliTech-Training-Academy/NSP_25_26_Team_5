import {
  useEffect,
  useId,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import ClockIcon from "../../../../assets/Icons/ClockIcon";
import CloseIcon from "../../../../assets/Icons/CloseIcon";
import { useAuth } from "../../../../context/AuthContext/AuthContext";
import { apiClient } from "../../../../lib/axios/client";
import styles from "./PostImageModal.module.css";
import type { PostImageModalProps } from "./PostImageModal.types";

function extractImageFilename(imageUrl: string): string | null {
  try {
    const parsedUrl = new URL(
      imageUrl,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );
    const filename = parsedUrl.pathname.split("/").filter(Boolean).pop()?.trim();

    return filename ? filename : null;
  } catch {
    const filename = imageUrl.split("/").filter(Boolean).pop()?.split("?")[0]?.trim();
    return filename ? filename : null;
  }
}

export default function PostImageModal({
  authorName,
  description,
  imageUrl,
  isOpen,
  onClose,
  time,
  title,
}: PostImageModalProps) {
  const titleId = useId();
  const { isAuthenticated } = useAuth();
  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isOpen || !imageUrl) {
      setResolvedImageSrc(null);
      setIsLoadingImage(false);
      setImageErrorMessage(null);
      return;
    }

    if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
      setResolvedImageSrc(imageUrl);
      setIsLoadingImage(false);
      setImageErrorMessage(null);
      return;
    }

    let isDisposed = false;
    let objectUrl: string | null = null;
    const imageFilename = extractImageFilename(imageUrl);

    if (!imageFilename) {
      setImageErrorMessage("Unable to resolve this image right now.");
      setResolvedImageSrc(null);
      setIsLoadingImage(false);
      return;
    }

    const resolvedImageFilename = imageFilename;

    async function loadProtectedImage() {
      setIsLoadingImage(true);
      setImageErrorMessage(null);
      setResolvedImageSrc(null);

      try {
        const response = await apiClient.get(`/images/${encodeURIComponent(resolvedImageFilename)}`, {
          responseType: "blob",
        });
        const imageBlob = response.data as Blob;
        objectUrl = URL.createObjectURL(imageBlob);

        if (isDisposed) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          return;
        }

        setResolvedImageSrc(objectUrl);
      } catch {
        if (isDisposed) {
          return;
        }

        setImageErrorMessage(
          isAuthenticated
            ? "Unable to load this image right now."
            : "Sign in to view this image.",
        );
      } finally {
        if (!isDisposed) {
          setIsLoadingImage(false);
        }
      }
    }

    void loadProtectedImage();

    return () => {
      isDisposed = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl, isAuthenticated, isOpen]);

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

        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>

          <div className={styles.metaRow}>
            <p className={styles.authorName}>{authorName}</p>
            <div className={styles.timeGroup}>
              <ClockIcon className={styles.clockIcon} />
              <p className={styles.time}>{time}</p>
            </div>
          </div>
        </div>

        <div className={styles.imageFrame}>
          {isLoadingImage && (
            <p className={styles.statusMessage} role="status" aria-live="polite">
              Loading image...
            </p>
          )}

          {!isLoadingImage && imageErrorMessage && (
            <p className={styles.errorMessage} role="alert">
              {imageErrorMessage}
            </p>
          )}

          {!isLoadingImage && !imageErrorMessage && resolvedImageSrc && (
            <img className={styles.image} src={resolvedImageSrc} alt={title} />
          )}
        </div>
      </section>
    </div>
  );
}
