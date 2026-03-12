import type { PostCardData } from "../PostCard/PostCard.types";

export interface PostListProps {
  posts: PostCardData[];
  className?: string;
  showPostActions?: boolean;
  onEditPost?: (post: PostCardData) => void;
  onDeletePost?: (post: PostCardData) => void;
}
