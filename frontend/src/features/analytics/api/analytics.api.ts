import { apiClient } from "../../../lib/axios/client";
import type { AnalyticsDashboardApiResponse } from "../types/analytics.types";

export const analyticsAPI = {
  async getDashboard(): Promise<AnalyticsDashboardApiResponse> {
    const response = await apiClient.get<AnalyticsDashboardApiResponse>(
      "/analytics/dashboard",
    );

    return response.data;
  },
};
