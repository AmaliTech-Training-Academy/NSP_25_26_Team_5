import type { PostCardData } from "../../features/post/components/PostCard/PostCard.types";
import type { Post } from "../../features/post/types/post.type";
import { findCategoryData, formatRelativeTime } from "../../features/post/utils/post.utils";

// Maps API post payloads to the post-card shape consumed by the home feed.
export function mapPostToCardData(post: Post): PostCardData {
  const categoryData = findCategoryData(post.categoryName);

  return {
    id: String(post.id),
    title: post.title,
    content: post.body,
    writerName: post.authorName,
    time: formatRelativeTime(post.createdAt),
    commentsCount: post.commentCount,
    badgeLabel: categoryData.badgeLabel,
    badgeType: categoryData.badgeType,
  };
}
