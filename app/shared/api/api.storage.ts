import type { ApiResponse } from "./api.response";
import api from "./axios";

export const uploadAsset = async (
    payload: UploadAssetType
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
            }
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw new Error(error.message || "Unknown registration error");
    }
};

export interface UploadAssetType {
    file: File;
    type: 'image' | 'video' | 'audio' | 'other';
}