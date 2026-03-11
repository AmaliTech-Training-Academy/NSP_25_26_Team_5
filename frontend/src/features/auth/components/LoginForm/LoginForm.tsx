import Button from "../../../../components/ui/Button/Button";
import Input from "../../../../components/ui/Input/Input";
import LockIcon from "../../../../assets/Icons/LockIcon";
import MailIcon from "../../../../assets/Icons/MailIcon";
import PasswordVisibilityButton from "../../../../assets/Icons/PasswordVisibilityIcon";

import type { LoginFormProps } from "./LoginForm.types";
import styles from "./LoginForm.module.css";
import { Link } from "react-router";
import { usePasswordVisibility } from "../../hooks/usePasswordVisibility";

// Renders the login form fields and call-to-action controls.
export default function LoginForm({
  email,
  password,
  error,
  emailError,
  passwordError,
  isSubmitting,
  handleSubmit,
  onEmailChange,
  onPasswordChange,
}: LoginFormProps) {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const passwordVisibilityButtonClassName = passwordError
    ? `${styles.iconButton} ${styles.iconButtonError}`
    : styles.iconButton;

  return (
    <form className={styles.formSection} onSubmit={handleSubmit} noValidate>
      <div className={styles.inputGroup}>
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
            id="login-email"
            aria-describedby={emailError ? "login-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
          />
          {emailError && (
            <p id="login-email-error" className={styles.fieldError} role="alert">
              {emailError}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            leftIcon={<LockIcon />}
            hasError={Boolean(passwordError)}
            id="login-password"
            aria-describedby={passwordError ? "login-password-error" : undefined}
            aria-invalid={Boolean(passwordError)}
            rightIcon={
              <PasswordVisibilityButton
                className={passwordVisibilityButtonClassName}
                showPassword={showPassword}
                onToggle={togglePasswordVisibility}
              />
            }
          />
          {passwordError && (
            <p
              id="login-password-error"
              className={styles.fieldError}
              role="alert"
            >
              {passwordError}
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
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>

        <p className={styles.signupText}>
          Don&apos;t have an account?
          <Link to="/register" className={styles.signupLink}>
            Create one now
          </Link>
        </p>
      </div>
    </form>
  );
}
