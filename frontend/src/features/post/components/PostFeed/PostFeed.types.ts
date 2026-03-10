import { PostCardData } from "../PostCard/PostCard.types";

export interface PostFeedProps {
  posts: PostCardData[];
  showPostActions?: boolean;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}
