
import Button from "../../ui/Button/Button";
import styles from "./Paginations.module.css";
import type { PaginationsProps } from "./Paginations.types";

const MAX_VISIBLE_PAGE_BUTTONS = 3;

// Resolves the moving page-number window shown between previous and next.
function findVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const maxStartPage = totalPages - MAX_VISIBLE_PAGE_BUTTONS + 1;
  const startPage = Math.max(
    1,
    Math.min(currentPage - 1, maxStartPage),
  );

  return Array.from(
    { length: MAX_VISIBLE_PAGE_BUTTONS },
    (_, index) => startPage + index,
  );
}

// Renders a simple pagination control composed with shared Button variants.
export default function Paginations({
  className,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: PaginationsProps) {
  const paginationClassName = [styles.pagination, className]
    .filter(Boolean)
    .join(" ");
  const pages = findVisiblePages(currentPage, totalPages);
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <nav className={paginationClassName} aria-label="Post pagination">
      <Button
        variant="pagination"
        className={styles.firstButton}
        disabled={isPreviousDisabled}
        onClick={() => {
          onPageChange?.(Math.max(1, currentPage - 1));
        }}
      >
        Previous
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant="pagination"
          className={styles.pageButton}
          aria-current={page === currentPage ? "page" : undefined}
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="pagination"
        className={styles.pageButton}
        disabled={isNextDisabled}
        onClick={() => {
          onPageChange?.(Math.min(totalPages, currentPage + 1));
        }}
      >
        Next
      </Button>
    </nav>
  );
}
