import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import ActionButton from '~/shared/components/post/action-button';
import { Repeat } from 'lucide-react';
import { usePost } from '../hooks/use-post';
import Loading from '~/shared/components/loading';

const SharePostButton = ({ count }: { count: number }) => {
    const [open, setOpen] = useState(false);
    const { sharePostHandler, loadingSharePost } = usePost();

    const handleShare = async () => {
        // Add your share logic here
        await sharePostHandler();
        setOpen(false);

    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <ActionButton icon={<Repeat strokeWidth={2.5} className='text-primary' />} text={`(${count})`} />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share post</DialogTitle>
                </DialogHeader>
                <div>
                    Are you sure you want to share this post?
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleShare}>{loadingSharePost ? (<Loading size='20px' />) : ("Share")} </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SharePostButton;