// api/api.follow.ts — Follow graph, backed by the generated SDK
// (`app/lib/sdk/endpoints/follow`). No manual HTTP, no local DTOs: payloads
// use the canonical `FollowRequest` model and its Zod schemas.
import {
    getApiFollowFollowers,
    getApiFollowFollowing,
    getApiFollowPendingFollowRequests,
    postApiFollowAcceptFollowRequest,
    postApiFollowFollow,
    postApiFollowRejectFollowRequest,
    postApiFollowUnfollow,
} from "~/lib/sdk/endpoints/follow/follow";
import type { FollowRequest } from "~/lib/sdk/models";
import {
    PostApiFollowAcceptFollowRequestBody,
    PostApiFollowFollowBody,
    PostApiFollowRejectFollowRequestBody,
    PostApiFollowUnfollowBody,
} from "~/lib/sdk/validations/follow/follow";
import { handleRequest } from "./api.handle-request";

/**
 * The spec types both keys as optional, so `parse` here is a shape guard, not
 * just validation: unknown keys (e.g. a stale `followingId`) are stripped,
 * guaranteeing the canonical wire shape the handlers bind.
 */
export const followUser = (payload: FollowRequest) =>
    handleRequest(postApiFollowFollow(PostApiFollowFollowBody.parse(payload)));
export const unfollowUser = (payload: FollowRequest) =>
    handleRequest(postApiFollowUnfollow(PostApiFollowUnfollowBody.parse(payload)));
export const acceptFollowRequest = (payload: FollowRequest) =>
    handleRequest(postApiFollowAcceptFollowRequest(PostApiFollowAcceptFollowRequestBody.parse(payload)));
export const rejectFollowRequest = (payload: FollowRequest) =>
    handleRequest(postApiFollowRejectFollowRequest(PostApiFollowRejectFollowRequestBody.parse(payload)));
export const getFollowers = (page = 1, limit = 20) =>
    handleRequest(getApiFollowFollowers({ page, limit }));
export const getFollowing = (page = 1, limit = 20) =>
    handleRequest(getApiFollowFollowing({ page, limit }));
export const getPendingFollowRequests = (page = 1, limit = 20) =>
    handleRequest(getApiFollowPendingFollowRequests({ page, limit }));
