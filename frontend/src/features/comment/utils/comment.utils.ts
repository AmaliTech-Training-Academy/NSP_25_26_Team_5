import axios from "axios";
import type { Comment } from "../types/comment.types";

export const MAX_COMMENT_LENGTH = 500;

export function joinCommentsSectionClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}

export function sortCommentsOldestFirst(comments: Comment[]): Comment[] {
  return [...comments].sort(
    (leftComment, rightComment) =>
      new Date(leftComment.createdAt).getTime() -
      new Date(rightComment.createdAt).getTime(),
  );
}

export function getCommentAuthorInitials(authorName: string): string {
  const parts = authorName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatCommentTimestamp(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Just now";
  }

  const elapsedMilliseconds = Date.now() - parsedDate.getTime();
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000));

  if (elapsedSeconds < 60) {
    return "Just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `About ${elapsedHours} hr${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}

export function validateCommentContent(content: string): string | null {
  const trimmedContent = content.trim();

  if (trimmedContent.length === 0) {
    return "Comment cannot be empty.";
  }

  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    return `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`;
  }

  return null;
}

export function canManageComment(
  comment: Comment,
  currentUserName?: string | null,
  currentUserEmail?: string | null,
  currentUserRole?: string | null,
): boolean {
  const normalizedRole = currentUserRole?.trim().toUpperCase();

  if (normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN") {
    return true;
  }

  const normalizedUserEmail = currentUserEmail?.trim().toLowerCase();
  const normalizedCommentEmail = comment.authorEmail?.trim().toLowerCase();

  if (
    normalizedUserEmail &&
    normalizedCommentEmail &&
    normalizedUserEmail === normalizedCommentEmail
  ) {
    return true;
  }

  const normalizedUserName = currentUserName?.trim().toLowerCase();
  const normalizedCommentAuthor = comment.authorName.trim().toLowerCase();

  return Boolean(
    normalizedUserName && normalizedUserName === normalizedCommentAuthor,
  );
}

export function findCommentRequestErrorMessage(
  error: unknown,
  fallbackMessage: string,
  unauthorizedMessage = fallbackMessage,
  notFoundMessage = fallbackMessage,
): string {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const payload = responseData as { message?: string; error?: string };

      if (typeof payload.message === "string" && payload.message.trim().length > 0) {
        return payload.message;
      }

      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error;
      }
    }

    if (statusCode === 401 || statusCode === 403) {
      return unauthorizedMessage;
    }

    if (statusCode === 404) {
      return notFoundMessage;
    }
  }

  return fallbackMessage;
}
