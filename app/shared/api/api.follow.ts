// api/api.follow.ts
import type { FollowRequestType } from "../types/follow-request-type";
import { handleRequest } from "./api.handle-request";
import api from "./axios";

export const followUser = (payload: FollowRequestType) => handleRequest(api.post("/api/Follow/follow", payload));
export const unfollowUser = (payload: FollowRequestType) => handleRequest(api.post("/api/Follow/unfollow", payload));
export const acceptFollowRequest = (payload: FollowRequestType) => handleRequest(api.post("/api/Follow/accept-follow-request", payload));
export const rejectFollowRequest = (payload: FollowRequestType) => handleRequest(api.post("/api/Follow/reject-follow-request", payload));
export const getFollowers = (page = 1, limit = 20) => handleRequest(api.get("/api/Follow/followers", { params: { page, limit } }));
export const getFollowing = (page = 1, limit = 20) => handleRequest(api.get("/api/Follow/following", { params: { page, limit } }));
export const getPendingFollowRequests = (page = 1, limit = 20) => handleRequest(api.get("/api/Follow/pending-follow-requests", { params: { page, limit } }));
