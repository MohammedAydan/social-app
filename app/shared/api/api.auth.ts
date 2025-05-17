// api/api.auth.ts
import type { AuthResponseType } from "../types/auth-response-type";
import type { CreateUserType } from "../types/create-user-type";
import type { SignInType } from "../types/sign-in-type";
import api from "./axios";

export const registerUser = async (userData: CreateUserType): Promise<AuthResponseType> => {
    const { data } = await api.post("/api/User/register", userData);
    return data;
};

export const signInUser = async (credentials: SignInType): Promise<AuthResponseType> => {
    const { data } = await api.post("/api/User/sign-in", credentials);
    return data;
};

