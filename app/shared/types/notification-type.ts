import { UserType } from "./user-type";

export interface NotificationType {
    id: string;
    userId: string;
    senderUser: UserType;
    type: 'share' | 'follow' | 'follow-request' | 'like' | 'comment' | 'comment-reply' | string;
    message: string;
    postId?: string;
    commentId?: string;
    followerId?: string;
    likeId?: string;
    imageUrl?: string;
    isRead: boolean;
    createdAt: string;
}

