import { serverApi } from "@/services/api/server";
import type { ApiResponse } from "@/services/api/types";
import type { AuthResponseType } from "~/shared/types/auth-response-type";
import type { CreateUserType } from "~/shared/types/create-user-type";
import type { SignInType } from "~/shared/types/sign-in-type";

export const authService = {
  register: (payload: CreateUserType) => serverApi.post<ApiResponse<AuthResponseType>>("/api/User/register", payload),
  signIn: (payload: SignInType) => serverApi.post<ApiResponse<AuthResponseType>>("/api/User/sign-in", payload),
};
