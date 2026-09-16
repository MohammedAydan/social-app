export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode = "UNKNOWN_ERROR",
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof TypeError) return new ApiError("Network request failed", "NETWORK_ERROR");
  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("An unexpected error occurred");
}
