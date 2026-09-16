// api/api.likes.ts — Likes, backed by the generated SDK
// (`app/lib/sdk/endpoints/like`). No manual HTTP, no local DTOs.
import { getApiLikePostId, postApiLike } from "~/lib/sdk/endpoints/like/like";
import { GetApiLikePostIdQueryParams, PostApiLikeBody } from "~/lib/sdk/validations/like/like";
import { handleRequest } from "./api.handle-request";

/**
 * Toggle like via POST /api/Like (the only documented Like write op,
 * API_REFERENCE §4). There is no DELETE endpoint (the server answers 405),
 * so both liking and unliking go through this call and callers must
 * interpret the envelope: success = toggled, 400 "duplicate/already" =
 * state unchanged.
 */
export const likePost = (postId: string) =>
    handleRequest(postApiLike(PostApiLikeBody.parse({ postId })));

export const getPostLikes = (postId: string, page = 1, limit = 20) =>
    handleRequest(getApiLikePostId(postId, GetApiLikePostIdQueryParams.parse({ page, limit })));
