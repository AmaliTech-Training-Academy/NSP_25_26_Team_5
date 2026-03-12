import { BadgeType } from "../../ui/Button/Button.types";
import type { FilterOption } from "./FilterBar.types";

export const FILTER_OPTIONS: FilterOption[] = [
  { label: "All", value: "ALL" },
  { label: "Event", value: BadgeType.EVENT },
  { label: "Alert", value: BadgeType.ALERT },
  { label: "Discussion", value: BadgeType.DISCUSSION },
  { label: "News", value: BadgeType.NEWS },
];

export function joinFilterBarClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
