export interface AnalyticsCategoryBucket {
  categoryName: string;
  totalPosts: number;
}

export interface AnalyticsDayBucket {
  dayOfWeek: string;
  totalPosts: number;
}

export interface AnalyticsContributor {
  contributorName: string;
  contributorEmail?: string | null;
  totalPosts: number;
}

export interface AnalyticsDashboardApiResponse {
  postsPerCategory: AnalyticsCategoryBucket[];
  mostActiveDays: AnalyticsDayBucket[];
  topContributors: AnalyticsContributor[];
}

export interface AnalyticsDashboardData {
  totalPosts: number;
  totalComments: number | null;
  postsPerCategory: AnalyticsCategoryBucket[];
  postsPerDayOfWeek: AnalyticsDayBucket[];
  topContributors: AnalyticsContributor[];
}

export interface AnalyticsContributorRow extends AnalyticsContributor {
  rank: number;
  isPlaceholder: boolean;
}
