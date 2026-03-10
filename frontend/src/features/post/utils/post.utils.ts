import axios from "axios";
import { ApiErrorPayload } from "../types/post.type";

// Resolves readable create-post error text for backend and network failures.
export function findCreatePostErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const payload = responseData as ApiErrorPayload;

      if (typeof payload.message === "string" && payload.message.trim().length > 0) {
        return payload.message;
      }

      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error;
      }
    }

    if (statusCode === 401 || statusCode === 403) {
      return "You are not authorized to create a post. Please sign in again.";
    }
  }

  return "Unable to create your post right now. Please try again.";
}
