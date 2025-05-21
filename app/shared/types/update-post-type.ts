import type { CreateMediaRequest } from "./create-post-type";

export interface UpdatePostRequest {
    id?: string;
    title?: string;
    content?: string;
    visibility: string;
    media: CreateMediaRequest[] | [];
}