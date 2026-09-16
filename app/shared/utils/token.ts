import { accessTokenKey, refreshTokenKey } from "./strings";

// access token

export const saveAccessToken = (accessToken?: string): void => {
    if (typeof window === "undefined" || accessToken == null) return;
    window.localStorage.setItem(accessTokenKey, accessToken);
}

export const getAccessToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(accessTokenKey) ?? null;
}

export const removeAccessToken = (): void => {
    if (typeof window !== "undefined") window.localStorage.removeItem(accessTokenKey);
}


// refresh token

export const saveRefreshToken = (refreshToken?: string): void => {
    if (typeof window === "undefined" || refreshToken == null) return;
    window.localStorage.setItem(refreshTokenKey, refreshToken);
}

export const getRefreshToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(refreshTokenKey) ?? null;
}

export const removeRefreshToken = (): void => {
    if (typeof window !== "undefined") window.localStorage.removeItem(refreshTokenKey);
}
