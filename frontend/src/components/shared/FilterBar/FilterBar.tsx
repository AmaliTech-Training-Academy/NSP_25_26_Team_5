import Button from "../Button/Button";
import styles from "./FilterBar.module.css";
import type { FilterBarProps } from "./FilterBar.types";
import { FILTER_OPTIONS, joinFilterBarClassName } from "./FilterBar.utils";

export default function FilterBar({
  className,
  activeCategory = "ALL",
  onCategoryChange,
}: FilterBarProps) {
  const filterBarClassName = joinFilterBarClassName(styles.filterBar, className);

  return (
    <section className={filterBarClassName} aria-label="Post categories filter">
      <p className={styles.label}>Categories:</p>

      <div className={styles.filters}>
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.value === activeCategory;

          return (
            <Button
              key={option.value}
              variant="badge"
              className={joinFilterBarClassName(
                styles.filterButton,
                isActive ? styles.filterButtonActive : undefined,
              )}
              onClick={() => onCategoryChange?.(option.value)}
              aria-pressed={isActive}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
