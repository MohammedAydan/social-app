import { registerUser, signInUser } from "~/shared/api";
import type { AuthResponseType } from "~/shared/types/auth-response-type";
import type { CreateUserType } from "~/shared/types/create-user-type";
import type { SignInType } from "~/shared/types/sign-in-type";
import { removeAccessToken, saveAccessToken } from "~/shared/utils/token";

export interface IAuthService {
    signIn: (signInData: SignInType) => Promise<AuthResponseType>;
    register: (registerData: CreateUserType) => Promise<AuthResponseType>;
    signOut: () => Promise<void>;
}

export class AuthService implements IAuthService {
    async signIn(signInData: SignInType): Promise<AuthResponseType> {
        const response = await signInUser(signInData);
        saveAccessToken(response.accessToken);
        return response;
    }

    async register(registerData: CreateUserType): Promise<AuthResponseType> {
        const response = await registerUser(registerData);
        saveAccessToken(response.accessToken);
        return response;
    }

    async signOut(): Promise<void> {
        removeAccessToken();
    }
}
