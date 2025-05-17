import Loading from "~/shared/components/loading";
import { useComments } from "../hooks/use-comments";
import type { CommentType } from "~/shared/types/comment-type";
import CommentCard from "./comment-card";
import AddCommentSection from "./add-commnet-section";

const CommentsSection = () => {
    const { isLoading, isFetchingNextPage, error, comments } = useComments();

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-5 mt-3">
                <Loading size="50px" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex items-center justify-center mt-3">
                <p>An error occurred while fetching the comments.</p>
            </div>
        );
    }

    return (
        <div className="mt-3 pb-32 relative w-full max-w-3xl">
            {comments.length > 0 ? (
                comments.map((comment: CommentType) => (
                    <CommentCard
                        key={comment.id}
                        comment={comment}
                    />
                ))
            ) : (
                <div className="w-full flex items-center justify-center text-muted-foreground py-8">
                    No comments yet
                </div>
            )}
            {isFetchingNextPage && (
                <div className="w-full flex flex-col items-center justify-center p-5 mt-3">
                    <Loading size="50px" />
                </div>
            )}
            <AddCommentSection />
        </div>
    )
}

export default CommentsSection