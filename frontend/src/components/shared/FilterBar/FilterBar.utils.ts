import { BadgeType } from "../../ui/Button/Button.types";
import type { FilterOption } from "./FilterBar.types";

export const FILTER_OPTIONS: FilterOption[] = [
  { label: "All", value: "ALL" },
  { label: "Events", value: BadgeType.EVENT },
  { label: "Lost & Found", value: BadgeType.ALERT },
  { label: "Recommendations", value: BadgeType.DISCUSSION },
  { label: "Help Requests", value: BadgeType.NEWS },
];

export function joinFilterBarClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
