import type { AxiosError, AxiosRequestConfig } from 'axios';
// Single transport: every SDK call goes through the hardened shared axios
// instance, which attaches the Bearer token (ACCESS_TOKEN key), the x-api-key
// header, and handles 401 refresh. A standalone instance lived here before and
// read a never-written 'access_token' key, so no Authorization header was ever
// sent: every authenticated call 401'd right after login, and the resulting
// checkAuth failure wiped the tokens (logout on refresh).
import api from '../../shared/api/axios';

export const AXIOS_INSTANCE = api;

// Modern AbortController-based mutator for Orval + TanStack Query.
// Orval forwards the query's `signal` inside `config`, so cancellation
// works natively without the removed `axios.CancelToken` API.
// Returns the unwrapped envelope (`data`); `handleRequest` accepts both this
// shape and full AxiosResponses.
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return api({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
