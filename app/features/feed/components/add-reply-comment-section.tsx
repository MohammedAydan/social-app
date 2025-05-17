import { useState } from "react";
import { useComments } from "../hooks/use-comments";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Loading from "~/shared/components/loading";

const AddReplyCommentSection = ({
    parentId,
}: {
    parentId: string;
}) => {
    const [reply, setReply] = useState("");
    const { addReplyComment, loadingAddReplyComment, error } = useComments();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reply.trim() === "") return;
        addReplyComment(reply, parentId);
        setReply("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl border rounded-2xl p-2 m-2"
        >
            <div className="flex items-center justify-between gap-3">
                <Input
                    placeholder="Enter reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={loadingAddReplyComment}
                />
                <Button
                    type="submit"
                    disabled={loadingAddReplyComment || reply.trim().length < 1}
                >
                    {loadingAddReplyComment ? <Loading size="20px" /> : "Post Reply"}
                </Button>
            </div>
            {error && (
                <p className="text-red-500 mt-2">
                    Failed to post reply. Please try again.
                </p>
            )}
        </form>
    );
};

export default AddReplyCommentSection;