import styles from "./PostImageField.module.css";
import type { PostImageFieldProps } from "./PostImageField.types";

export default function PostImageField({
  inputId,
  isDisabled = false,
  isUploading = false,
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
            accept="image/*"
            disabled={isDisabled}
            onChange={onFileChange}
          />
          <span>{previewUrl ? "Change image" : "Upload image"}</span>
        </label>

        {previewUrl && onClearSelection && (
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

      {previewUrl && (
        <div className={styles.previewCard}>
          <img className={styles.previewImage} src={previewUrl} alt="Post image preview" />
        </div>
      )}
    </div>
  );
}
