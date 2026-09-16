export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown;
}

export type ApiErrorItem = { field?: string; error?: string; message?: string };
