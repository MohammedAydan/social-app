import { UserType } from "./user-type";

export interface AuthResponseType {
    message?: string;
    errors?: string[];
    user?: UserType;
    type?: string;
    accessToken?: string;
    refreshToken?: string;
    isSuccess: boolean;
}