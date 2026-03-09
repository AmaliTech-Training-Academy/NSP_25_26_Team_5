import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "badge" | "pagination";

export enum BadgeType {
  NEWS = "NEWS",
  EVENT = "EVENT",
  DISCUSSION = "DISCUSSION",
  ALERT = "ALERT",
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  badgeType?: BadgeType;
}
