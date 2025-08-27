import { accessTokenKey, refreshTokenKey } from "./strings";

// access token

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


// refresh token

export const saveRefreshToken = (refreshToken?: string): void => {
    if (refreshToken == null) return;
    localStorage.setItem(refreshTokenKey, refreshToken);
}

export const getRefreshToken = (): string | null => {
    return localStorage.getItem(refreshTokenKey) ?? null;
}

export const removeRefreshToken = (): void => {
    localStorage.removeItem(refreshTokenKey);
}
