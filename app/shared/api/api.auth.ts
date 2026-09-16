import type { AuthResponseType } from "../types/auth-response-type";
import type { CreateUserType } from "../types/create-user-type";
import type { SignInType } from "../types/sign-in-type";
import { sdkPost } from "~/sdk/endpoints";
import type { ApiResponse } from "./api.response";

export const registerUser = (userData: CreateUserType): Promise<ApiResponse<AuthResponseType>> =>
  sdkPost<AuthResponseType>("/api/User/register", userData);

export const signInUser = (credentials: SignInType): Promise<ApiResponse<AuthResponseType>> =>
  sdkPost<AuthResponseType>("/api/User/sign-in", credentials);
