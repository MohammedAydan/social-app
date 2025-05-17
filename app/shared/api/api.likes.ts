// api/api.likes.ts
import api from "./axios";

export const likePost = async (postId: string) => await api.post("/api/Like", { postId });
export const getPostLikes = async (postId: string, page = 1, limit = 20) => await api.get(`/api/Like/${postId}`, { params: { page, limit } });
