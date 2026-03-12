import { apiClient } from "../../../lib/axios/client";
import type { Category } from "../types/post.type";

export interface CategorySubscriptionResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  confirmed: boolean;
}

export const categoryAPI = {
  getAll() {
    return apiClient.get<Category[]>("/categories");
  },

  subscribe(categoryId: number) {
    return apiClient.post<CategorySubscriptionResponse>(`/categories/${categoryId}/subscribe`);
  },

  unsubscribe(categoryId: number) {
    return apiClient.delete(`/categories/${categoryId}/subscribe`);
  },

  getMySubscriptions() {
    return apiClient.get<CategorySubscriptionResponse[]>("/categories/subscriptions/me");
  },

  isSubscribed(categoryId: number) {
    return apiClient.get<boolean>(`/categories/${categoryId}/subscribed`);
  },
};
