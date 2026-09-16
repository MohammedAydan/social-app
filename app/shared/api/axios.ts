// api/axios.ts
import axios from "axios";
import { accessTokenKey, refreshTokenKey } from "../utils/strings";
import type { ApiResponse } from "./api.response";
import type { AuthResponseType } from "../types/auth-response-type";

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "x-api-key": apiKey,
  },
});

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
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      !error.config.__isRetryRequest
    ) {
      try {
        const refreshToken = localStorage.getItem(refreshTokenKey);
        if (!refreshToken) {
          localStorage.removeItem(accessTokenKey);
          return Promise.reject(error);
        }
        const refreshResponse = await api.post<ApiResponse<AuthResponseType>>("/api/User/refresh-token", {
          refreshToken,
        });
        if (refreshResponse.status === 200 && refreshResponse.data?.success) {
          const newToken = refreshResponse.data?.data?.accessToken;
          const newRefreshToken = refreshResponse.data?.data?.refreshToken;
          if (newToken) {
            localStorage.setItem(accessTokenKey, newToken);
            if (newRefreshToken) localStorage.setItem(refreshTokenKey, newRefreshToken);
            error.config.headers["Authorization"] = `Bearer ${newToken}`;
            error.config.__isRetryRequest = true;
            return api.request(error.config);
          }
        }
        localStorage.removeItem(accessTokenKey);
        localStorage.removeItem(refreshTokenKey);
      } catch (refreshError) {
        localStorage.removeItem(accessTokenKey);
        localStorage.removeItem(refreshTokenKey);
      }
    }
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem(accessTokenKey);
      localStorage.removeItem(refreshTokenKey);
    }
    return Promise.reject(error);
  }
);

export default api;
