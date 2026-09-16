// api/api.comments.ts — Comments domain, backed by the generated SDK
// (`app/lib/sdk/endpoints/comments`). No manual HTTP, no local DTOs.
import {
    deleteApiCommentsCommentId,
    getApiCommentsCommentId,
    getApiCommentsPostPostId,
    getApiCommentsRepliesParentId,
    postApiComments,
    postApiCommentsReply,
    putApiCommentsCommentId,
} from "~/lib/sdk/endpoints/comments/comments";
import type {
    CreateCommentRequest,
    CreateReplyCommentRequest,
    UpdateCommentRequest,
} from "~/lib/sdk/models";
import {
    GetApiCommentsPostPostIdQueryParams,
    PostApiCommentsBody,
    PostApiCommentsReplyBody,
    PutApiCommentsCommentIdBody,
} from "~/lib/sdk/validations/comments/comments";
import { handleRequest } from "./api.handle-request";
import type { CommentType } from "../types/comment-type";

export const createComment = (payload: CreateCommentRequest) =>
    handleRequest(postApiComments(PostApiCommentsBody.parse(payload)));

export const createReplyComment = (payload: CreateReplyCommentRequest) =>
    handleRequest(postApiCommentsReply(PostApiCommentsReplyBody.parse(payload)));

export const updateComment = (id: string, payload: UpdateCommentRequest) =>
    handleRequest(putApiCommentsCommentId(id, PutApiCommentsCommentIdBody.parse(payload)));

export const deleteComment = (id: string) =>
    handleRequest(deleteApiCommentsCommentId(id));

/** Replies are comments with a parentId — deleted via the same endpoint. */
export const deleteReplyComment = (id: string) =>
    handleRequest(deleteApiCommentsCommentId(id));

export const getComment = (id: string) =>
    handleRequest(getApiCommentsCommentId(id));

export const getPostComments = (postId: string, page = 1, limit = 10) =>
    handleRequest<CommentType[]>(
        getApiCommentsPostPostId(postId, GetApiCommentsPostPostIdQueryParams.parse({ page, limit }))
    );

export const getCommentReplies = (parentId: string) =>
    handleRequest(getApiCommentsRepliesParentId(parentId));
