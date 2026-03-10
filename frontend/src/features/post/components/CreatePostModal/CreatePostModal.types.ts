import type { BadgeType } from "../Button/Button.types";

export interface CreatePostFormValues {
  title: string;
  details: string;
  category: BadgeType;
  categoryLabel: string;
}

export interface CreatePostModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreatePost?: (values: CreatePostFormValues) => void;
}
