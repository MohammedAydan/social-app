// api/api.follow.ts
import type { FollowRequestType } from "../types/follow-request-type";
import api from "./axios";

export const followUser = async (payload: FollowRequestType) => await api.post("/api/Follow/follow", payload);
export const unfollowUser = async (payload: FollowRequestType) => await api.post("/api/Follow/unfollow", payload);
export const acceptFollowRequest = async (payload: FollowRequestType) => await api.post("/api/Follow/accept-follow-request", payload);
export const rejectFollowRequest = async (payload: FollowRequestType) => await api.post("/api/Follow/reject-follow-request", payload);
export const getFollowers = async (page = 1, limit = 20) => await api.get("/api/Follow/followers", { params: { page, limit } });
export const getFollowing = async (page = 1, limit = 20) => await api.get("/api/Follow/following", { params: { page, limit } });
export const getPendingFollowRequests = async (page = 1, limit = 20) => await api.get("/api/Follow/pending-follow-requests", { params: { page, limit } });
