/**
 * The manual layer passes an `AxiosResponse` (body at `.data`); the generated
 * SDK's `customInstance` already unwraps axios, so SDK calls resolve to the
 * body (the envelope) itself. Envelope and AxiosResponse both carry a `data`
 * key, so the guard keys on `status`+`config`, which only AxiosResponse has.
 */
const isAxiosResponse = (value) => typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "config" in value &&
    "data" in value;
export const handleRequest = async (request) => {
    try {
        const response = await request;
        return (isAxiosResponse(response) ? response.data : response);
    }
    catch (error) {
        // console.log(error);
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error(error.message || "Unknown error");
    }
};
