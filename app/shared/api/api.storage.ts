import type { AxiosProgressEvent } from "axios";
import type { ApiResponse } from "./api.response";
import api from "./axios";

export const uploadAsset = async (
    payload: UploadAssetType,
    progressEvent?: (progressEvent: AxiosProgressEvent) => void
): Promise<ApiResponse<string>> => {
    try {
        const formData = new FormData();
        formData.append("file", payload.file);
        formData.append("type", payload.type);

        const response = await api.post<ApiResponse<string>>(
            "/api/storage/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress(event) {
                    if (progressEvent) {
                        progressEvent(event);
                    }
                }
            }
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        // Return a standardized error response instead of throwing
        return {
            success: false,
            data: "",
            message: error.message || "Unknown upload error"
        };
    }
};

export interface UploadAssetType {
    file: File;
    type: 'image' | 'video' | 'audio' | 'file';
}