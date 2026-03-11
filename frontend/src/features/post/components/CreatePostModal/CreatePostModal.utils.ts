import { BadgeType } from "../../../../components/ui/Button/Button.types";
import type { CreatePostFormErrors } from "./CreatePostModal.types";

export const TITLE_MAX_LENGTH = 100;
export const TITLE_WARNING_THRESHOLD = 90;

export interface CreatePostCategoryOption {
  label: string;
  value: BadgeType;
}

export const CREATE_POST_CATEGORIES: CreatePostCategoryOption[] = [
  { label: "News", value: BadgeType.NEWS },
  { label: "Event", value: BadgeType.EVENT },
  { label: "Discussion", value: BadgeType.DISCUSSION },
  { label: "Alert", value: BadgeType.ALERT },
];

export function findCreatePostCategoryLabel(category: BadgeType): string {
  return (
    CREATE_POST_CATEGORIES.find((option) => option.value === category)?.label ?? ""
  );
}

// Validates modal form values and returns field-level error messages.
export function validateCreatePostForm(
  title: string,
  body: string,
  selectedCategory: BadgeType | null,
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

  if (!selectedCategory) {
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
