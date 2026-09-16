import type { UserType } from "./user-type";

export interface NotificationType {
    id: string;
    userId: string;
    recipientId?: string;
    senderUser: UserType;
    type: 'share' | 'follow' | 'follow-request' | 'like' | 'comment' | 'comment-reply' | string;
    message: string;
    postId?: string;
    commentId?: string;
    followerId?: string;
    likeId?: string;
    imageUrl?: string;
    isRead: boolean;
    /** ADR-010 smart-inbox aggregation fields (optional for legacy rows). */
    groupKey?: string | null;
    actorCount?: number;
    lastActorName?: string | null;
    priority?: number;
    isDeferred?: boolean;
    createdAt: string;
    updatedAt?: string;
}

/** GET /api/Notifications/inbox envelope payload. */
export interface NotificationInboxResponse {
    items: NotificationType[];
    total: number;
    unreadCount: number;
}

