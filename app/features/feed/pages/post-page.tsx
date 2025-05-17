import { useParams } from "react-router";
import { getPost } from "~/shared/api";
import { PostProvider } from "../context/post-context";
import { CommentsProvider } from "../context/comments-context";
import PostCard from "~/shared/components/post/post-card";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import PostHeader from "~/shared/components/post/post-header";
import PostContent from "~/shared/components/post/post-content";
import SharingPostCard from "~/shared/components/post/sharing-post-card";
import PostFooter from "~/shared/components/post/post-footer";
import { useQuery } from "@tanstack/react-query";
import LoadingPost from "~/shared/components/post/loading-post";
import CommentsSection from "~/features/feed/components/comments-sections";

const PostPage = () => {
    const params = useParams();
    if (!params.postId) {
        return "not found"
    }
    const { data, error, isLoading, isPending } = useQuery({
        queryKey: ["post", params?.postId],
        queryFn: () => getPost(params?.postId ?? "").then(res => res.data),
    });

    if (isLoading || isPending) {
        return (
            <div className="w-full pt-16 pl-0 md:pl-16  flex flex-col items-center">
                <LoadingPost />
            </div>
        )
    }

    if (data == null || error) {
        return (
            <div className="w-full pt-16 pl-0 md:pl-16  flex flex-col items-center justify-center">
                <p>{error ? "An error occurred while fetching the post." : "Post not found."}</p>
            </div>
        );
    }


    return (
        <div className='w-full pt-16 pl-0 md:pl-16  flex flex-col items-center bg-background h-screen'>
            <PostProvider initialPostData={data} key={data?.id}>
                <div className="w-full max-w-3xl my-4">
                    <Card className='w-full shadow-xs'>
                        <CardHeader>
                            <PostHeader isPostPage={true} />
                        </CardHeader>

                        <CardContent className="flex flex-col gap-2">
                            <PostContent />
                            {(data?.parentPostId != null && data?.parentPost != null) && (<SharingPostCard post={data?.parentPost} />)}
                        </CardContent>

                        <CardFooter className='w-full'>
                            <PostFooter />
                        </CardFooter>
                    </Card>
                </div>

                <CommentsProvider>
                    <CommentsSection />
                </CommentsProvider>
            </PostProvider>
        </div>
    )
}

export default PostPage;


