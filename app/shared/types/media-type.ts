export interface MediaType {
    id: string;
    postId: string;
    userId: string;
    name: string;
    type: string; // image, video, audio, file
    url: string;
    thumbnailUrl: string;
    createdAt: Date;
    updatedAt: Date;
}