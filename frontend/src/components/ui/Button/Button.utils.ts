import { BadgeType, type ButtonVariant } from "./Button.types";
import styles from "./Button.module.css";

export function factoryButtonStyle(
  variant: ButtonVariant,
): string {
  switch (variant) {
    case "pagination":
      return styles.paginationButton;
    case "badge":
      return styles.badgeButton;
    case "secondary":
      return styles.secondaryButton;
    case "primary":
    default:
      return styles.primaryButton;
  }
}

export function factoryBadgeColor(
  badgeType: BadgeType = BadgeType.EVENT,
): string {
  switch (badgeType) {
    case BadgeType.NEWS:
      return styles.badgeNews;
    case BadgeType.DISCUSSION:
      return styles.badgeDiscussion;
    case BadgeType.ALERT:
      return styles.badgeAlert;
    case BadgeType.EVENT:
    default:
      return styles.badgeEvent;
  }
}

export function joinButtonClassName(
  ...classNames: Array<string | undefined>
): string {
  return classNames.filter(Boolean).join(" ");
}
