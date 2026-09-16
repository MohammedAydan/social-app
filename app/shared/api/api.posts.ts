import type { CreatePostType } from "../types/create-post-type";
import type { PostType } from "../types/post-types";
import type { SharePostRequest } from "../types/share-post-type";
import type { UpdatePostRequest } from "../types/update-post-type";
import { sdkDelete, sdkGet, sdkPost, sdkPut, pageParams } from "~/sdk/endpoints";
import type { ApiResponse } from "./api.response";

export const createPost = (payload: CreatePostType): Promise<ApiResponse<PostType>> => sdkPost<PostType>("/api/Posts", payload);
export const updatePost = (payload: UpdatePostRequest): Promise<ApiResponse<PostType>> => sdkPut<PostType>("/api/Posts", payload);
export const getPost = (id: string): Promise<ApiResponse<PostType>> => sdkGet<PostType>(`/api/Posts/${id}`);
export const deletePost = (id: string): Promise<ApiResponse<null>> => sdkDelete<null>(`/api/Posts/${id}`);
export const getFeed = (page = 1, limit = 20): Promise<ApiResponse<PostType[]>> => sdkGet<PostType[]>("/api/Posts/feed", pageParams(page, limit));
export const getMyPosts = (page = 1, limit = 20): Promise<ApiResponse<PostType[]>> => sdkGet<PostType[]>("/api/Posts/my-posts", pageParams(page, limit));
export const getPostsByUserId = (userId: string, page = 1, limit = 20): Promise<ApiResponse<PostType[]>> => sdkGet<PostType[]>(`/api/Posts/user/${userId}`, pageParams(page, limit));
export const sharePost = (payload: SharePostRequest): Promise<ApiResponse<PostType>> => sdkPost<PostType>("/api/Posts/share", payload);
