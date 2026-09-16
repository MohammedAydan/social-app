// api/api.likes.ts
import { apiClient } from "~/sdk/api-client";

export const likePost = (postId: string) => apiClient.post<boolean>("/api/Like", { postId });

export const getPostLikes = <T>(postId: string, page = 1, limit = 20) =>
    apiClient.get<T>(`/api/Like/${encodeURIComponent(postId)}`, { page, limit });
