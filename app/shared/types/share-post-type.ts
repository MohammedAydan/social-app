export interface SharePostRequest {
    parentPostId: string;
    title?: string;
    content?: string;
    visibility: string;
}