// api/axios.ts
import axios, { type AxiosRequestConfig } from "axios";
import { accessTokenKey, refreshTokenKey } from "../utils/strings";
import type { ApiResponse } from "./api.response";
import type { AuthResponseType } from "../types/auth-response-type";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(apiKey ? { "x-api-key": apiKey } : {}),
  },
});

interface RetryableConfig extends AxiosRequestConfig {
  __isRetryRequest?: boolean;
}

/** Endpoints that must never trigger a refresh cycle (avoid infinite loops). */
const NO_REFRESH_URLS = [
  "/api/User/sign-in",
  "/api/User/register",
  "/api/User/refresh-token",
  "/api/User/forget-password",
  "/api/User/reset-password",
  "/api/dashboard/User/sign-in",
  "/api/dashboard/User/refresh-token",
];

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) return false;
  return NO_REFRESH_URLS.some((u) => url.includes(u));
};

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

const notifyRefreshWaiters = (token: string | null) => {
  refreshWaiters.forEach((resolve) => resolve(token));
  refreshWaiters = [];
};

const clearTokens = () => {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
};

const redirectToSignIn = () => {
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/sign-in")) {
    window.location.href = "/sign-in";
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(accessTokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (RetryableConfig & { url?: string }) | undefined;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || typeof window === "undefined") {
      return Promise.reject(error);
    }

    // Never attempt refresh for auth endpoints themselves, or twice for one request.
    if (originalRequest.__isRetryRequest || shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    // A second 401 arriving while a refresh is in flight waits for its outcome.
    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => {
        refreshWaiters.push(resolve);
      });
      if (token) {
        originalRequest.__isRetryRequest = true;
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
        return api.request(originalRequest);
      }
      return Promise.reject(error);
    }

    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem(refreshTokenKey);
      if (!refreshToken) {
        clearTokens();
        notifyRefreshWaiters(null);
        return Promise.reject(error);
      }
      // Bypass interceptors: a failing refresh must not re-enter this handler.
      const refreshResponse = await axios.post<ApiResponse<AuthResponseType>>(
        `${apiUrl}/api/User/refresh-token`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(apiKey ? { "x-api-key": apiKey } : {}),
          },
        }
      );
      const payload = refreshResponse.data;
      const newToken = payload?.data?.accessToken;
      const newRefreshToken = payload?.data?.refreshToken;
      if (refreshResponse.status === 200 && payload?.success && newToken) {
        localStorage.setItem(accessTokenKey, newToken);
        if (newRefreshToken) localStorage.setItem(refreshTokenKey, newRefreshToken);
        notifyRefreshWaiters(newToken);
        originalRequest.__isRetryRequest = true;
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newToken}` };
        return api.request(originalRequest);
      }
      clearTokens();
      notifyRefreshWaiters(null);
      redirectToSignIn();
    } catch {
      clearTokens();
      notifyRefreshWaiters(null);
      redirectToSignIn();
    } finally {
      isRefreshing = false;
    }
    return Promise.reject(error);
  }
);

export default api;
