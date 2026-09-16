import type { FollowRequestType } from "../types/follow-request-type";
import { sdkGet, sdkPost, pageParams } from "~/sdk/endpoints";

export const followUser = (payload: FollowRequestType) => sdkPost("/api/Follow/follow", payload);
export const unfollowUser = (payload: FollowRequestType) => sdkPost("/api/Follow/unfollow", payload);
export const acceptFollowRequest = (payload: FollowRequestType) => sdkPost("/api/Follow/accept-follow-request", payload);
export const rejectFollowRequest = (payload: FollowRequestType) => sdkPost("/api/Follow/reject-follow-request", payload);
export const getFollowers = (page = 1, limit = 20) => sdkGet("/api/Follow/followers", pageParams(page, limit));
export const getFollowing = (page = 1, limit = 20) => sdkGet("/api/Follow/following", pageParams(page, limit));
export const getPendingFollowRequests = (page = 1, limit = 20) => sdkGet("/api/Follow/pending-follow-requests", pageParams(page, limit));
