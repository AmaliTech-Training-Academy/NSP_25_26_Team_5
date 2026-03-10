import { BadgeType } from "../../components/ui/Button/Button.types";
import type { PostCardData } from "../../features/post/components/PostCard/PostCard.types";
import type { CategoryData, Post } from "../../features/post/types/post.type";

// Normalizes backend category strings into UI badge metadata.
export function findCategoryData(categoryName: string | null): CategoryData {
  const normalized = categoryName?.trim().toUpperCase();

  switch (normalized) {
    case BadgeType.EVENT:
    case "EVENTS":
      return { badgeLabel: "EVENT", badgeType: BadgeType.EVENT };
    case "TECH":
    case "RECOMMENDATIONS":
    case BadgeType.DISCUSSION:
      return { badgeLabel: "DISCUSSION", badgeType: BadgeType.DISCUSSION };
    case "HELP":
    case "HELP REQUEST":
    case "HELP REQUESTS":
    case "LOST & FOUND":
    case "LOST AND FOUND":
    case BadgeType.ALERT:
      return { badgeLabel: "ALERT", badgeType: BadgeType.ALERT };
    case BadgeType.NEWS:
    case "GENERAL":
      return { badgeLabel: "NEWS", badgeType: BadgeType.NEWS };
    default:
      return {
        badgeLabel: "NEWS",
        badgeType: BadgeType.NEWS,
      };
  }
}

// Formats timestamps into a short relative string for card metadata.
export function formatRelativeTime(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "just now";
  }

  const elapsedMilliseconds = Date.now() - parsedDate.getTime();
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000));

  if (elapsedSeconds < 60) {
    return "just now";
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}

// Maps API post payloads to the post-card shape consumed by the home feed.
export function mapPostToCardData(post: Post): PostCardData {
  const categoryData = findCategoryData(post.categoryName);

  return {
    id: String(post.id),
    title: post.title,
    content: post.content,
    writerName: post.authorName,
    time: formatRelativeTime(post.createdAt),
    commentsCount: post.commentCount,
    badgeLabel: categoryData.badgeLabel,
    badgeType: categoryData.badgeType,
  };
}
