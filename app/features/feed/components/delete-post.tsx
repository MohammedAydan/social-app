import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '~/components/ui/dialog';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import Loading from '~/shared/components/loading';
import { usePost } from '../hooks/use-post';
import { useNavigate } from 'react-router';

const DeletePost = ({ isNavigate = false }: { isNavigate?: boolean }) => {
    const { deletePostHandler, deletePostLoading } = usePost();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await deletePostHandler();
            setOpen(false);

            if (isNavigate) {
                navigate("/");
            }
        } catch (error) {
            console.error('Failed to delete post', error);
        }
    };

    const handleDropdownClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDropdownClick}
                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Post</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={deletePostLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deletePostLoading}
                    >
                        {deletePostLoading ? <Loading size="20px" /> : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeletePost;