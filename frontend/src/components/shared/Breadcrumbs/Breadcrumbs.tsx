
import ChevronRightIcon from "../../../assets/Icons/ChevronRightIcon";
import styles from "./Breadcrumbs.module.css";
import type { BreadcrumbsProps } from "./Breadcrumbs.types";
import { joinBreadcrumbsClassName } from "./Breadcrumbs.utils";

// Renders an inline breadcrumb trail with optional clickable steps.
export default function Breadcrumbs({
  className,
  ariaLabel = "Breadcrumb",
  items,
}: BreadcrumbsProps) {
  const breadcrumbClassName = joinBreadcrumbsClassName(styles.breadcrumbs, className);

  return (
    <nav className={breadcrumbClassName} aria-label={ariaLabel}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.id} className={styles.item}>
              {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}

              {item.onClick ? (
                <button type="button" className={styles.itemButton} onClick={item.onClick}>
                  {item.label}
                </button>
              ) : (
                <p className={styles.itemLabel}>{item.label}</p>
              )}

              {!isLast && <ChevronRightIcon className={styles.separator} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
