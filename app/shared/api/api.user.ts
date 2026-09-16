// api/api.user.ts — User domain, backed by the generated SDK
// (`app/lib/sdk/endpoints/user`). No manual HTTP, no local request DTOs:
// password payloads use the canonical models. `UserType` stays local (response
// entity with no spec model).
import {
    deleteApiUserDeleteUser,
    getApiUserGetUser,
    getApiUserGetUserUserId,
    getApiUserSearch,
    postApiUserChangePassword,
    postApiUserForgetPassword,
    postApiUserResetPassword,
    putApiUserUpdateUser,
} from "~/lib/sdk/endpoints/user/user";
import type {
    ChangePasswordRequest,
    ForgetPasswordRequest,
    ResetPasswordRequest,
    UpdateUserDto,
} from "~/lib/sdk/models";
import {
    GetApiUserSearchQueryParams,
    PostApiUserChangePasswordBody,
    PostApiUserForgetPasswordBody,
    PostApiUserResetPasswordBody,
    PutApiUserUpdateUserBody,
} from "~/lib/sdk/validations/user/user";
import type { UserType } from "../types/user-type";
import { normalizeRelationshipFlags } from "../types/user-type";
import { handleRequest } from "./api.handle-request";
import type { ApiResponse } from "./api.response";

// Get user by ID
export const getUserProfile = async (userId: string): Promise<ApiResponse<UserType>> => {
    const res = await handleRequest<UserType>(getApiUserGetUserUserId(userId));
    // Server swaps the relationship pairs (ADR-006) — correct at the boundary.
    if (res.success && res.data) res.data = normalizeRelationshipFlags(res.data);
    return res;
};

// Get current logged-in user
export const getCurrentUser = async (): Promise<ApiResponse<UserType>> => {
    const res = await handleRequest<UserType>(getApiUserGetUser());
    if (res.success && res.data) res.data = normalizeRelationshipFlags(res.data);
    return res;
};

// Search users
export const searchUsers = (
    q: string,
    page = 1,
    limit = 20,
    { userId = null }: { userId?: string | null } = {}
): Promise<ApiResponse<UserType[]>> =>
    handleRequest(
        getApiUserSearch(
            GetApiUserSearchQueryParams.parse({
                q,
                page,
                limit,
                // Omit null/empty so the wire never carries `userId=null`.
                ...(userId ? { userId } : {}),
            })
        )
    );

// Update user profile. `birthDate` must be an ISO datetime string — callers
// serialize `Date` before calling (the Zod body enforces datetime+offset).
export const updateUserProfile = (payload: UpdateUserDto): Promise<ApiResponse<UserType>> => {
    // console.log(payload);
    return handleRequest(putApiUserUpdateUser(PutApiUserUpdateUserBody.parse(payload)));
};

export const changePassword = (payload: ChangePasswordRequest): Promise<ApiResponse<object>> => {
    return handleRequest(postApiUserChangePassword(PostApiUserChangePasswordBody.parse(payload)));
};

export const forgetPassword = async (payload: ForgetPasswordRequest): Promise<ApiResponse<object>> => {
    // console.log(payload);
    return handleRequest(postApiUserForgetPassword(PostApiUserForgetPasswordBody.parse(payload)));
};

export const resetPassword = async (payload: ResetPasswordRequest): Promise<ApiResponse<object>> => {
    // console.log(payload);
    return handleRequest(postApiUserResetPassword(PostApiUserResetPasswordBody.parse(payload)));
};

// Delete user account
export const deleteUserAccount = (): Promise<ApiResponse<null>> =>
    handleRequest(deleteApiUserDeleteUser());
