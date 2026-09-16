import { serverApi } from "@/services/api/server";
import type { ApiResponse } from "@/services/api/types";
import type { UpdateUserType, UserType } from "~/shared/types/user-type";

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SearchUsersQuery = {
  q: string;
  page?: number;
  limit?: number;
  userId?: string | null;
};

export const usersService = {
  getById: (userId: string) => serverApi.get<ApiResponse<UserType>>(`/api/User/get-user/${userId}`),
  getCurrent: () => serverApi.get<ApiResponse<UserType>>("/api/User/get-user"),
  search: ({ q, page = 1, limit = 20, userId = null }: SearchUsersQuery) => serverApi.get<ApiResponse<UserType[]>>("/api/User/search", { query: { q, page, limit, userId } }),
  update: (payload: UpdateUserType) => serverApi.put<ApiResponse<UserType>>("/api/User/update-user", payload),
  changePassword: (payload: ChangePasswordInput) => serverApi.post<ApiResponse<object>>("/api/User/change-password", payload),
  deleteAccount: () => serverApi.delete<ApiResponse<null>>("/api/User/delete-user"),
};
