import PostHeader from './post-header';
import PostContent from './post-content';
import type { PostType } from '~/shared/types/post-types';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

const SharingPostCard = ({ post }: { post: PostType }) => {

  return (
    <Link to={`/post/${post?.id}`}>
      <div className="w-full max-w-3xl my-4">
        <Card className='w-full shadow-xs'>
          <CardHeader>
            <PostHeader isPostSharing={true} />
          </CardHeader>

          <CardContent className="flex flex-col gap-2">
            <PostContent post={post} />
            {(post.parentPostId != null && post.parentPost != null) && (<SharingPostCard post={post.parentPost} />)}
          </CardContent>
        </Card>
      </div>
    </Link>
  )
}

export default SharingPostCard;