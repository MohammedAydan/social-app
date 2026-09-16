import {
    registerUser,
    signInUser,
} from "~/shared/api";
import type { ApiResponse } from "~/shared/api/api.response";
import type { AuthResponseType } from "~/shared/types/auth-response-type";
import type { CreateUserRequest, SignIn } from "~/lib/sdk/models";
import { postApiUserLogout } from "~/lib/sdk/endpoints/user/user";
import {
    saveAccessToken,
    removeAccessToken,
    saveRefreshToken,
    removeRefreshToken,
} from "~/shared/utils/token";

export interface IAuthService {
    signIn(data: SignIn): Promise<ApiResponse<AuthResponseType>>;
    register(data: CreateUserRequest): Promise<ApiResponse<AuthResponseType>>;
    signOut(): Promise<void>;
}

export class AuthService implements IAuthService {
    async signIn(signInData: SignIn): Promise<ApiResponse<AuthResponseType>> {
        const response = await signInUser(signInData);

        if (response.success && response.data?.accessToken) {
            saveAccessToken(response.data.accessToken);
            saveRefreshToken(response.data.refreshToken);
        }

        return response;
    }

    async register(registerData: CreateUserRequest): Promise<ApiResponse<AuthResponseType>> {
        const response = await registerUser(registerData);

        if (response.success && response.data?.accessToken) {
            saveAccessToken(response.data.accessToken);
            saveRefreshToken(response.data.refreshToken);
        }

        return response;
    }

    async signOut(): Promise<void> {
        try {
            await postApiUserLogout();
        } catch {
            // Best-effort: clear local state even when offline/expired.
        } finally {
            removeAccessToken();
            removeRefreshToken();
        }
    }
}
