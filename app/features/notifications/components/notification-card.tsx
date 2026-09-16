import { cva } from 'class-variance-authority';
import {
    Bell,
    Share2,
    UserPlus,
    Heart,
    MessageCircle,
    Reply,
    CheckCircle,
    XCircle,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router';
import { Button } from '~/components/ui/button';
import { cn, formatRelativeTime } from '~/lib/utils';
import UserAvatar from '~/shared/components/user-avatar';
import { getDisplayName } from '~/shared/utils/display-name';
import type { NotificationType } from '~/shared/types/notification-type';

// Icon mapping
const NOTIFICATION_ICONS = {
    share: Share2,
    follow: UserPlus,
    'follow-request': UserPlus,
    like: Heart,
    comment: MessageCircle,
    'comment-reply': Reply,
    default: Bell,
};

// Icon styling
const iconVariants = cva("p-3 rounded-full", {
    variants: {
        variant: {
            share: "text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50",
            follow: "text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-950/50",
            "follow-request": "text-yellow-500 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/50",
            like: "text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-950/50",
            comment: "text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/50",
            "comment-reply": "text-indigo-500 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/50",
            default: "text-muted-foreground bg-muted",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

// Badge styling
const badgeVariants = cva(
    "px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
    {
        variants: {
            variant: {
                share: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
                follow: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                "follow-request": "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
                like: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
                comment: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
                "comment-reply": "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
                default: "bg-muted text-muted-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface NotificationCardProps {
    notification: NotificationType;
    className?: string;
    onFollow?: (userId: string) => void;
    onAcceptRequest?: (userId: string) => void;
    onRejectRequest?: (userId: string) => void;
    onViewPost?: (postId: string) => void;
    onViewComment?: (commentId: string) => void;
}

export function NotificationCard({
    notification,
    className,
    onAcceptRequest,
    onRejectRequest,
    onViewPost,
    onViewComment,
}: NotificationCardProps) {
    const navigate = useNavigate();

    const Icon =
        NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] ||
        NOTIFICATION_ICONS.default;

    const variant = Object.keys(NOTIFICATION_ICONS).includes(notification.type)
        ? (notification.type as keyof typeof NOTIFICATION_ICONS)
        : 'default';

    const handleCardClick = () => {
        switch (notification.type) {
            case 'like':
            case 'comment':
            case 'share':
                if (notification.postId) {
                    onViewPost?.(notification.postId);
                    navigate(`/post/${notification.postId}`);
                }
                break;
            case 'comment-reply':
                if (notification.commentId) {
                    onViewComment?.(notification.commentId);
                    navigate(`/post/${notification.postId ?? ''}`);
                }
                break;
            case 'follow':
            case 'follow-request':
                if (notification.senderUser?.id ?? notification.followerId) {
                    navigate(`/profile/${notification.senderUser?.id ?? notification.followerId}`);
                }
                break;
            default:
                break;
        }
    };

    const senderName = notification.senderUser
        ? getDisplayName(notification.senderUser)
        : (notification.lastActorName?.trim() || "Someone");
    const senderAvatar = notification.senderUser?.profileImageUrl ?? notification.imageUrl ?? "";
    // Inbox follow-requests carry the requester in `userId` (senderUser and
    // followerId are null there — verified live 2026-09-17); the pending
    // endpoint uses `followerId`. Without this fallback the Accept/Decline
    // buttons never render on inbox cards.
    const requesterId =
        notification.senderUser?.id ??
        notification.followerId ??
        (notification.type === "follow-request" ? notification.userId : undefined);
    // Inbound follow request awaiting my decision (API_REFERENCE §5).
    const isFollowRequest = notification.type === "follow-request" && !!requesterId;
    // Messages arrive aggregated ("X and N others ..."); never crash on odd shapes.
    const messageBody = typeof notification.message === "string"
        ? notification.message.replace(/^\S+\s/, "")
        : "";

    return (
        <div className={cn("w-full", className)}>
            <div
                className="bg-card text-card-foreground rounded-lg border shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="flex items-start p-4 gap-4">
                    <div className={cn(iconVariants({ variant }))}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-grow space-y-2">
                        <div className="flex items-center justify-between">
                            <span className={cn(badgeVariants({ variant }))}>
                                {notification.type.replace(/-/g, ' ')}
                            </span>
                            {notification.createdAt && (
                                <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(notification.createdAt)}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div
                                className="flex items-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent triggering card click
                                    const targetId = notification.senderUser?.id ?? notification.followerId;
                                    if (targetId) navigate(`/profile/${targetId}`);
                                }}
                            >
                                <UserAvatar
                                    url={senderAvatar}
                                    username={notification.senderUser?.userName}
                                    displayName={senderName}
                                />
                                <span className="text-sm font-medium hover:underline">
                                    {senderName}
                                    {notification.actorCount != null && notification.actorCount > 1 && (
                                        <span className="text-muted-foreground"> +{notification.actorCount - 1}</span>
                                    )}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {messageBody}
                                </span>
                            </div>
                            {isFollowRequest && (onAcceptRequest || onRejectRequest) && (
                                <div
                                    className="flex gap-2 pt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {onAcceptRequest && (
                                        <Button
                                            size="sm"
                                            onClick={() => onAcceptRequest(requesterId as string)}
                                        >
                                            <CheckCircle className="mr-1 h-4 w-4" />
                                            Accept
                                        </Button>
                                    )}
                                    {onRejectRequest && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onRejectRequest(requesterId as string)}
                                        >
                                            <XCircle className="mr-1 h-4 w-4" />
                                            Decline
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

