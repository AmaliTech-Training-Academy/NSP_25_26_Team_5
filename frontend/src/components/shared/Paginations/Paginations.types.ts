export interface PaginationsProps {
  className?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}
