import type { AxiosProgressEvent } from "axios";
import { sdkUpload } from "~/sdk/endpoints";
import type { ApiResponse } from "./api.response";

export const uploadAsset = async (payload: UploadAssetType, _progressEvent?: (progressEvent: AxiosProgressEvent) => void): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("type", payload.type);
  return sdkUpload<string>(formData);
};

export interface UploadAssetType { file: File; type: "image" | "video" | "audio" | "file"; }
