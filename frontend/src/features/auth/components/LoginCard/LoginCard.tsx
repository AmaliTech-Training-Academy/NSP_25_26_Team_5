import styles from "./LoginCard.module.css";
import PingLogoIcon from "../../../../assets/Icons/PingLogoIcon";
import { LoginCardProps } from "./LoginCard.types";
import LoginForm from "../LoginForm/LoginForm";

export default function LoginCard({
  email,
  password,
  error,
  emailError,
  passwordError,
  isSubmitting,
  handleSubmit,
  onEmailChange,
  onPasswordChange,
}: LoginCardProps) {
  return (
    <section className={styles.loginCard}>
      <div className={styles.loginCardContent}>
        <header className={styles.headerSection}>
          <div className={styles.logo} aria-label="Ping">
            <PingLogoIcon
              className={styles.logoSvg}
              role="img"
              aria-label="Ping"
            />
          </div>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>
              Sign in to your neighborhood community
            </p>
          </div>
        </header>

        <LoginForm
          email={email}
          password={password}
          error={error}
          emailError={emailError}
          passwordError={passwordError}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
        />
      </div>
    </section>
  );
}
