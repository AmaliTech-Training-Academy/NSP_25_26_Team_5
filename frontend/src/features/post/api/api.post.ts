import { apiClient } from "../../../lib/axios/client";
import type {
  PagedResponse,
  Post,
  PostPayload,
  PostSearchParams,
} from "../types/post.type";

export const postAPI = {
  getAll(page = 0, size = 10) {
    return apiClient.get<PagedResponse<Post>>("/posts", {
      params: { page, size },
    });
  },

  getMine(page = 0, size = 10) {
    return apiClient.get<PagedResponse<Post>>("/posts/me", {
      params: { page, size },
    });
  },

  getById(id: number) {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  search(params: PostSearchParams) {
    return apiClient.get<PagedResponse<Post>>("/posts/search", {
      params,
    });
  },

  create(data: PostPayload) {
    return apiClient.post<Post>("/posts", data);
  },

  update(id: number, data: PostPayload) {
    return apiClient.put<Post>(`/posts/${id}`, data);
  },

  uploadImage(id: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<Post>(`/posts/${id}/image`, formData);
  },

  delete(id: number) {
    return apiClient.delete<void>(`/posts/${id}`);
  },
};
