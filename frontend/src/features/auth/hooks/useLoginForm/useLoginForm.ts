import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../../context/AuthContext/AuthContext";
import { useToast } from "../../../../context/ToastContext/ToastContext";
import { authApi as authAPI } from "../../api/auth.api";
import { isValidEmail, mapLoginErrorMessage } from "./useLoginForm.utils";


export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    setEmailError("");
    setPasswordError("");
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    setError("");
    setEmailError("");
    setPasswordError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const nextEmailError = !trimmedEmail
      ? "Email can't be empty"
      : !isValidEmail(trimmedEmail)
        ? "Please enter a valid email address"
        : "";
    const nextPasswordError = !trimmedPassword
      ? "Password field can't be empty"
      : "";

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authAPI.login({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      login(
        {
          name: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
        },
        res.data.token,
      );
      showToast({
        variant: "success",
        message: "Authenticated successfully",
      });
      navigate("/");
    } catch (caughtError: unknown) {
      setError(mapLoginErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    password,
    error,
    emailError,
    passwordError,
    isSubmitting,
    onEmailChange,
    onPasswordChange,
    handleSubmit,
  };
}
