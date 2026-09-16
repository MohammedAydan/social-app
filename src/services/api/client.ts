import { toApiError, ApiError } from "./errors";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, baseUrl || "http://localhost:3000");
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  return url;
}

async function request<T>(baseUrl: string, apiKey: string | undefined, path: string, options: RequestOptions = {}) {
  const { query, body, headers, ...init } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(buildUrl(baseUrl, path, query), {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(apiKey ? { "x-api-key": apiKey } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload: unknown = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      const code = response.status === 401 ? "UNAUTHORIZED" : response.status === 403 ? "FORBIDDEN" : response.status === 404 ? "NOT_FOUND" : response.status >= 500 ? "SERVER_ERROR" : "UNKNOWN_ERROR";
      throw new ApiError(typeof payload === "string" ? payload : "Request failed", code, response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out", "NETWORK_ERROR");
    }
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}

export function createApiClient(config: { baseUrl: string; apiKey?: string }) {
  return {
    get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => request<T>(config.baseUrl, config.apiKey, path, { ...options, method: "GET" }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => request<T>(config.baseUrl, config.apiKey, path, { ...options, method: "POST", body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => request<T>(config.baseUrl, config.apiKey, path, { ...options, method: "PUT", body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) => request<T>(config.baseUrl, config.apiKey, path, { ...options, method: "PATCH", body }),
    delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => request<T>(config.baseUrl, config.apiKey, path, { ...options, method: "DELETE" }),
  };
}
