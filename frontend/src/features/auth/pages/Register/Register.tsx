import RegisterCard from "../../components/RegisterCard/RegisterCard";
import { useRegisterForm } from "../../hooks/useRegisterForm/useRegisterForm";
import styles from "./Register.module.css";

export default function Register() {
  const {
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
    onNameChange,
    onEmailChange,
    onPasswordChange,
    onConfirmPasswordChange,
    handleSubmit,
  } = useRegisterForm();

  return (
    <main className={styles.registerLayout}>
      <RegisterCard
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
    </main>
  );
}
