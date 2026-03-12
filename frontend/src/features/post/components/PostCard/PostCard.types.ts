import type { BadgeType } from "../../../../components/ui/Button/Button.types";

export interface PostCardData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  writerName: string;
  authorEmail: string;
  categoryName: string | null;
  time: string;
  commentsCount: number;
  badgeLabel: string;
  badgeType?: BadgeType;
  canManage?: boolean;
}

export interface PostCardProps {
  post: PostCardData;
  className?: string;
  canManage?: boolean;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}
