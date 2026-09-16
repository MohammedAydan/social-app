// api/api.block.ts — Blocking endpoints (API_REFERENCE §6), backed by the
// generated SDK (`app/lib/sdk/endpoints/block-user`). No manual HTTP.
// The wire shape is exactly `{ blockedUserId }` — the server derives the
// blocker from the JWT, so the old `userId` echo is gone.
import {
    getApiBlockUserBlockedUsers,
    getApiBlockUserIsBlocked,
    postApiBlockUserBlock,
    postApiBlockUserUnblock,
} from "~/lib/sdk/endpoints/block-user/block-user";
import {
    GetApiBlockUserBlockedUsersQueryParams,
    GetApiBlockUserIsBlockedQueryParams,
    PostApiBlockUserBlockBody,
    PostApiBlockUserUnblockBody,
} from "~/lib/sdk/validations/block-user/block-user";
import { handleRequest } from "./api.handle-request";
import type { ApiResponse } from "./api.response";

/** Block a user. Writes gate all future interactions both ways (400/401 afterwards). */
export const blockUser = (blockedUserId: string): Promise<ApiResponse<unknown>> =>
    handleRequest(postApiBlockUserBlock(PostApiBlockUserBlockBody.parse({ blockedUserId })));

/** Unblock a user. */
export const unblockUser = (blockedUserId: string): Promise<ApiResponse<unknown>> =>
    handleRequest(postApiBlockUserUnblock(PostApiBlockUserUnblockBody.parse({ blockedUserId })));

/** My block list (lowercase `page`/`limit` per §6). */
export const getBlockedUsers = (page = 1, limit = 20): Promise<ApiResponse<unknown>> =>
    handleRequest(
        getApiBlockUserBlockedUsers(GetApiBlockUserBlockedUsersQueryParams.parse({ page, limit }))
    );

/** Check one direction: have I blocked `blockedUserId`? */
export const checkIsBlocked = (blockedUserId: string): Promise<ApiResponse<boolean>> =>
    handleRequest(
        getApiBlockUserIsBlocked(GetApiBlockUserIsBlockedQueryParams.parse({ blockedUserId }))
    );
