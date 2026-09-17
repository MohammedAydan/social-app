import { useState } from "react";
import { BadgeCheck, Ban, CheckCircle, Ellipsis, Flag, Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { usePost } from '~/features/feed/hooks/use-post';
import DeletePost from '~/features/feed/components/delete-post';
import ReportPostDialog from '~/features/feed/components/report-post-dialog';
import UserAvatar from '../user-avatar';
import { useAuth } from '~/features/auth/hooks/use-auth';
import { formatRelativeTime } from '~/lib/utils';
import UpdatePostDialog from '~/features/feed/pages/update-post';
import Loading from '~/shared/components/loading';
import { useBlockUser, useIsBlocked } from '~/features/profile/hooks/use-block-user';
import { getDisplayName, getHandle } from '~/shared/utils/display-name';
import type { PostType } from '~/shared/types/post-types';

interface PostHeaderProps {
    isPostSharing?: boolean;
    isPostPage?: boolean;
    /** Explicit post for nested share cards (avoids reading top-level context). */
    post?: PostType | null;
}

const PostHeader = ({ isPostSharing = false, isPostPage = false, post: postOverride }: PostHeaderProps) => {
    const { post: contextPost } = usePost();
    const { user } = useAuth();
    const post = postOverride ?? contextPost;

    const formattedDate = post?.createdAt
        ? formatRelativeTime(post.createdAt)
        : 'Unknown Date';

    const userInfo = isPostSharing ? post?.parentPost?.user : post?.user;
    const userId = isPostSharing ? post?.parentPost?.userId : post?.userId;

    const displayName = getDisplayName(userInfo);
    const handle = getHandle(userInfo);
    const profileImageUrl = userInfo?.profileImageUrl || '';
    const isVerified = userInfo?.isVerified || false;
    const isOwnPost = !!user?.id && !!post?.userId && user.id === post.userId;

    return (
        <div className="flex justify-between items-center gap-3">
            {/* User info section */}
            <Link to={`/profile/${userId}`} className="flex items-center gap-3 min-w-0 group">
                <UserAvatar url={profileImageUrl} username={userInfo?.userName} displayName={displayName} />

                <div className="flex flex-col min-w-0">
                    <h2 className="font-semibold flex items-center gap-1.5 truncate group-hover:underline underline-offset-2">
                        <span className="truncate">{displayName}</span>
                        {isVerified && (<BadgeCheck className="text-primary shrink-0" size={18} />)}
                    </h2>
                    <p className="text-xs text-foreground/50 truncate">
                        {handle && <span className="text-foreground/60">{handle} · </span>}{formattedDate}
                    </p>
                </div>
            </Link>

            {/* Post actions dropdown (only show if not sharing) */}
            {!isPostSharing && isOwnPost && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Ellipsis className="h-4 w-4" />
                            <span className="sr-only">Open post menu</span>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="min-w-[150px]">
                        {!post?.parentPostId && (
                            <UpdatePostDialog />
                        )}
                        <DeletePost isNavigate={isPostPage} />
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Others' posts: expose Block author (two-way block, §2.3). */}
            {!isPostSharing && !isOwnPost && !!user?.id && !!post?.userId && (
                <BlockAuthorMenu authorId={post.userId} authorName={userInfo?.userName} postId={post?.id ?? ""} />
            )}
        </div>
    );
};

/** Dropdown with Block confirm + Report dialog for the post author. */
const BlockAuthorMenu = ({ authorId, authorName, postId }: { authorId: string; authorName?: string; postId: string }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const { data: isBlocked } = useIsBlocked(authorId);
    const { block, unblock, isPending } = useBlockUser(authorId);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Ellipsis className="h-4 w-4" />
                        <span className="sr-only">Open post menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[150px]">
                    {postId ? (
                        <DropdownMenuItem onClick={() => setReportOpen(true)}>
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                        </DropdownMenuItem>
                    ) : null}
                    {isBlocked ? (
                        <DropdownMenuItem onClick={unblock} disabled={isPending}>
                            Unblock{authorName ? ` @${authorName}` : ""}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => setConfirmOpen(true)}
                            className="text-red-500 focus:text-red-500"
                        >
                            <Ban className="mr-2 h-4 w-4" />
                            Block{authorName ? ` @${authorName}` : ""}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Block{authorName ? ` @${authorName}` : " this user"}?</DialogTitle>
                        <DialogDescription>
                            You won't see each other's posts, and likes, comments,
                            shares, and follows between you will be rejected.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => {
                                block();
                                setConfirmOpen(false);
                            }}
                        >
                            {isPending ? <Loading size="20px" /> : "Block"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {postId ? (
                <ReportPostDialog postId={postId} open={reportOpen} onOpenChange={setReportOpen} />
            ) : null}
        </>
    );
};

export default PostHeader;