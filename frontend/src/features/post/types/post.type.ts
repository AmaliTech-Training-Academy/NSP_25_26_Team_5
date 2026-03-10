
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
  categoryId: number | string | null;}

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
