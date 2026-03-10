import { BadgeType } from "../../../../components/ui/Button/Button.types";
import type { EditPostFormErrors } from "./EditPostModal.types";

export interface EditPostCategoryOption {
  label: string;
  value: BadgeType;
  categoryId: number;
}

export const EDIT_POST_CATEGORIES: EditPostCategoryOption[] = [
  { label: "News", value: BadgeType.NEWS, categoryId: 1 },
  { label: "Event", value: BadgeType.EVENT, categoryId: 2 },
  { label: "Discussion", value: BadgeType.DISCUSSION, categoryId: 3 },
  { label: "Alert", value: BadgeType.ALERT, categoryId: 4 },
];

export function findEditPostCategoryLabel(category: BadgeType): string {
  return (
    EDIT_POST_CATEGORIES.find((option) => option.value === category)?.label ?? ""
  );
}

export function findEditPostCategoryId(category: BadgeType): number {
  return (
    EDIT_POST_CATEGORIES.find((option) => option.value === category)?.categoryId ??
    1
  );
}

// Validates edit-post form values and returns field-level errors.
export function validateEditPostForm(
  title: string,
  body: string,
  selectedCategory: BadgeType | null,
): EditPostFormErrors {
  const errors: EditPostFormErrors = {};

  if (title.trim().length === 0) {
    errors.title = "Title is required.";
  }

  if (body.trim().length === 0) {
    errors.body = "Body is required.";
  }

  if (!selectedCategory) {
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
