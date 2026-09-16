import { accessTokenKey, refreshTokenKey } from "./strings.js";
// access token
export const saveAccessToken = (accessToken) => {
    if (accessToken == null)
        return;
    localStorage.setItem(accessTokenKey, accessToken);
};
export const getAccessToken = () => {
    return localStorage.getItem(accessTokenKey) ?? null;
};
export const removeAccessToken = () => {
    localStorage.removeItem(accessTokenKey);
};
// refresh token
export const saveRefreshToken = (refreshToken) => {
    if (refreshToken == null)
        return;
    localStorage.setItem(refreshTokenKey, refreshToken);
};
export const getRefreshToken = () => {
    return localStorage.getItem(refreshTokenKey) ?? null;
};
export const removeRefreshToken = () => {
    localStorage.removeItem(refreshTokenKey);
};
