import { BadgeType } from "../../../../components/ui/Button/Button.types";

export interface CreatePostCategoryOption {
  label: string;
  value: BadgeType;
  categoryId: number;
}

export const CREATE_POST_CATEGORIES: CreatePostCategoryOption[] = [
  { label: "NEWS", value: BadgeType.NEWS, categoryId: 1 },
  { label: "EVENT", value: BadgeType.EVENT, categoryId: 2 },
  { label: "DISCUSSION", value: BadgeType.DISCUSSION, categoryId: 3 },
  { label: "ALERT", value: BadgeType.ALERT, categoryId: 4 },
];

export function findCreatePostCategoryLabel(category: BadgeType): string {
  return (
    CREATE_POST_CATEGORIES.find((option) => option.value === category)?.label ?? ""
  );
}

export function findCreatePostCategoryId(category: BadgeType): number | null {
  return (
    CREATE_POST_CATEGORIES.find((option) => option.value === category)?.categoryId ??
    null
  );
}

export function joinCreatePostModalClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
