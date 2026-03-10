import type { PostCardData } from "../PostCard/PostCard.types";

export interface PostListProps {
  posts: PostCardData[];
  className?: string;
  showPostActions?: boolean;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}
