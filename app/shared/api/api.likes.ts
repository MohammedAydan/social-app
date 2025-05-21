// api/api.likes.ts
import api from "./axios";
import { handleRequest } from "./api.handle-request";

export const likePost = (postId: string) =>
    handleRequest(api.post("/api/Like", { postId }));

export const getPostLikes = (postId: string, page = 1, limit = 20) =>
    handleRequest(
        api.get(`/api/Like/${postId}`, {
            params: { page, limit },
        })
    );
