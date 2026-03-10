import type { BadgeType } from "../Button/Button.types";

export interface PostCardData {
  id: string;
  title: string;
  content: string;
  writerName: string;
  time: string;  // depend of how the data is structured from the Database
  commentsCount: number;
  badgeLabel: string;
  badgeType?: BadgeType;
}

export interface PostCardProps {
  post: PostCardData;
  className?: string;
}
