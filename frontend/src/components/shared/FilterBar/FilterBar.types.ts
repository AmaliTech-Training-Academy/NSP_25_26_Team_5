import type { BadgeType } from "../../ui/Button/Button.types";

export type FilterCategory = "ALL" | BadgeType;

export interface FilterOption {
  label: string;
  value: FilterCategory;
}

export interface FilterBarProps {
  className?: string;
  activeCategory?: FilterCategory;
  onCategoryChange?: (category: FilterCategory) => void;
}
