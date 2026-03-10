import { BadgeType } from "../../ui/Button/Button.types";
import type { FilterOption } from "./FilterBar.types";

export const FILTER_OPTIONS: FilterOption[] = [
  { label: "All", value: "ALL" },
  { label: "NEWS", value: BadgeType.NEWS },
  { label: "EVENT", value: BadgeType.EVENT },
  { label: "DISCUSSION", value: BadgeType.DISCUSSION },
  { label: "ALERT", value: BadgeType.ALERT },
];

export function joinFilterBarClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
