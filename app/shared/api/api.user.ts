import type { UpdateUserType, UserType } from "../types/user-type";
import api from "./axios";
import { handleRequest } from "./api.handle-request";
import type { ApiResponse } from "./api.response";

// Get user by ID
export const getUserProfile = (userId: string): Promise<ApiResponse<UserType>> =>
    handleRequest<UserType>(api.get(`/api/User/get-user/${userId}`));

// Get current logged-in user
export const getCurrentUser = (): Promise<ApiResponse<UserType>> =>
    handleRequest(api.get("/api/User/get-user"));

// Search users
export const searchUsers = (
    q: string,
    page = 1,
    limit = 20,
    { userId = null }: { userId?: string | null } = {}
): Promise<ApiResponse<UserType[]>> =>
    handleRequest(api.get("/api/User/search", {
        params: { q, page, limit, userId }
    }));

// Update user profile
export const updateUserProfile = (payload: UpdateUserType): Promise<ApiResponse<UserType>> =>
    handleRequest(api.put("/api/User/update-user", payload));

// Delete user account
export const deleteUserAccount = (): Promise<ApiResponse<null>> =>
    handleRequest(api.delete("/api/User/delete-user"));
