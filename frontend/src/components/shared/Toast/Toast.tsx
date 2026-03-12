import CheckIcon from "../../../assets/Icons/CheckIcon";
import CloseIcon from "../../../assets/Icons/CloseIcon";
import styles from "./Toast.module.css";
import type { ToastProps } from "./Toast.types";

function joinToastClassName(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

// Renders a dismissible success or error toast.
export default function Toast({ toast, onDismiss }: ToastProps) {
  const isSuccessToast = toast.variant === "success";
  const LeadingIcon = isSuccessToast ? CheckIcon : CloseIcon;

  return (
    <div
      className={joinToastClassName(
        styles.toast,
        isSuccessToast ? styles.successToast : styles.errorToast,
      )}
      role={isSuccessToast ? "status" : "alert"}
      aria-live={isSuccessToast ? "polite" : "assertive"}
    >
      <div
        className={joinToastClassName(
          styles.iconWrapper,
          isSuccessToast ? styles.successIconWrapper : styles.errorIconWrapper,
        )}
      >
        <LeadingIcon className={styles.icon} />
      </div>

      <div className={styles.content}>
        <p
          className={joinToastClassName(
            styles.message,
            isSuccessToast ? styles.successMessage : styles.errorMessage,
          )}
        >
          {toast.message}
        </p>

        <button
          type="button"
          className={joinToastClassName(
            styles.dismissButton,
            isSuccessToast
              ? styles.successDismissButton
              : styles.errorDismissButton,
          )}
          aria-label="Dismiss notification"
          onClick={() => onDismiss?.(toast.id)}
        >
          <CloseIcon className={styles.dismissIcon} />
        </button>
      </div>
    </div>
  );
}
