import { ApiClientError, type ApiEnvelope } from "~/sdk/api-client";
import { authApi } from "~/sdk/endpoints";
import type { ApiResponse } from "~/shared/api/api.response";
import type { AuthResponseType } from "~/shared/types/auth-response-type";
import type { CreateUserType } from "~/shared/types/create-user-type";
import type { SignInType } from "~/shared/types/sign-in-type";
import {
    saveAccessToken,
    removeAccessToken,
    saveRefreshToken,
    removeRefreshToken,
} from "~/shared/utils/token";

function toLegacyResponse(data: AuthResponseType, message = "Success"): ApiResponse<AuthResponseType> {
    return { success: true, message, data, errors: null };
}

function toErrorResponse(error: unknown): ApiResponse<AuthResponseType> {
    const clientError = error instanceof ApiClientError ? error : new Error("Authentication request failed");
    return { success: false, message: clientError.message, data: undefined, errors: clientError instanceof ApiClientError ? clientError.errors : clientError };
}

export interface IAuthService {
    signIn(data: SignInType): Promise<ApiResponse<AuthResponseType>>;
    register(data: CreateUserType): Promise<ApiResponse<AuthResponseType>>;
    signOut(): Promise<void>;
}

export class AuthService implements IAuthService {
    async signIn(signInData: SignInType): Promise<ApiResponse<AuthResponseType>> {
        try {
            const data = await authApi.signIn(signInData);
            const response = toLegacyResponse({ ...data, isSuccess: true });
            if (response.data?.accessToken) {
                saveAccessToken(response.data.accessToken);
                saveRefreshToken(response.data.refreshToken);
            }
            return response;
        } catch (error) {
            return toErrorResponse(error);
        }
    }

    async register(registerData: CreateUserType): Promise<ApiResponse<AuthResponseType>> {
        try {
            const data = await authApi.register<AuthResponseType>(registerData);
            const response = toLegacyResponse({ ...data, isSuccess: true });
            if (response.data?.accessToken) {
                saveAccessToken(response.data.accessToken);
                saveRefreshToken(response.data.refreshToken);
            }
            return response;
        } catch (error) {
            return toErrorResponse(error);
        }
    }

    async signOut(): Promise<void> {
        removeAccessToken();
        removeRefreshToken();
    }
}
