import { Card, CardContent, CardFooter, CardHeader } from '~/components/ui/card';
import PostHeader from './post-header';
import PostContent from './post-content';
import PostFooter from './post-footer';
import SharingPostCard from './sharing-post-card';
import type { PostType } from '~/shared/types/post-types';
import { PostProvider } from '~/features/feed/context/post-context';

const PostCard = ({ post }: { post: PostType }) => {
    return (
        <PostProvider initialPostData={post} key={post.id}>
            <div className="w-full max-w-3xl my-4">
                <Card className='w-full shadow-xs'>
                    <CardHeader>
                        <PostHeader />
                    </CardHeader>

                    <CardContent className="flex flex-col gap-2 w-full">
                        <PostContent />
                        {(post.parentPostId != null && post.parentPost != null) && (<SharingPostCard post={post.parentPost} />)}
                    </CardContent>

                    <CardFooter className='w-full'>
                        <PostFooter />
                    </CardFooter>
                </Card>
            </div>
        </PostProvider>
    );
}

export default PostCard;
