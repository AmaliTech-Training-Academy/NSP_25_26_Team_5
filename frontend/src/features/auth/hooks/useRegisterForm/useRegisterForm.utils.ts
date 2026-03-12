import { isAxiosError } from "axios";
import { BackendErrorPayload } from "./useRegisterForm.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_LETTER_PATTERN = /[A-Z]/;
const LOWERCASE_LETTER_PATTERN = /[a-z]/;
const NUMBER_PATTERN = /\d/;
const SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*]/;
const WHITESPACE_PATTERN = /\s/;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value);
export const hasUppercaseLetter = (value: string): boolean =>
  UPPERCASE_LETTER_PATTERN.test(value);
export const hasLowercaseLetter = (value: string): boolean =>
  LOWERCASE_LETTER_PATTERN.test(value);
export const hasNumber = (value: string): boolean => NUMBER_PATTERN.test(value);
export const hasSpecialCharacter = (value: string): boolean =>
  SPECIAL_CHARACTER_PATTERN.test(value);
export const hasWhitespace = (value: string): boolean =>
  WHITESPACE_PATTERN.test(value);

export interface PasswordRequirementState {
  id:
    | "min-length"
    | "uppercase"
    | "lowercase"
    | "number"
    | "special-character"
    | "spaces";
  label: string;
  isMet: boolean;
}

export function getPasswordRequirementStates(
  value: string,
): PasswordRequirementState[] {
  return [
    {
      id: "min-length",
      label: "Password must be at least 8 characters long",
      isMet: value.length >= 8,
    },
    {
      id: "uppercase",
      label: "Password must contain at least one uppercase letter (A-Z)",
      isMet: hasUppercaseLetter(value),
    },
    {
      id: "lowercase",
      label: "Password must contain at least one lowercase letter (a-z)",
      isMet: hasLowercaseLetter(value),
    },
    {
      id: "number",
      label: "Password must contain at least one number (0-9)",
      isMet: hasNumber(value),
    },
    {
      id: "special-character",
      label: "Password must contain at least one special character (!@#$%^&*)",
      isMet: hasSpecialCharacter(value),
    },
    {
      id: "spaces",
      label: "Password cannot contain spaces",
      isMet: !hasWhitespace(value),
    },
  ];
}

export function findPasswordValidationError(value: string): string {
  if (!value) {
    return "Password field can't be empty";
  }

  const unmetRequirement = getPasswordRequirementStates(value).find(
    (requirement) => !requirement.isMet,
  );

  return unmetRequirement?.label ?? "";
}

const extractBackendMessage = (payload: unknown): string | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    const candidate = payload as BackendErrorPayload;
    return candidate.message ?? candidate.error ?? candidate.detail ?? null;
  }

  return null;
};

export const mapRegisterErrorMessage = (caughtError: unknown): string => {
  if (!isAxiosError(caughtError)) {
    return "Registration failed. Please try again.";
  }

  if (!caughtError.response) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  const backendMessage = extractBackendMessage(caughtError.response.data);
  const normalizedMessage = backendMessage?.toLowerCase() ?? "";

  if (caughtError.response.status === 409) {
    return "An account with this email already exists.";
  }

  if (
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("already in use")
  ) {
    return "An account with this email already exists.";
  }

  if (caughtError.response.status >= 500) {
    return backendMessage ?? "Server error. Please try again shortly.";
  }

  return backendMessage ?? "Registration failed. Please check your details and try again.";
};
