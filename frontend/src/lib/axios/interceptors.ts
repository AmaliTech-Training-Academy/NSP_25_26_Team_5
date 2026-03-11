import { AxiosHeaders } from "axios";
import { apiClient } from "./client";
import { authStorage } from "../../features/auth/utils/auth.storage";

export function setupInterceptors() {
  apiClient.interceptors.request.use((config) => {
    const token = authStorage.getToken();

    if (token) {
      config.headers = config.headers ?? new AxiosHeaders();

      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  });
}