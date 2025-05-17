import React, { useState } from 'react'
import { useComments } from '../hooks/use-comments';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import Loading from '~/shared/components/loading';

const AddCommentSection = () => {
    const [comment, setComment] = useState("");
    const { addComment, loadingAddComment, error } = useComments();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (comment.trim() === "") return;
        addComment(comment);
        setComment("");
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 pl-0 md:pl-16  p-3"
            >
                <div className="p-4 bg-card w-full border rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between gap-3">
                        <Input
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={loadingAddComment}
                        />
                        <Button
                            type="submit"
                            disabled={loadingAddComment || comment.trim().length === 0}
                        >
                            {loadingAddComment ? <Loading size="20px" /> : "Post"}
                        </Button>
                    </div>
                    {error && (
                        <p className="text-red-500 mt-2">Failed to post comment. Please try again.</p>
                    )}
                </div>
            </form>
        </div>
    )
}

export default AddCommentSection