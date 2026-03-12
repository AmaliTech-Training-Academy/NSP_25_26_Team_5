import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../../context/AuthContext/AuthContext";
import { useToast } from "../../../../context/ToastContext/ToastContext";
import {
  findPasswordValidationError,
  isValidEmail,
  mapRegisterErrorMessage,
} from "./useRegisterForm.utils";

export function useRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const clearFormErrors = () => {
    setError("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const onNameChange = (value: string) => {
    setName(value);
    clearFormErrors();
  };

  const onEmailChange = (value: string) => {
    setEmail(value);
    clearFormErrors();
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    clearFormErrors();
  };

  const onConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    clearFormErrors();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const nextPassword = password;
    const nextConfirmPassword = confirmPassword;

    const nextNameError = !trimmedName ? "Full name can't be empty" : "";
    const nextEmailError = !trimmedEmail
      ? "Email can't be empty"
      : !isValidEmail(trimmedEmail)
        ? "Please enter a valid email address"
        : "";
    const nextPasswordError = findPasswordValidationError(nextPassword);
    const nextConfirmPasswordError = !nextConfirmPassword
      ? "Confirm password can't be empty"
      : nextPassword !== nextConfirmPassword
        ? "Passwords do not match"
        : "";

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);

    if (
      nextNameError ||
      nextEmailError ||
      nextPasswordError ||
      nextConfirmPasswordError
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: trimmedName,
        email: trimmedEmail,
        password: nextPassword,
      });
      showToast({
        variant: "success",
        message: "Account created. Please log in.",
      });
      navigate("/login", { replace: true });
    } catch (caughtError: unknown) {
      setError(mapRegisterErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
