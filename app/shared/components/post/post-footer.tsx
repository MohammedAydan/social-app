import ActionButton from './action-button'
import { MessageCircle } from 'lucide-react'
import LikeActionButton from './like-action-button'
import { useNavigate } from 'react-router'
import type { PostType } from '~/shared/types/post-types'
import { usePost } from '~/features/feed/hooks/use-post'
import SharePostButton from '~/features/feed/components/share-post-button'

const PostFooter = () => {
    const { post } = usePost();
    const navigate = useNavigate();

    return (
        <div className='w-full flex justify-between gap-2'>
            <LikeActionButton />
            <ActionButton
                icon={<MessageCircle
                    strokeWidth={2.5}
                    className='text-primary'
                />}
                onClick={() => navigate(`/post/${post?.id}`)}
                text={`(${post?.commentsCount})`}
            />
            <SharePostButton count={post?.shareingsCount ?? 0} />
        </div>
    )
}

export default PostFooter;