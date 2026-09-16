import type { ApiResponse } from "./api.response";

export const handleRequest = async <T>(request: Promise<any>): Promise<ApiResponse<T>> => {
    try {
        const response = await request;
        return response.data;
    } catch (error: any) {
        // console.log(error);
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error(error.message || "Unknown error");
    }
};