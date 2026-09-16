// api/api.auth.ts — Register/sign-in, backed by the generated SDK
// (`app/lib/sdk/endpoints/user`). No manual HTTP. `AuthResponseType` stays
// local: the spec has no auth-response model (it's the envelope's data).
import { postApiUserRegister, postApiUserSignIn } from "~/lib/sdk/endpoints/user/user";
import type { CreateUserRequest, SignIn } from "~/lib/sdk/models";
import {
    PostApiUserRegisterBody,
    PostApiUserSignInBody,
} from "~/lib/sdk/validations/user/user";
import type { AuthResponseType } from "../types/auth-response-type";
import { handleRequest } from "./api.handle-request";
import type { ApiResponse } from "./api.response";

export const registerUser = async (
    userData: CreateUserRequest
): Promise<ApiResponse<AuthResponseType>> =>
    handleRequest(postApiUserRegister(PostApiUserRegisterBody.parse(userData)));

export const signInUser = async (
    credentials: SignIn
): Promise<ApiResponse<AuthResponseType>> =>
    handleRequest(postApiUserSignIn(PostApiUserSignInBody.parse(credentials)));
