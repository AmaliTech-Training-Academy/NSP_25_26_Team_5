import type { PostCardData } from "../../features/post/components/PostCard/PostCard.types";
import type { Post } from "../../features/post/types/post.type";
import { findCategoryData, formatRelativeTime } from "../../features/post/utils/post.utils";

const API_TIMESTAMP_WITHOUT_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

function normalizePostTimestamp(value: string): string {
  return API_TIMESTAMP_WITHOUT_OFFSET.test(value) ? `${value}Z` : value;
}

// Maps API post payloads to the post-card shape consumed by the home feed.
export function mapPostToCardData(post: Post): PostCardData {
  const categoryData = findCategoryData(post.categoryName);

  return {
    id: String(post.id),
    title: post.title,
    content: post.body,
    imageUrl: post.imageUrl ?? null,
    writerName: post.authorName,
    authorEmail: post.authorEmail,
    categoryName: post.categoryName,
    time: formatRelativeTime(normalizePostTimestamp(post.createdAt)),
    commentsCount: post.commentCount,
    badgeLabel: categoryData.badgeLabel,
    badgeType: categoryData.badgeType,
  };
}
