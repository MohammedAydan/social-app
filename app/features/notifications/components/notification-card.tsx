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
                    navigate(`/comment/${notification.commentId}`);
                }
                break;
            case 'follow':
            case 'follow-request':
                navigate(`/profile/${notification.senderUser.id}`);
                break;
            default:
                break;
        }
    };

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
                                    navigate(`/profile/${notification.senderUser.id}`);
                                }}
                            >
                                <UserAvatar
                                    url={notification?.senderUser?.profileImageUrl}
                                    username={notification?.senderUser?.userName}
                                />
                                <span className="text-sm font-medium hover:underline">
                                    {notification.senderUser.userName}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {notification.message.split(notification.message.split(" ")[0])[1]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

