import type { BadgeType } from "../../../../components/ui/Button/Button.types";
import type { PostCardData } from "../PostCard/PostCard.types";

export interface EditPostFormValues {
  postId: string;
  title: string;
  body: string;
  category: BadgeType;
  categoryId: number;
}

export interface EditPostFormErrors {
  title?: string;
  body?: string;
  category?: string;
}

export interface EditPostModalProps {
  className?: string;
  isOpen: boolean;
  post: PostCardData | null;
  onClose: () => void;
  onEditPost?: (values: EditPostFormValues) => Promise<void> | void;
}
