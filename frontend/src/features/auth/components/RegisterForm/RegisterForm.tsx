import type { RegisterFormProps } from "./RegisterForm.types";
import styles from "./RegisterForm.module.css";
import { Link } from "react-router";
import Input from "../../../../components/ui/Input/Input";
import MailIcon from "../../../../assets/Icons/MailIcon";
import LockIcon from "../../../../assets/Icons/LockIcon";
import PasswordVisibilityButton from "../../../../assets/Icons/PasswordVisibilityIcon";
import Button from "../../../../components/ui/Button/Button";
import { usePasswordVisibility } from "../../hooks/usePasswordVisibility";

const PASSWORD_REQUIREMENTS_TEXT =
  "Minimum of 8 characters and at least 1 special character";
const PASSWORD_SPECIAL_CHARACTER_TEXT = "Include at least 1 special character";

// Renders the register form fields and call-to-action controls.
export default function RegisterForm({
  name,
  email,
  password,
  confirmPassword,
  error,
  nameError,
  emailError,
  passwordError,
  confirmPasswordError,
  isSubmitting,
  handleSubmit,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: RegisterFormProps) {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const {
    showPassword: showConfirmPassword,
    togglePasswordVisibility: toggleConfirmPasswordVisibility,
  } = usePasswordVisibility();
  const passwordVisibilityButtonClassName = passwordError
    ? `${styles.iconButton} ${styles.iconButtonError}`
    : styles.iconButton;
  const confirmPasswordVisibilityButtonClassName = confirmPasswordError
    ? `${styles.iconButton} ${styles.iconButtonError}`
    : styles.iconButton;
  const normalizedPasswordError = passwordError?.toLowerCase() ?? "";
  const hasMinimumLengthViolation =
    normalizedPasswordError.includes("at least 8 characters") ||
    normalizedPasswordError.includes("minimum of 8 characters");
  const hasSpecialCharacterViolation =
    normalizedPasswordError.includes("special character");
  const shouldHighlightPasswordHint =
    hasMinimumLengthViolation || hasSpecialCharacterViolation;
  const passwordHintText =
    hasMinimumLengthViolation || hasSpecialCharacterViolation
      ? hasMinimumLengthViolation
        ? PASSWORD_REQUIREMENTS_TEXT
        : PASSWORD_SPECIAL_CHARACTER_TEXT
      : PASSWORD_REQUIREMENTS_TEXT;
  const shouldShowPasswordFieldError =
    Boolean(passwordError) && !shouldHighlightPasswordHint;
  const passwordHintClassName = shouldHighlightPasswordHint
    ? `${styles.passwordHint} ${styles.passwordHintError}`
    : styles.passwordHint;

  return (
    <form className={styles.formSection} onSubmit={handleSubmit} noValidate>
      <div className={styles.inputGroup}>
        <div className={styles.field}>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g., John Doe"
            autoComplete="name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            leftIcon={<MailIcon />}
            hasError={Boolean(nameError)}
            id="register-name"
            aria-describedby={nameError ? "register-name-error" : undefined}
            aria-invalid={Boolean(nameError)}
          />
          {nameError && (
            <p id="register-name-error" className={styles.fieldError} role="alert">
              {nameError}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <Input
            label="Email"
            type="email"
            placeholder="your@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            leftIcon={<MailIcon />}
            hasError={Boolean(emailError)}
            id="register-email"
            aria-describedby={emailError ? "register-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
          />
          {emailError && (
            <p
              id="register-email-error"
              className={styles.fieldError}
              role="alert"
            >
              {emailError}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            leftIcon={<LockIcon />}
            hasError={Boolean(passwordError)}
            id="register-password"
            aria-describedby={
              shouldShowPasswordFieldError
                ? "register-password-hint register-password-error"
                : "register-password-hint"
            }
            aria-invalid={Boolean(passwordError)}
            rightIcon={
              <PasswordVisibilityButton
                className={passwordVisibilityButtonClassName}
                showPassword={showPassword}
                onToggle={togglePasswordVisibility}
              />
            }
          />
          {shouldShowPasswordFieldError && (
            <p
              id="register-password-error"
              className={styles.fieldError}
              role="alert"
            >
              {passwordError}
            </p>
          )}
        </div>

        <p
          id="register-password-hint"
          className={passwordHintClassName}
          role={shouldHighlightPasswordHint ? "alert" : undefined}
        >
          {passwordHintText}
        </p>

        <div className={styles.field}>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Enter password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => onConfirmPasswordChange(event.target.value)}
            leftIcon={<LockIcon />}
            hasError={Boolean(confirmPasswordError)}
            id="register-confirm-password"
            aria-describedby={
              confirmPasswordError ? "register-confirm-password-error" : undefined
            }
            aria-invalid={Boolean(confirmPasswordError)}
            rightIcon={
              <PasswordVisibilityButton
                className={confirmPasswordVisibilityButtonClassName}
                showPassword={showConfirmPassword}
                onToggle={toggleConfirmPasswordVisibility}
              />
            }
          />
          {confirmPasswordError && (
            <p
              id="register-confirm-password-error"
              className={styles.fieldError}
              role="alert"
            >
              {confirmPasswordError}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className={styles.errorText} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actionSection}>
        <Button
          variant="primary"
          type="submit"
          className={styles.registerButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>

        <p className={styles.loginText}>
          Already have an account?
          <Link to="/login" className={styles.loginLink}>
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
}
