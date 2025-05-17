// api/api.comments.ts
import type { CreateCommentType } from "../types/create-comment-type";
import type { CreateReplyCommentType } from "../types/create-reply-comment-type";
import type { UpdateCommentType } from "../types/update-comment-type";
import api from "./axios";

export const createComment = async (payload: CreateCommentType) => await api.post("/api/Comments", payload);
export const createReplyComment = async (payload: CreateReplyCommentType) => await api.post("/api/Comments/reply", payload);
export const updateComment = async (id: string, payload: UpdateCommentType) => await api.put(`/api/Comments/${id}`, payload);
export const deleteComment = async (id: string) => await api.delete(`/api/Comments/${id}`);
export const deleteReplyComment = async (id: string) => await api.delete(`/api/Comments/reply/${id}`);
export const getComment = async (id: string) => await api.get(`/api/Comments/${id}`);
export const getPostComments = async (postId: string, page = 1, limit = 10) => await api.get(`/api/Comments/post/${postId}`, { params: { page, limit } });
export const getCommentReplies = async (parentId: string) => await api.get(`/api/Comments/reply/${parentId}`);
