import { apiClient } from "../../../lib/axios/client";
import type { AuthRequest, AuthResponse, RegisterRequest } from "../types/auth.types";

export const authApi = {
  login(data: AuthRequest) {
    return apiClient.post<AuthResponse>("/auth/login", data);
  },

  register(data: RegisterRequest) {
    return apiClient.post<AuthResponse>("/auth/register", data);
  },
};