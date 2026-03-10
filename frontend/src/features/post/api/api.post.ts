import { apiClient } from "../../../lib/axios/client";
import type { PagedResponse, Post, PostPayload } from "../types/post.type";

export const postAPI = {
  getAll(page = 0, size = 10) {
    return apiClient.get<PagedResponse<Post>>("/posts", {
      params: { page, size },
    });
  },

  getById(id: number) {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  create(data: PostPayload) {
    return apiClient.post<Post>("/posts", data);
  },

  update(id: number, data: PostPayload) {
    return apiClient.put<Post>(`/posts/${id}`, data);
  },

  delete(id: number) {
    return apiClient.delete<void>(`/posts/${id}`);
  },
};
