import type { BadgeType } from "../../../../components/ui/Button/Button.types";

export interface CreatePostFormValues {
  title: string;
  body: string;
  category: BadgeType;
}

export interface CreatePostFormErrors {
  title?: string;
  body?: string;
  category?: string;
}

export interface CreatePostModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreatePost?: (values: CreatePostFormValues) => Promise<void> | void;
}
