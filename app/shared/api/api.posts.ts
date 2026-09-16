// api/api.posts.ts — Posts domain, backed by the generated SDK
// (`app/lib/sdk/endpoints/posts`). No manual HTTP, no local DTOs: payloads use
// the canonical models and their Zod schemas; reads return the same
// `ApiResponse<PostType>` envelopes as before.
import {
    deleteApiPostsPostId,
    getApiPostsFeed,
    getApiPostsMyPosts,
    getApiPostsPostId,
    getApiPostsUserUserId,
    postApiPosts,
    postApiPostsShare,
    putApiPosts,
} from "~/lib/sdk/endpoints/posts/posts";
import type { CreatePostRequest, SharePostRequest, UpdatePostRequest } from "~/lib/sdk/models";
import {
    GetApiPostsFeedQueryParams,
    GetApiPostsMyPostsQueryParams,
    GetApiPostsUserUserIdQueryParams,
    PostApiPostsBody,
    PostApiPostsShareBody,
    PutApiPostsBody,
} from "~/lib/sdk/validations/posts/posts";
import { normalizeVisibility, type PostType } from "../types/post-types";
import { handleRequest } from "./api.handle-request";
import type { ApiResponse } from "./api.response";

/** The server compares visibility exactly — always send the canonical form. */
const withCanonicalVisibility = <T extends { visibility?: string }>(payload: T): T => ({
    ...payload,
    visibility: normalizeVisibility(payload.visibility),
});

export const createPost = async (payload: CreatePostRequest): Promise<ApiResponse<PostType>> =>
    handleRequest(postApiPosts(PostApiPostsBody.parse(withCanonicalVisibility(payload))));

export const updatePost = async (payload: UpdatePostRequest): Promise<ApiResponse<PostType>> =>
    handleRequest(putApiPosts(PutApiPostsBody.parse(withCanonicalVisibility(payload))));

export const getPost = async (id: string): Promise<ApiResponse<PostType>> =>
    handleRequest(getApiPostsPostId(id));

export const deletePost = async (id: string): Promise<ApiResponse<null>> =>
    handleRequest(deleteApiPostsPostId(id));

export const getFeed = async (page = 1, limit = 20): Promise<ApiResponse<PostType[]>> =>
    handleRequest(getApiPostsFeed(GetApiPostsFeedQueryParams.parse({ Page: page, Limit: limit })));

export const getMyPosts = async (page = 1, limit = 20): Promise<ApiResponse<PostType[]>> =>
    handleRequest(getApiPostsMyPosts(GetApiPostsMyPostsQueryParams.parse({ Page: page, Limit: limit })));

export const getPostsByUserId = async (userId: string, page = 1, limit = 20): Promise<ApiResponse<PostType[]>> =>
    handleRequest(
        getApiPostsUserUserId(userId, GetApiPostsUserUserIdQueryParams.parse({ Page: page, Limit: limit }))
    );

export const sharePost = async (payload: SharePostRequest): Promise<ApiResponse<PostType>> =>
    handleRequest(postApiPostsShare(PostApiPostsShareBody.parse(withCanonicalVisibility(payload))));
