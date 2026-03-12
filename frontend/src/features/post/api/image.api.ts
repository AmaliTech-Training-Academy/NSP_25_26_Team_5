import { apiClient } from "../../../lib/axios/client";
import type { ImageUploadResponse } from "../types/post.type";

export const imageAPI = {
  upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post<ImageUploadResponse>("/images/upload", formData);
  },
};
