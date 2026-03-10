
import type { BadgeType } from "../../../components/ui/Button/Button.types";

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PostPayload {
  title: string;
  content: string;
  categoryId: number | string | null;
}

export type CategoryLabel =
  | "News"
  | "Event"
  | "Discussion"
  | "Alert";

export interface CategoryData {
  badgeLabel: CategoryLabel;
  badgeType?: BadgeType;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  categoryName: string | null;
  categoryId: number | null;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export interface PostComment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface ApiErrorPayload {
  message?: string;
  error?: string;
}
