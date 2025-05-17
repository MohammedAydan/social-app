// api/api.user.ts
import type { UserType } from "../types/user-type";
import api from "./axios";

export const getUserProfile = async (userId: string) => await api.get(`/api/User/get-user/${userId}`);
export const getCurrentUser = async () => await api.get("/api/User/get-user");
export const searchUsers = async (q: string, page = 1, limit = 20, { userId = null }: { userId?: string | null }) => await api.get("/api/User/search", { params: { q: q, page: page, limit: limit, userId: userId } });
export const updateUserProfile = async (payload: UserType) => await api.put("/api/User/update-user", payload);
export const deleteUserAccount = async () => await api.delete("/api/User/delete-user");
// export const searchUsers = async (q: string, page: number, limit: number) => await api.get("/api/User/search", { params: { q: q, page, limit } });
