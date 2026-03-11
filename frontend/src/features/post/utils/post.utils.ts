import axios from "axios";
import { BadgeType } from "../../../components/ui/Button/Button.types";
import type {
  ApiErrorPayload,
  Category,
  CategoryData,
  PostCategoryOption,
} from "../types/post.type";

interface PostCategoryConfig {
  label: PostCategoryOption["label"];
  badgeType: BadgeType;
  backendNames: string[];
}

const POST_CATEGORY_CONFIG: PostCategoryConfig[] = [
  {
    label: "Event",
    badgeType: BadgeType.EVENT,
    backendNames: ["EVENT", "EVENTS"],
  },
  {
    label: "Alert",
    badgeType: BadgeType.ALERT,
    backendNames: ["ALERT", "LOST & FOUND", "LOST AND FOUND"],
  },
  {
    label: "Discussion",
    badgeType: BadgeType.DISCUSSION,
    backendNames: ["DISCUSSION", "HELP REQUESTS", "HELP REQUEST"],
  },
  {
    label: "News",
    badgeType: BadgeType.NEWS,
    backendNames: ["NEWS", "RECOMMENDATIONS"],
  },
];

export const EXPECTED_POST_CATEGORY_COUNT = POST_CATEGORY_CONFIG.length;

function normalizeCategoryName(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

// Normalizes backend categories into shared badge metadata.
export function findCategoryData(categoryName: string | null): CategoryData {
  const normalizedCategoryName = normalizeCategoryName(categoryName);
  const matchedCategory = POST_CATEGORY_CONFIG.find((category) =>
    category.backendNames.includes(normalizedCategoryName),
  );

  return matchedCategory
    ? {
        badgeLabel: matchedCategory.label,
        badgeType: matchedCategory.badgeType,
      }
    : {
        badgeLabel: "News",
        badgeType: BadgeType.NEWS,
      };
}

// Resolves the four frontend category options against the backend category records.
export function findPostCategoryOptions(
  categories: Category[],
): PostCategoryOption[] {
  return POST_CATEGORY_CONFIG.flatMap((categoryConfig) => {
    const matchedCategory = categories.find((category) =>
      categoryConfig.backendNames.includes(normalizeCategoryName(category.name)),
    );

    return matchedCategory
      ? [
          {
            categoryId: matchedCategory.id,
            label: categoryConfig.label,
            badgeType: categoryConfig.badgeType,
            backendName: matchedCategory.name,
          },
        ]
      : [];
  });
}

// Formats timestamps into the short relative strings used across post surfaces.
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

// Resolves readable backend and network errors for post requests.
export function findPostRequestErrorMessage(
  error: unknown,
  fallbackMessage: string,
  unauthorizedMessage = fallbackMessage,
  notFoundMessage = fallbackMessage,
): string {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim().length > 0) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const payload = responseData as ApiErrorPayload;

      if (typeof payload.message === "string" && payload.message.trim().length > 0) {
        return payload.message;
      }

      if (typeof payload.error === "string" && payload.error.trim().length > 0) {
        return payload.error;
      }
    }

    if (statusCode === 401 || statusCode === 403) {
      return unauthorizedMessage;
    }

    if (statusCode === 404) {
      return notFoundMessage;
    }
  }

  return fallbackMessage;
}

// Resolves readable create-post error text for backend and network failures.
export function findCreatePostErrorMessage(error: unknown): string {
  return findPostRequestErrorMessage(
    error,
    "Unable to create your post right now. Please try again.",
    "You are not authorized to create a post. Please sign in again.",
  );
}
