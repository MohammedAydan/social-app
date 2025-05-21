import {
    registerUser,
    signInUser,
} from "~/shared/api";
import type { ApiResponse } from "~/shared/api/api.response";
import type { AuthResponseType } from "~/shared/types/auth-response-type";
import type { CreateUserType } from "~/shared/types/create-user-type";
import type { SignInType } from "~/shared/types/sign-in-type";
import {
    saveAccessToken,
    removeAccessToken,
} from "~/shared/utils/token";

export interface IAuthService {
    signIn(data: SignInType): Promise<ApiResponse<AuthResponseType>>;
    register(data: CreateUserType): Promise<ApiResponse<AuthResponseType>>;
    signOut(): Promise<void>;
}

export class AuthService implements IAuthService {
    async signIn(signInData: SignInType): Promise<ApiResponse<AuthResponseType>> {
        const response = await signInUser(signInData);

        if (response.success && response.data?.accessToken) {
            saveAccessToken(response.data.accessToken);
        }

        return response;
    }

    async register(registerData: CreateUserType): Promise<ApiResponse<AuthResponseType>> {
        const response = await registerUser(registerData);

        if (response.success && response.data?.accessToken) {
            saveAccessToken(response.data.accessToken);
        }

        return response;
    }

    async signOut(): Promise<void> {
        removeAccessToken();
    }
}
