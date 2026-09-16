import type { UpdateUserType, UserType } from "../types/user-type";
import { sdkDelete, sdkGet, sdkPost, sdkPut } from "~/sdk/endpoints";
import type { ApiResponse } from "./api.response";

export const getUserProfile = (userId: string): Promise<ApiResponse<UserType>> => sdkGet<UserType>(`/api/User/get-user/${userId}`);
export const getCurrentUser = (): Promise<ApiResponse<UserType>> => sdkGet<UserType>("/api/User/get-user");
export const searchUsers = (q: string, page = 1, limit = 20, { userId = null }: { userId?: string | null } = {}): Promise<ApiResponse<UserType[]>> =>
  sdkGet<UserType[]>("/api/User/search", { q, page, limit: Math.min(limit, 50), userId });
export const updateUserProfile = (payload: UpdateUserType): Promise<ApiResponse<UserType>> => sdkPut<UserType>("/api/User/update-user", payload);
export const changePassword = (payload: ChangePassword): Promise<ApiResponse<object>> => sdkPost<object>("/api/User/change-password", payload);
export const forgetPassword = (payload: ForgetPassword): Promise<ApiResponse<object>> => sdkPost<object>("/api/User/forget-password", payload);
export const resetPassword = (payload: ResetPassword): Promise<ApiResponse<object>> => sdkPost<object>("/api/User/reset-password", payload);
export const deleteUserAccount = (): Promise<ApiResponse<null>> => sdkDelete<null>("/api/User/delete-user");

interface ChangePassword { currentPassword: string; newPassword: string; confirmPassword: string; }
interface ForgetPassword { email: string; }
interface ResetPassword { email: string; token: string; password: string; confirmPassword: string; }
