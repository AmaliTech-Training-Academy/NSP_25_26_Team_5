import type { ReactNode } from "react";

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  className?: string;
  ariaLabel?: string;
  items: BreadcrumbItem[];
}
