import { BadgeCheck, CheckCircle, Ellipsis, Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { usePost } from '~/features/feed/hooks/use-post';
import DeletePost from '~/features/feed/components/delete-post';
import UserAvatar from '../user-avatar';
import { useAuth } from '~/features/auth/hooks/use-auth';
import { formatRelativeTime } from '~/lib/utils';
import UpdatePostDialog from '~/features/feed/pages/update-post';

interface PostHeaderProps {
    isPostSharing?: boolean;
    isPostPage?: boolean;
}

const PostHeader = ({ isPostSharing = false, isPostPage = false }: PostHeaderProps) => {
    const { post } = usePost();
    const { user } = useAuth();

    const formattedDate = post?.createdAt
        ? formatRelativeTime(post.createdAt)
        : 'Unknown Date';

    const userName = post?.user?.userName || 'Unknown User';
    const profileImageUrl = post?.user?.profileImageUrl || '';
    const isVerified = post?.user?.isVerified || false;
    const userId = post?.userId;

    return (
        <div className="flex justify-between items-center gap-3">
            {/* User info section */}
            <Link to={`/profile/${userId}`} className="flex items-center gap-3">
                <UserAvatar url={profileImageUrl} username={userName} />

                <div className="flex flex-col">
                    <h2 className="font-medium flex items-center gap-2">
                        {post?.user?.userName} {post?.user?.isVerified && (<BadgeCheck className="text-primary" size={20} />)}
                    </h2>
                    <p className="text-xs text-foreground/50">{formattedDate}</p>
                </div>
            </Link>

            {/* Post actions dropdown (only show if not sharing) */}
            {!isPostSharing && user?.id == post?.userId && (
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
        </div>
    );
};

export default PostHeader;