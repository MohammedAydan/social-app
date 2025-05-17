import { accessTokenKey } from "./strings";

export const saveAccessToken = (accessToken?: string): void => {
    if (accessToken == null) return;
    localStorage.setItem(accessTokenKey, accessToken);
}

export const getAccessToken = (): string | null => {
    return localStorage.getItem(accessTokenKey) ?? null;
}

export const removeAccessToken = (): void => {
    localStorage.removeItem(accessTokenKey);
}
