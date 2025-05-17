// api/api.posts.ts
import type { CreatePostType } from "../types/create-post-type";
import type { PostType } from "../types/post-types";
import type { SharePostRequest } from "../types/share-post-type";
import api from "./axios";

export const createPost = async (payload: CreatePostType) => await api.post("/api/Posts", payload);
export const updatePost = async (payload: PostType) => await api.put("/api/Posts", payload);
export const getPost = async (id: string) => await api.get(`/api/Posts/${id}`);
export const deletePost = async (id: string) => await api.delete(`/api/Posts/${id}`);
export const getFeed = async (page = 1, limit = 20) => await api.get("/api/Posts/feed", { params: { Page: page, Limit: limit } });
export const getMyPosts = async (page = 1, limit = 20) => await api.get("/api/Posts/my-posts", { params: { Page: page, Limit: limit } });
export const getPostsByUserId = async (userId: string, page = 1, limit = 20) => await api.get(`/api/Posts/user/${userId}`, { params: { Page: page, Limit: limit } });
export const sharePost = async (payload: SharePostRequest) => await api.post("/api/Posts/share", payload);
