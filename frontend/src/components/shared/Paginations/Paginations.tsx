
import Button from "../../ui/Button/Button";
import styles from "./Paginations.module.css";
import type { PaginationsProps } from "./Paginations.types";

// Renders a simple pagination control composed with shared Button variants.
export default function Paginations({
  className,
  currentPage,
  totalPages = 3,
  onPageChange,
}: PaginationsProps) {
  const paginationClassName = [styles.pagination, className]
    .filter(Boolean)
    .join(" ");

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className={paginationClassName} aria-label="Post pagination">
      <Button
        variant="pagination"
        className={styles.firstButton}
        onClick={() => {
          if (typeof currentPage === "number") {
            onPageChange?.(Math.max(1, currentPage - 1));
          }
        }}
      >
        Previous
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant="pagination"
          className={styles.pageButton}
          aria-current={
            typeof currentPage === "number" && page === currentPage
              ? "page"
              : undefined
          }
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="pagination"
        className={styles.pageButton}
        onClick={() => {
          if (typeof currentPage === "number") {
            onPageChange?.(Math.min(totalPages, currentPage + 1));
          }
        }}
      >
        Next
      </Button>
    </nav>
  );
}
