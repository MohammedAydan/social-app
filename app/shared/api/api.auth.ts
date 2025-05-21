import type { AuthResponseType } from "../types/auth-response-type";
import type { CreateUserType } from "../types/create-user-type";
import type { SignInType } from "../types/sign-in-type";
import type { ApiResponse } from "./api.response";
import api from "./axios";

export const registerUser = async (
    userData: CreateUserType
): Promise<ApiResponse<AuthResponseType>> => {
    try {
        const response = await api.post<ApiResponse<AuthResponseType>>("/api/User/register", userData);
        return response.data; 
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error(error.message || "Unknown registration error");
    }
};

export const signInUser = async (
    credentials: SignInType
): Promise<ApiResponse<AuthResponseType>> => {
    try {
        const response = await api.post<ApiResponse<AuthResponseType>>("/api/User/sign-in", credentials);
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error(error.message || "Unknown sign-in error");
    }
};
