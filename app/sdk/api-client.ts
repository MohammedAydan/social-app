import { getAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken, saveAccessToken, saveRefreshToken } from "~/shared/utils/token";

export interface ApiErrorItem {
  field?: string;
  error?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiErrorItem[] | null;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: ApiErrorItem[] | null = null,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

function toUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const url = new URL(path, API_BASE_URL || window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url;
}

async function request<T>(path: string, init: RequestInit = {}, query?: Record<string, string | number | boolean | null | undefined>, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (API_KEY) headers.set("X-API-Key", API_KEY);

  const accessToken = typeof window !== "undefined" ? getAccessToken() : null;
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(toUrl(path, query), { ...init, headers });
  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (response.status === 401 && retry && typeof window !== "undefined") {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshed = await fetch(toUrl("/api/User/refresh-token"), {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const refreshEnvelope = (await refreshed.json().catch(() => null)) as ApiEnvelope<{ accessToken?: string; refreshToken?: string }> | null;
      if (refreshed.ok && refreshEnvelope?.data?.accessToken) {
        saveAccessToken(refreshEnvelope.data.accessToken);
        saveRefreshToken(refreshEnvelope.data.refreshToken);
        return request<T>(path, init, query, false);
      }
    }
    removeAccessToken();
    removeRefreshToken();
  }

  if (!response.ok || !envelope?.success) {
    throw new ApiClientError(envelope?.message ?? `Request failed with status ${response.status}`, response.status, envelope?.errors ?? null);
  }

  return envelope.data as T;
}

export const apiClient = {
  get: <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => request<T>(path, { method: "GET" }, query),
  post: <T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) => request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }, query),
  put: <T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | null | undefined>) => request<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) }, query),
  delete: <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => request<T>(path, { method: "DELETE" }, query),
};
