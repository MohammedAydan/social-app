import type { ApiResponse } from "./api.response.js";

/**
 * The manual layer passes an `AxiosResponse` (body at `.data`); the generated
 * SDK's `customInstance` already unwraps axios, so SDK calls resolve to the
 * body (the envelope) itself. Envelope and AxiosResponse both carry a `data`
 * key, so the guard keys on `status`+`config`, which only AxiosResponse has.
 */
const isAxiosResponse = (value: unknown): value is { data: unknown } =>
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "config" in value &&
    "data" in value;

export const handleRequest = async <T>(request: Promise<any>): Promise<ApiResponse<T>> => {
    try {
        const response = await request;
        return (isAxiosResponse(response) ? response.data : response) as ApiResponse<T>;
    } catch (error: any) {
        // console.log(error);
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error(error.message || "Unknown error");
    }
};
