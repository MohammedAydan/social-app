// api/api.comments.ts
import type { CreateCommentType } from "../types/create-comment-type";
import type { CreateReplyCommentType } from "../types/create-reply-comment-type";
import type { UpdateCommentType } from "../types/update-comment-type";
import { apiClient } from "~/sdk/api-client";
import type { CommentType } from "../types/comment-type";

export const createComment = (payload: CreateCommentType) =>
    apiClient.post("/api/Comments", payload);

export const createReplyComment = (payload: CreateReplyCommentType) =>
    apiClient.post("/api/Comments/reply", payload);

export const updateComment = (id: string, payload: UpdateCommentType) =>
    apiClient.put(`/api/Comments/${encodeURIComponent(id)}`, payload);

export const deleteComment = (id: string) =>
    apiClient.delete(`/api/Comments/${encodeURIComponent(id)}`);

export const deleteReplyComment = (id: string) =>
    apiClient.delete(`/api/Comments/reply/${encodeURIComponent(id)}`);

export const getComment = (id: string) =>
    apiClient.get(`/api/Comments/${encodeURIComponent(id)}`);

export const getPostComments = (postId: string, page = 1, limit = 10) =>
    apiClient.get<CommentType[]>(`/api/Comments/post/${encodeURIComponent(postId)}`, { page, limit });

export const getCommentReplies = (parentId: string) =>
    apiClient.get(`/api/Comments/reply/${encodeURIComponent(parentId)}`);
