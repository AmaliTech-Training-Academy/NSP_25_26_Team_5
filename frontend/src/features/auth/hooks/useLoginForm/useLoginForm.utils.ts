import { isAxiosError } from "axios";
import { BackendErrorPayload } from "./useLoginForm.types";

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

export const mapLoginErrorMessage = (caughtError: unknown): string => {
  if (!isAxiosError(caughtError)) {
    return "Login failed. Please try again.";
  }

  if (!caughtError.response) {
    return "Unable to reach the server. Check your connection and try again.";
  }

  const backendMessage = extractBackendMessage(caughtError.response.data);
  const normalizedMessage = backendMessage?.toLowerCase() ?? "";

  if (caughtError.response.status === 401 || caughtError.response.status === 403) {
    return "Invalid email or password";
  }

  if (
    normalizedMessage.includes("invalid credential") ||
    normalizedMessage.includes("invalid email or password")
  ) {
    return "Invalid email or password";
  }

  if (caughtError.response.status >= 500) {
    return backendMessage ?? "Server error. Please try again shortly.";
  }

  return backendMessage ?? "Login failed. Please check your details and try again.";
};
