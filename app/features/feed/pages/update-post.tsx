import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Label } from '~/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import FullMDXEditor from './_editor';
import AddPostForm from '../components/add-post-form';

import type { CreateMediaRequest, CreatePostType } from '~/shared/types/create-post-type';
import type { PostType } from '~/shared/types/post-types';
import type { UpdatePostRequest } from '~/shared/types/update-post-type';
import { updatePost } from '~/shared/api';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import { Pencil } from 'lucide-react';
import { usePost } from '../hooks/use-post';

function VisibilitySelector({
    visibility,
    setVisibility,
    isPending,
}: {
    visibility: 'public' | 'private';
    setVisibility: (value: 'public' | 'private') => void;
    isPending: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <Label>Visibility:</Label>
            <Select
                value={visibility}
                onValueChange={(value) => setVisibility(value as 'public' | 'private')}
                disabled={isPending}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

export default function UpdatePostDialog() {
    const { post, updatePostLocalHandler } = usePost();
    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [media, setMedia] = useState<CreateMediaRequest[]>([]);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setVisibility(post.visibility);
            setMedia(post.media || []);
        }
    }, [post]);

    const { mutate, isPending } = useMutation({
        mutationFn: (updatedPost: UpdatePostRequest) => updatePost(updatedPost),
        onSuccess: () => {
            if (updatePostLocalHandler) {
                updatePostLocalHandler({
                    ...post,
                    title,
                    content,
                    visibility,
                    media,
                } as PostType);
            }
            toast.success('Post updated successfully');
            setOpen(false);
        },
        onError: (error) => {
            toast.error('Error updating post', {
                description: error?.message || 'Something went wrong',
            });
        },
    });

    const handleSubmit = () => {
        if (!post?.id) return;
        const updatedPost: UpdatePostRequest = {
            id: post.id,
            title,
            content,
            visibility,
            media,
        };
        mutate(updatedPost);
    };

    const handleDropdownClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    onClick={handleDropdownClick}
                    className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent className="w-full max-w-6xl p-6 overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription>
                        Make changes to your post. Click update when you're done.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <div className="flex justify-between items-center mb-5">
                        <VisibilitySelector
                            visibility={visibility}
                            setVisibility={setVisibility}
                            isPending={isPending}
                        />
                    </div>
                    <AddPostForm
                        title={title}
                        setTitle={setTitle}
                        content={content}
                        setContent={setContent}
                        visibility={visibility}
                        setVisibility={setVisibility}
                        media={media}
                        setMedia={setMedia}
                        isPending={isPending}
                    />
                </div>

                <DialogFooter className="mt-6">
                    <Button onClick={handleSubmit} disabled={isPending || (!title && !content)}>
                        {isPending ? 'Updating...' : 'Update Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    );
}
