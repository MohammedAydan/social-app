import { apiClient, type ApiEnvelope } from "./api-client";

export type Page<T> = {
  items?: T[];
  data?: T[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
};

export type SignInRequest = { email: string; password: string };
export type RefreshTokenRequest = { refreshToken: string };

export const authApi = {
  signIn: (body: SignInRequest) => apiClient.post<{ accessToken: string; refreshToken: string }>("/api/User/sign-in", body),
  register: <T>(body: unknown) => apiClient.post<T>("/api/User/register", body),
  refreshToken: (body: RefreshTokenRequest) => apiClient.post<{ accessToken: string; refreshToken: string }>("/api/User/refresh-token", body),
  logout: () => apiClient.post<null>("/api/User/logout"),
  currentUser: <T>() => apiClient.get<T>("/api/User/get-user"),
};

export const postsApi = {
  feed: <T>(page = 1, limit = 20) => apiClient.get<Page<T>>("/api/Posts/feed", { Page: page, Limit: limit }),
  mine: <T>(page = 1, limit = 20) => apiClient.get<Page<T>>("/api/Posts/my-posts", { Page: page, Limit: limit }),
  byUser: <T>(userId: string, page = 1, limit = 20) => apiClient.get<Page<T>>(`/api/Posts/user/${encodeURIComponent(userId)}`, { Page: page, Limit: limit }),
  byId: <T>(postId: string) => apiClient.get<T>(`/api/Posts/${encodeURIComponent(postId)}`),
  create: <T>(body: unknown) => apiClient.post<T>("/api/Posts", body),
  update: <T>(body: unknown) => apiClient.put<T>("/api/Posts", body),
  remove: (postId: string) => apiClient.delete<boolean>(`/api/Posts/${encodeURIComponent(postId)}`),
};

export type { ApiEnvelope };
