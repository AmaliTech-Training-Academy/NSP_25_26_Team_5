import { BadgeType } from "../../../../components/ui/Button/Button.types";

export interface CreatePostCategoryOption {
  label: string;
  value: BadgeType;
}

export const CREATE_POST_CATEGORIES: CreatePostCategoryOption[] = [
  { label: "Events", value: BadgeType.EVENT },
  { label: "Lost & Found", value: BadgeType.ALERT },
  { label: "Recommendations", value: BadgeType.DISCUSSION },
  { label: "Help Request", value: BadgeType.NEWS },
];

export function findCreatePostCategoryLabel(category: BadgeType): string {
  return (
    CREATE_POST_CATEGORIES.find((option) => option.value === category)?.label ?? ""
  );
}

export function joinCreatePostModalClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
