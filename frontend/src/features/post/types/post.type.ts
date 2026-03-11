
import type { Comment } from "../../comment/types/comment.types";
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
  body: string;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface PostCategoryOption {
  categoryId: number;
  label: CategoryLabel;
  badgeType: BadgeType;
  backendName: string;
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
  body: string;
  categoryName: string | null;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  comments?: Comment[];
}

export interface ApiErrorPayload {
  message?: string;
  error?: string;
}
