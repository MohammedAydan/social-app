import type { CreateCommentType } from "../types/create-comment-type";
import type { CreateReplyCommentType } from "../types/create-reply-comment-type";
import type { UpdateCommentType } from "../types/update-comment-type";
import type { CommentType } from "../types/comment-type";
import { sdkDelete, sdkGet, sdkPost, sdkPut } from "~/sdk/endpoints";

export const createComment = (payload: CreateCommentType) => sdkPost("/api/Comments", payload);
export const createReplyComment = (payload: CreateReplyCommentType) => sdkPost("/api/Comments/reply", payload);
export const updateComment = (id: string, payload: UpdateCommentType) => sdkPut(`/api/Comments/${id}`, payload);
export const deleteComment = (id: string) => sdkDelete(`/api/Comments/${id}`);
export const deleteReplyComment = (id: string) => sdkDelete(`/api/Comments/reply/${id}`);
export const getComment = (id: string) => sdkGet(`/api/Comments/${id}`);
export const getPostComments = (postId: string, page = 1, limit = 10) => sdkGet<CommentType[]>(`/api/Comments/post/${postId}`, { page, limit: Math.min(limit, 50) });
export const getCommentReplies = (parentId: string) => sdkGet(`/api/Comments/reply/${parentId}`);
