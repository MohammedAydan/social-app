import { Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { useComments } from '../hooks/use-comments'
import Loading from '~/shared/components/loading'

const DeleteComment = ({ commentId }: { commentId: string }) => {
    const { removeComment, loadingDeleteComment } = useComments();
    const [open, setOpen] = useState(false);
    // Replace this with your actual delete logic
    const handleDelete = async () => {
        // delete comment logic here
        await removeComment(commentId);
        setOpen(false);
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setOpen(true)}
                >
                    <Trash2 />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Comment</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loadingDeleteComment}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loadingDeleteComment}>
                        {!loadingDeleteComment ? ("Delete") : (<Loading size='20px' />)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteComment