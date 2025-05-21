// api/api.comments.ts
import type { CreateCommentType } from "../types/create-comment-type";
import type { CreateReplyCommentType } from "../types/create-reply-comment-type";
import type { UpdateCommentType } from "../types/update-comment-type";
import api from "./axios";
import { handleRequest } from "./api.handle-request";
import type { CommentType } from "../types/comment-type";

export const createComment = (payload: CreateCommentType) =>
    handleRequest(api.post("/api/Comments", payload));

export const createReplyComment = (payload: CreateReplyCommentType) =>
    handleRequest(api.post("/api/Comments/reply", payload));

export const updateComment = (id: string, payload: UpdateCommentType) =>
    handleRequest(api.put(`/api/Comments/${id}`, payload));

export const deleteComment = (id: string) =>
    handleRequest(api.delete(`/api/Comments/${id}`));

export const deleteReplyComment = (id: string) =>
    handleRequest(api.delete(`/api/Comments/reply/${id}`));

export const getComment = (id: string) =>
    handleRequest(api.get(`/api/Comments/${id}`));

export const getPostComments = (postId: string, page = 1, limit = 10) =>
    handleRequest<CommentType[]>(
        api.get(`/api/Comments/post/${postId}`, {
            params: { page, limit },
        })
    );

export const getCommentReplies = (parentId: string) =>
    handleRequest(api.get(`/api/Comments/reply/${parentId}`));
