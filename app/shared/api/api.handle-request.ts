import type { ApiResponse } from "./api.response";

type ResponseLike<T> = { data: ApiResponse<T> };

type RequestError = Error & {
    response?: { data?: ApiResponse<unknown> };
};

export const handleRequest = async <T>(request: Promise<ResponseLike<T>>): Promise<ApiResponse<T>> => {
    try {
        const response = await request;
        return response.data;
    } catch (error: unknown) {
        const requestError = error as RequestError;
        if (requestError.response?.data) return requestError.response.data as ApiResponse<T>;
        throw new Error(requestError.message || "Unknown error");
    }
};
