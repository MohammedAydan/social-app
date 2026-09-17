// api/api.posts.ts — Posts domain, backed by the generated SDK
// (`app/lib/sdk/endpoints/posts`). No manual HTTP, no local DTOs: payloads use
// the canonical models and their Zod schemas; reads return the same
// `ApiResponse<PostType>` envelopes as before.
import {
    deleteApiPostsPostId,
    deleteApiPostsReportsReportId,
    getApiPostsFeed,
    getApiPostsMyPosts,
    getApiPostsPostId,
    getApiPostsReportsMine,
    getApiPostsUserUserId,
    postApiPosts,
    postApiPostsPostIdReport,
    postApiPostsShare,
    putApiPosts,
} from "~/lib/sdk/endpoints/posts/posts";
import type {
    CreatePostRequest,
    SharePostRequest,
    UpdatePostRequest,
} from "~/lib/sdk/models";
import {
    DeleteApiPostsReportsReportIdParams,
    GetApiPostsFeedQueryParams,
    GetApiPostsMyPostsQueryParams,
    GetApiPostsReportsMineQueryParams,
    GetApiPostsUserUserIdQueryParams,
    PostApiPostsBody,
    PostApiPostsPostIdReportParams,
    PostApiPostsShareBody,
    PutApiPostsBody,
} from "~/lib/sdk/validations/posts/posts";
import type { ReportType } from "../types/report-type";
import { parseReportPayload, type ReportPostInput } from "../utils/report-helpers";
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

// --- Post reporting --------------------------------------------------------
// SDK-only: network via the raw endpoint fns, request types via models,
// validation via the generated Zod schemas. No manual HTTP, no local DTOs.
// Pure helpers (reasons, payload builder, error classifier) live in the
// alias-free `../utils/report-helpers` so node:test can import them; they are
// re-exported here to keep UI imports on the facade.
export {
    REPORT_REASONS,
    parseReportPayload,
    classifyReportError,
    type ReportReason,
    type ReportPostInput,
    type ReportErrorKind,
} from "../utils/report-helpers";

export const reportPost = async (
    postId: string,
    input: ReportPostInput
): Promise<ApiResponse<ReportType>> => {
    const { postId: validPostId } = PostApiPostsPostIdReportParams.parse({ postId });
    return handleRequest(postApiPostsPostIdReport(validPostId, parseReportPayload(input)));
};

export const getMyReports = async (page = 1, limit = 20): Promise<ApiResponse<ReportType[]>> =>
    handleRequest(
        getApiPostsReportsMine(GetApiPostsReportsMineQueryParams.parse({ Page: page, Limit: limit }))
    );

export const cancelReport = async (reportId: string): Promise<ApiResponse<unknown>> => {
    const { reportId: validReportId } = DeleteApiPostsReportsReportIdParams.parse({ reportId });
    return handleRequest(deleteApiPostsReportsReportId(validReportId));
};
