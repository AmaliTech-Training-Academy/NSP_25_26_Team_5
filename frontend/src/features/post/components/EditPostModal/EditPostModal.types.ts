import type { PostCardData } from "../PostCard/PostCard.types";
import type { PostCategoryOption } from "../../types/post.type";

export interface EditPostFormValues {
  postId: string;
  title: string;
  body: string;
  categoryId: number;
  imageUrl: string | null;
}

export interface EditPostFormErrors {
  title?: string;
  body?: string;
  category?: string;
  image?: string;
}

export interface EditPostModalProps {
  className?: string;
  categoryOptions: PostCategoryOption[];
  isLoadingCategories?: boolean;
  categoriesErrorMessage?: string | null;
  isOpen: boolean;
  post: PostCardData | null;
  onClose: () => void;
  onEditPost?: (values: EditPostFormValues) => Promise<void> | void;
}
