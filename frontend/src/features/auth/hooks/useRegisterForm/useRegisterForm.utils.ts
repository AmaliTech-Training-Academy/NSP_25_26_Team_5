import { isAxiosError } from "axios";
import { BackendErrorPayload } from "./useRegisterForm.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value);

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
