import { useEffect, useRef, useState } from "react";
import { POST_IMAGE_ACCEPT_ATTRIBUTE } from "../../utils/post.utils";
import styles from "./PostImageField.module.css";
import type { PostImageFieldProps } from "./PostImageField.types";

const PREVIEW_MAX_DIMENSION = 1600;

function drawPreviewToCanvas(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to render image preview.");
  }

  const largestSourceDimension = Math.max(sourceWidth, sourceHeight);
  const scale =
    largestSourceDimension > PREVIEW_MAX_DIMENSION
      ? PREVIEW_MAX_DIMENSION / largestSourceDimension
      : 1;
  const canvasWidth = Math.max(1, Math.round(sourceWidth * scale));
  const canvasHeight = Math.max(1, Math.round(sourceHeight * scale));

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.drawImage(source, 0, 0, canvasWidth, canvasHeight);
}

function PostImageCanvasPreview({ file }: { file: File }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPreviewError, setHasPreviewError] = useState(false);

  useEffect(() => {
    let isDisposed = false;

    async function renderPreview() {
      if (!canvasRef.current) {
        return;
      }

      setHasPreviewError(false);

      try {
        if ("createImageBitmap" in window) {
          const imageBitmap = await createImageBitmap(file);

          if (isDisposed) {
            imageBitmap.close();
            return;
          }

          drawPreviewToCanvas(
            canvasRef.current,
            imageBitmap,
            imageBitmap.width,
            imageBitmap.height,
          );
          imageBitmap.close();
          return;
        }

        const fileReader = new FileReader();

        fileReader.onload = () => {
          if (isDisposed || typeof fileReader.result !== "string") {
            return;
          }

          const image = new Image();

          image.onload = () => {
            if (isDisposed || !canvasRef.current) {
              return;
            }

            drawPreviewToCanvas(
              canvasRef.current,
              image,
              image.naturalWidth,
              image.naturalHeight,
            );
          };

          image.onerror = () => {
            if (!isDisposed) {
              setHasPreviewError(true);
            }
          };

          image.src = fileReader.result;
        };

        fileReader.onerror = () => {
          if (!isDisposed) {
            setHasPreviewError(true);
          }
        };

        fileReader.readAsDataURL(file);
      } catch {
        if (!isDisposed) {
          setHasPreviewError(true);
        }
      }
    }

    void renderPreview();

    return () => {
      isDisposed = true;
    };
  }, [file]);

  if (hasPreviewError) {
    return (
      <p className={styles.errorText} role="alert">
        Unable to render an image preview for this file.
      </p>
    );
  }

  return <canvas ref={canvasRef} className={styles.previewImage} aria-label="Post image preview" />;
}

export default function PostImageField({
  inputId,
  isDisabled = false,
  isUploading = false,
  previewFile = null,
  previewUrl = null,
  statusText = null,
  errorMessage,
  onFileChange,
  onClearSelection,
}: PostImageFieldProps) {
  const uploadButtonClassName = [
    styles.uploadButton,
    isDisabled ? styles.uploadButtonDisabled : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <div className={styles.header}>
        <label className={styles.label} htmlFor={inputId}>
          Post Image
        </label>
        <p className={styles.hint}>Optional. PNG, JPG, or WebP up to 5 MB.</p>
      </div>

      <div className={styles.actions}>
        <label className={uploadButtonClassName} htmlFor={inputId}>
          <input
            id={inputId}
            className={styles.fileInput}
            type="file"
            accept={POST_IMAGE_ACCEPT_ATTRIBUTE}
            disabled={isDisabled}
            onChange={onFileChange}
          />
          <span>{previewFile || previewUrl ? "Change image" : "Upload image"}</span>
        </label>

        {(previewFile || previewUrl) && onClearSelection && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearSelection}
            disabled={isDisabled}
          >
            Clear selection
          </button>
        )}
      </div>

      {statusText && <p className={styles.statusText}>{statusText}</p>}
      {isUploading && <p className={styles.uploadingText}>Uploading image...</p>}
      {errorMessage && (
        <p className={styles.errorText} role="alert">
          {errorMessage}
        </p>
      )}

      {(previewFile || previewUrl) && (
        <div className={styles.previewCard}>
          {previewFile ? (
            <PostImageCanvasPreview file={previewFile} />
          ) : (
            <img className={styles.previewImage} src={previewUrl ?? undefined} alt="Post image preview" />
          )}
        </div>
      )}
    </div>
  );
}
