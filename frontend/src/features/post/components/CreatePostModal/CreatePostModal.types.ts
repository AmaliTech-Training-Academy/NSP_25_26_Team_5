import type { PostCategoryOption } from "../../types/post.type";

export interface CreatePostFormValues {
  title: string;
  body: string;
  categoryId: number;
}

export interface CreatePostFormErrors {
  title?: string;
  body?: string;
  category?: string;
}

export interface CreatePostModalProps {
  className?: string;
  categoryOptions: PostCategoryOption[];
  isLoadingCategories?: boolean;
  categoriesErrorMessage?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreatePost?: (values: CreatePostFormValues) => Promise<void> | void;
}
