import type { FormEvent } from "react";

export interface RegisterCardProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  error?: string;
  nameError?: string;
  emailError?: string;
  passwordError?: string;
  confirmPasswordError?: string;
  isSubmitting?: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}
