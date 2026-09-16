import { isAxiosError } from "axios";
import { apiMessage, normalizeApiResponse } from "~/sdk/custom-instance";
import type { ApiResponse } from "./api.response";

export const handleRequest = async <T>(request: Promise<unknown>): Promise<ApiResponse<T>> => {
    try {
        return normalizeApiResponse<T>(await request);
    } catch (error) {
        if (isAxiosError<ApiResponse<T>>(error) && error.response?.data) return error.response.data;
        throw new Error(apiMessage(error));
    }
};
