import { apiClient } from "../../../lib/axios/client";
import type { Comment, CommentPayload } from "../types/comment.types";

export const commentAPI = {
  getByPostId(postId: number) {
    return apiClient.get<Comment[]>(`/posts/${postId}/comments`);
  },

  create(postId: number, data: CommentPayload) {
    return apiClient.post<Comment>(`/posts/${postId}/comments`, data);
  },

  update(postId: number, commentId: number, data: CommentPayload) {
    return apiClient.put<Comment>(`/posts/${postId}/comments/${commentId}`, data);
  },

  delete(postId: number, commentId: number) {
    return apiClient.delete<void>(`/posts/${postId}/comments/${commentId}`);
  },
};
