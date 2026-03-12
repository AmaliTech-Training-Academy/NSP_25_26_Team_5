import LoginCard from "../../components/LoginCard/LoginCard";
import { useLoginForm } from "../../hooks/useLoginForm/useLoginForm";
import styles from "./Login.module.css";

export default function Login() {
  const {
    email,
    password,
    error,
    emailError,
    passwordError,
    isSubmitting,
    onEmailChange,
    onPasswordChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <main className={styles.loginLayout}>
      <LoginCard
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
    </main>
  );
}
