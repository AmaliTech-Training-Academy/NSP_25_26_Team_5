import type { PostCategoryOption } from "../../types/post.type";
import type { EditPostFormErrors } from "./EditPostModal.types";

export function findEditPostCategoryLabel(
  categoryOptions: PostCategoryOption[],
  categoryId: number,
): string {
  return (
    categoryOptions.find((category) => category.categoryId === categoryId)?.label ?? ""
  );
}

// Validates edit-post form values and returns field-level errors.
export function validateEditPostForm(
  title: string,
  body: string,
  selectedCategoryId: number | null,
): EditPostFormErrors {
  const errors: EditPostFormErrors = {};

  if (title.trim().length === 0) {
    errors.title = "Title is required.";
  }

  if (body.trim().length === 0) {
    errors.body = "Body is required.";
  }

  if (selectedCategoryId === null) {
    errors.category = "Please select a category.";
  }

  return errors;
}

// Resolves a readable fallback for failed edit operations.
export function findEditPostErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to update this post right now. Please try again.";
}

export function joinEditPostModalClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
