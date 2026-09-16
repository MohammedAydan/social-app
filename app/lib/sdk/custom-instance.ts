import type { AxiosError, AxiosRequestConfig } from "axios";
import api from "~/shared/api/axios";

/**
 * Central Orval mutator for the generated SDK.
 *
 * Transport delegates to the app's hardened axios instance (`shared/api/axios`:
 * VITE_API_BASE_URL, x-api-key, Bearer attachment, single-flight 401 refresh)
 * instead of maintaining a second interceptor chain. The previous
 * `process.env.NEXT_PUBLIC_API_URL` base URL never resolved under Vite
 * (`process` is undefined in the browser) and the token key did not match the
 * app's storage keys, so no generated endpoint could authenticate.
 */
export const AXIOS_INSTANCE = api;

// Modern AbortController-based mutator for Orval + TanStack Query.
// Orval forwards the query's `signal` inside `config`, so cancellation
// works natively without the removed `axios.CancelToken` API.
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return api.request<T>({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
