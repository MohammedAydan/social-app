import { useState } from "react";
import { Card } from "~/components/ui/card";
import UserAvatar from "~/shared/components/user-avatar";
import type { CommentType } from "~/shared/types/comment-type";
import { Button } from "~/components/ui/button";
import AddReplyCommentSection from "./add-reply-comment-section";
import { BadgeCheck, Trash2 } from "lucide-react";
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

const CommentCard = ({ comment }: { comment: CommentType }) => {
    const [replySection, setReplySection] = useState(false);
    const { user } = useAuth();

    return (
        <Card className="w-fit border-0 shadow-none bg-transparent p-4 transition-all hover:bg-muted/50 z-0">
            <div className="flex items-start gap-4">
                <Link to={`/profile/${comment.userId}`}>
                    <UserAvatar
                        size={48}
                        url={comment?.user?.profileImageUrl}
                        username={comment?.user?.userName}
                    />
                </Link>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <Link to={`/profile/${comment.userId}`}>
                                <h4 className="font-semibold text-foreground text-sm tracking-tight flex items-center gap-2">
                                    {comment?.user?.userName} {comment?.user?.isVerified && (<BadgeCheck className="text-primary" size={20} />)}
                                </h4>
                            </Link>
                            <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        {user?.id == comment.userId && (<DeleteComment commentId={comment?.id} />)}
                    </div>
                    <div className="rounded-xl rounded-tl-none bg-card border border-border p-4 text-sm text-foreground shadow-sm transition-shadow hover:shadow-md w-fit">
                        <p>{comment.content}</p>
                    </div>
                    {replySection && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            <AddReplyCommentSection parentId={comment.id} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default CommentCard;