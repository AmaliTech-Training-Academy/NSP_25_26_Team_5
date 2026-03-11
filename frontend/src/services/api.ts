import axios, { AxiosHeaders } from "axios";

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  categoryName: string | null;
  categoryId: number | null;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PostPayload {
  title: string;
  content: string;
  categoryId: number | string | null;
}

const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authAPI = {
  login: (data: AuthRequest) => API.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterRequest) => API.post<AuthResponse>("/auth/register", data),
};

export const postAPI = {
  getAll: (page = 0, size = 10) => API.get<PagedResponse<Post>>(`/posts?page=${page}&size=${size}`),
  getById: (id: number) => API.get<Post>(`/posts/${id}`),
  create: (data: PostPayload) => API.post<Post>("/posts", data),
  update: (id: number, data: PostPayload) => API.put<Post>(`/posts/${id}`, data),
  delete: (id: number) => API.delete<void>(`/posts/${id}`),
};

export const categoryAPI = {
  getAll: () => API.get<Category[]>("/categories"),
};

// TODO: Add comment API calls
// TODO: Add search API calls

export default API;
