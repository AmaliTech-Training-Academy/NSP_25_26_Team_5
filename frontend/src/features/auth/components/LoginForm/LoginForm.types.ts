import type { FormEvent } from "react";

export interface LoginFormProps {
  email: string;
  password: string;
  error?: string;
  emailError?: string;
  passwordError?: string;
  isSubmitting?: boolean;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}
