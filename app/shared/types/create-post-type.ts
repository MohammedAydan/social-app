export interface CreateMediaRequest {
    postId: string;
    name: string;
    type: string; // image, video, audio, file
    url: string;
    thumbnailUrl: string;
}

export interface CreatePostType {
    title?: string;
    content?: string;
    visibility: string; // Default visibility is "Public"
    media: CreateMediaRequest[];
}