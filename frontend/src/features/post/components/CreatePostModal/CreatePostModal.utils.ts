import type { PostCategoryOption } from "../../types/post.type";
import type { CreatePostFormErrors } from "./CreatePostModal.types";

export const TITLE_MAX_LENGTH = 100;
export const TITLE_WARNING_THRESHOLD = 90;

export function findCreatePostCategoryLabel(
  categoryOptions: PostCategoryOption[],
  categoryId: number,
): string {
  return (
    categoryOptions.find((category) => category.categoryId === categoryId)?.label ?? ""
  );
}

// Validates modal form values and returns field-level error messages.
export function validateCreatePostForm(
  title: string,
  body: string,
  selectedCategoryId: number | null,
): CreatePostFormErrors {
  const errors: CreatePostFormErrors = {};

  if (title.trim().length === 0) {
    errors.title = "Title is required.";
  } else if (title.trim().length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or less.`;
  }

  if (body.trim().length === 0) {
    errors.body = "Body is required.";
  }

  if (selectedCategoryId === null) {
    errors.category = "Please select a category.";
  }

  return errors;
}

// Resolves a user-facing message for unexpected create-post failures.
export function findCreatePostErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "We couldn't create your post right now. Please try again.";
}

export function joinCreatePostModalClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
