import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "~/components/ui/card";
import UserAvatar from "~/shared/components/user-avatar";
import type { CommentType } from "~/shared/types/comment-type";
import { Button } from "~/components/ui/button";
import AddReplyCommentSection from "./add-reply-comment-section";
import { BadgeCheck, MessageCircle, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "~/components/ui/dialog";
import DeleteComment from "./delete-comment";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { Link } from "react-router";
import { getCommentReplies } from "~/shared/api";
import { formatRelativeTime } from "~/lib/utils";
import { getDisplayName, getHandle } from "~/shared/utils/display-name";

const CommentCard = ({ comment }: { comment: CommentType }) => {
    const [replySection, setReplySection] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const { user } = useAuth();

    const { data: replies, isLoading: repliesLoading } = useQuery({
        queryKey: ["comment-replies", comment.id],
        queryFn: async () => {
            const res = await getCommentReplies(comment.id);
            if (!res.success) throw new Error(res.message || "Failed to load replies");
            const raw: unknown = res.data;
            return (Array.isArray(raw) ? raw : (raw as { items?: CommentType[]; data?: CommentType[] } | null)?.items ?? (raw as { data?: CommentType[] } | null)?.data ?? []) as CommentType[];
        },
        enabled: showReplies,
        retry: 1,
    });

    const replyCount = comment.repliesCount ?? replies?.length ?? 0;
    const displayName = getDisplayName(comment?.user);
    const handle = getHandle(comment?.user);

    return (
        <Card className="w-fit border-0 shadow-none bg-transparent p-4 transition-all hover:bg-muted/50 z-0">
            <div className="flex items-start gap-4">
                <Link to={`/profile/${comment.userId}`}>
                    <UserAvatar
                        size={48}
                        url={comment?.user?.profileImageUrl}
                        username={comment?.user?.userName}
                        displayName={displayName}
                    />
                </Link>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <Link to={`/profile/${comment.userId}`}>
                                <h4 className="font-semibold text-foreground text-sm tracking-tight flex items-center gap-1.5">
                                    <span className="hover:underline underline-offset-2">{displayName}</span>
                                    {comment?.user?.isVerified && (<BadgeCheck className="text-primary" size={16} />)}
                                    {handle && (
                                        <span className="font-normal text-xs text-muted-foreground">{handle}</span>
                                    )}
                                </h4>
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                {(() => { try { return formatRelativeTime(comment.createdAt); } catch { return ""; } })()}
                            </span>
                        </div>
                        {user?.id == comment.userId && (<DeleteComment commentId={comment?.id} />)}
                    </div>
                    <div className="rounded-xl rounded-tl-none bg-card border border-border p-4 text-sm text-foreground shadow-sm transition-shadow hover:shadow-md w-fit">
                        <p>{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setReplySection(v => !v)}>
                            <MessageCircle className="h-3.5 w-3.5 mr-1" /> Reply
                        </Button>
                        {replyCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowReplies(v => !v)}>
                                {showReplies ? "Hide" : "View"} {replyCount} {replyCount === 1 ? "reply" : "replies"}
                            </Button>
                        )}
                    </div>
                    {replySection && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                            <AddReplyCommentSection parentId={comment.id} />
                        </div>
                    )}
                    {showReplies && (
                        <div className="mt-2 space-y-2 border-l-2 border-muted pl-3">
                            {repliesLoading && <p className="text-xs text-muted-foreground">Loading replies…</p>}
                            {(replies ?? []).map((reply) => (
                                <CommentCard key={reply.id} comment={reply} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default CommentCard;