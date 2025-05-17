import { MediaType } from "./media-type";

export interface UpdatePostRequest {
    id?: string;
    title?: string;
    content?: string;
    visibility: string;
    media: MediaType[];
}