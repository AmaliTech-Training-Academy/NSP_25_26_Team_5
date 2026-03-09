import PingLogoIcon from "../../../../assets/Icons/PingLogoIcon";
import RegisterForm from "../RegisterForm/RegisterForm";
import type { RegisterCardProps } from "./RegisterCard.types";
import styles from "./RegisterCard.module.css";

export default function RegisterCard({
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
}: RegisterCardProps) {
  return (
    <section className={styles.registerCard}>
      <div className={styles.registerCardContent}>
        <header className={styles.headerSection}>
          <div className={styles.logo} aria-label="Ping">
            <PingLogoIcon
              className={styles.logoSvg}
              role="img"
              aria-label="Ping"
            />
          </div>

          <div className={styles.titleGroup}>
            <h1 className={styles.title}>Join the Community</h1>
            <p className={styles.subtitle}>Create an account to get started</p>
          </div>
        </header>

        <RegisterForm
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          error={error}
          nameError={nameError}
          emailError={emailError}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          onNameChange={onNameChange}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
          onConfirmPasswordChange={onConfirmPasswordChange}
        />
      </div>
    </section>
  );
}
