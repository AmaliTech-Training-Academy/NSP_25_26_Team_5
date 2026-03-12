import { PostCardData } from "../PostCard/PostCard.types";

export interface PostFeedProps {
  posts: PostCardData[];
  showPostActions?: boolean;
  onEditPost?: (post: PostCardData) => void;
  onDeletePost?: (post: PostCardData) => void;
}
