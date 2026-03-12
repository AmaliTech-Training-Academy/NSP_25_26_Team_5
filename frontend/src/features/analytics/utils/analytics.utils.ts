import axios from "axios";
import type {
  AnalyticsDashboardApiResponse,
  AnalyticsCategoryBucket,
  AnalyticsContributor,
  AnalyticsContributorRow,
  AnalyticsDashboardData,
  AnalyticsDayBucket,
} from "../types/analytics.types";

export const ANALYTICS_CATEGORY_ORDER = [
  "Event",
  "Alert",
  "Discussion",
  "News",
] as const;

export const ANALYTICS_DAY_ORDER = [
  "Mon",
  "Tues",
  "Wed",
  "Thurs",
  "Fri",
  "Sat",
  "Sun",
] as const;

function normalizeKey(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

function normalizeCount(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.trunc(value));
}

function findDayLabel(dayOfWeek: string): (typeof ANALYTICS_DAY_ORDER)[number] | null {
  const normalizedDay = normalizeKey(dayOfWeek);

  switch (normalizedDay) {
    case "MON":
    case "MONDAY":
      return "Mon";
    case "TUE":
    case "TUES":
    case "TUESDAY":
      return "Tues";
    case "WED":
    case "WEDNESDAY":
      return "Wed";
    case "THU":
    case "THUR":
    case "THURS":
    case "THURSDAY":
      return "Thurs";
    case "FRI":
    case "FRIDAY":
      return "Fri";
    case "SAT":
    case "SATURDAY":
      return "Sat";
    case "SUN":
    case "SUNDAY":
      return "Sun";
    default:
      return null;
  }
}

export function createEmptyAnalyticsDashboard(): AnalyticsDashboardData {
  return {
    totalPosts: null,
    totalComments: null,
    postsPerCategory: ANALYTICS_CATEGORY_ORDER.map((categoryName) => ({
      categoryName,
      totalPosts: 0,
    })),
    postsPerDayOfWeek: ANALYTICS_DAY_ORDER.map((dayOfWeek) => ({
      dayOfWeek,
      totalPosts: 0,
    })),
    topContributors: [],
  };
}

function normalizeCategoryBuckets(
  buckets: AnalyticsCategoryBucket[] | undefined,
): AnalyticsCategoryBucket[] {
  const countsByCategory = new Map(
    (buckets ?? []).map((bucket) => [normalizeKey(bucket.categoryName), bucket.totalPosts]),
  );

  return ANALYTICS_CATEGORY_ORDER.map((categoryName) => ({
    categoryName,
    totalPosts: countsByCategory.get(normalizeKey(categoryName)) ?? 0,
  }));
}

function normalizeDayBuckets(
  buckets: AnalyticsDayBucket[] | undefined,
): AnalyticsDayBucket[] {
  const countsByDay = new Map<string, number>();

  for (const bucket of buckets ?? []) {
    const label = findDayLabel(bucket.dayOfWeek);
    if (label) {
      countsByDay.set(label, bucket.totalPosts);
    }
  }

  return ANALYTICS_DAY_ORDER.map((dayOfWeek) => ({
    dayOfWeek,
    totalPosts: countsByDay.get(dayOfWeek) ?? 0,
  }));
}

function normalizeContributors(
  contributors: AnalyticsContributor[] | undefined,
): AnalyticsContributor[] {
  return [...(contributors ?? [])]
    .filter((contributor) => contributor.contributorName.trim().length > 0)
    .sort((left, right) => {
      const postDifference = right.totalPosts - left.totalPosts;
      if (postDifference !== 0) {
        return postDifference;
      }

      return left.contributorName.localeCompare(right.contributorName);
    })
    .slice(0, 10);
}

export function normalizeAnalyticsDashboard(
  payload?: Partial<AnalyticsDashboardApiResponse> | null,
): AnalyticsDashboardData {
  const normalizedCategoryBuckets = normalizeCategoryBuckets(payload?.postsPerCategory);

  return {
    totalPosts: normalizeCount(payload?.totalPosts),
    totalComments: normalizeCount(payload?.totalComments),
    postsPerCategory: normalizedCategoryBuckets,
    postsPerDayOfWeek: normalizeDayBuckets(payload?.mostActiveDays),
    topContributors: normalizeContributors(payload?.topContributors),
  };
}

export function buildContributorRows(
  contributors: AnalyticsContributor[],
): AnalyticsContributorRow[] {
  if (contributors.length === 0) {
    return [];
  }

  const rows: AnalyticsContributorRow[] = contributors.map((contributor, index) => ({
    ...contributor,
    rank: index + 1,
    isPlaceholder: false,
  }));

  while (rows.length < 10) {
    rows.push({
      contributorName: "No contributor yet",
      contributorEmail: null,
      totalPosts: 0,
      rank: rows.length + 1,
      isPlaceholder: true,
    });
  }

  return rows;
}

export function findContributorSearchValue(contributor: AnalyticsContributor): string {
  return contributor.contributorEmail?.trim() || contributor.contributorName.trim();
}

export function getAnalyticsErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
      return serverMessage;
    }
  }

  return "Unable to load dashboard analytics right now. Please try again.";
}
