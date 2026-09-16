import { customInstance, normalizeApiResponse, pageParams } from "./custom-instance";
import type { ApiResponse } from "~/shared/api/api.response";

const request = <T>(config: Parameters<typeof customInstance>[0], options?: Parameters<typeof customInstance>[1]) =>
  customInstance<unknown>(config, options).then((value) => normalizeApiResponse<T>(value));

export const sdkGet = <T>(url: string, params?: Record<string, unknown>) =>
  request<T>({ method: "GET", url, params });
export const sdkPost = <T>(url: string, data?: unknown) =>
  request<T>({ method: "POST", url, data });
export const sdkPut = <T>(url: string, data?: unknown) =>
  request<T>({ method: "PUT", url, data });
export const sdkDelete = <T>(url: string, params?: Record<string, unknown>) =>
  request<T>({ method: "DELETE", url, params });

export { pageParams };
export type { ApiResponse };

export const sdkRequest = request;

export const sdkRefreshToken = (refreshToken: string) =>
  customInstance<{ success?: boolean; data?: { accessToken?: string; refreshToken?: string } }>({
    method: "POST",
    url: "/api/User/refresh-token",
    data: { refreshToken },
  });

export const sdkUpload = <T>(data: FormData) =>
  request<T>({ method: "POST", url: "/api/storage/upload", data }, { headers: { "Content-Type": "multipart/form-data" } });
