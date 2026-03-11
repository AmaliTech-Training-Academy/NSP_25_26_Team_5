import { apiClient } from "../../../lib/axios/client";
import type { Category } from "../types/post.type";

export const categoryAPI = {
  getAll() {
    return apiClient.get<Category[]>("/categories");
  },
};
