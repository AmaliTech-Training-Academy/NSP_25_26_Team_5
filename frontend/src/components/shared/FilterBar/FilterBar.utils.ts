import { BadgeType } from "../Button/Button.types";
import type { FilterOption } from "./FilterBar.types";

export const FILTER_OPTIONS: FilterOption[] = [
  { label: "All", value: "ALL" },
  { label: "News", value: BadgeType.NEWS },
  { label: "Events", value: BadgeType.EVENT },
  { label: "Discussion", value: BadgeType.DISCUSSION },
  { label: "Alert", value: BadgeType.ALERT },
];

export function joinFilterBarClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
