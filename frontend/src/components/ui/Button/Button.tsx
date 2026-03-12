import type { ButtonProps } from "./Button.types";
import {
  factoryBadgeColor,
  factoryButtonStyle,
  joinButtonClassName,
} from "./Button.utils";

export default function Button({
  children,
  variant = "primary",
  badgeType,
  className,
  type = "button",
  ...buttonProps
}: ButtonProps) {
  const variantClass = factoryButtonStyle(variant);
  const badgeColorClass =
    variant === "badge" ? factoryBadgeColor(badgeType) : undefined;
  const buttonClassName = joinButtonClassName(
    variantClass,
    badgeColorClass,
    className,
  );

  return (
    <button type={type} className={buttonClassName} {...buttonProps}>
      {children}
    </button>
  );
}
