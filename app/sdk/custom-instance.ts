import axios, { isAxiosError, type AxiosRequestConfig } from "axios";
import { accessTokenKey, refreshTokenKey } from "~/shared/utils/strings";
import { removeAccessToken, removeRefreshToken, saveAccessToken, saveRefreshToken } from "~/shared/utils/token";
import type { ApiResponse } from "~/shared/api/api.response";

const apiUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.NEXT_PUBLIC_API_URL ?? "";

export const sdkAxios = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

let refreshRequest: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(refreshTokenKey);
  if (!refreshToken) return null;
  try {
    const response = await axios.post(`${apiUrl}/api/User/refresh-token`, { refreshToken }, {
      headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_API_KEY },
    });
    const data = response.data?.data;
    if (!response.data?.success || !data?.accessToken) return null;
    saveAccessToken(data.accessToken);
    if (data.refreshToken) saveRefreshToken(data.refreshToken);
    return data.accessToken;
  } catch { return null; }
};

sdkAxios.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(accessTokenKey) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) config.headers["x-api-key"] = apiKey;
  return config;
});

sdkAxios.interceptors.response.use((response) => response, async (error) => {
  const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
  if (error.response?.status === 401 && original && !original._retry && typeof window !== "undefined") {
    original._retry = true;
    refreshRequest ??= refreshAccessToken().finally(() => { refreshRequest = null; });
    const token = await refreshRequest;
    if (token) {
      original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
      return sdkAxios.request(original);
    }
    removeAccessToken();
    removeRefreshToken();
  }
  return Promise.reject(error);
});

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig, signal?: AbortSignal) =>
  sdkAxios({ ...config, ...options, signal }).then(({ data }) => data as T);

export const apiMessage = (error: unknown): string => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    const response = error.response?.data;
    if (Array.isArray(response?.errors)) return response.errors.map((item) => typeof item === "string" ? item : `${item.field ?? "Field"}: ${item.error ?? item.message ?? "Invalid value"}`).join("; ");
    return response?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
};

export const normalizeApiResponse = <T>(value: unknown): ApiResponse<T> => {
  if (value && typeof value === "object" && "success" in value) return value as ApiResponse<T>;
  return { success: true, message: "", data: value as T, errors: null };
};

export const MAX_PAGE_SIZE = 50;
export const pageParams = (page = 1, limit = 20) => ({ Page: page, Limit: Math.min(Math.max(limit, 1), MAX_PAGE_SIZE) });
export type ErrorType<E = unknown> = E;
export type BodyType<B = unknown> = B;
export type { ApiResponse };
export default sdkAxios;; 
