'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CreateMediaRequest, CreatePostType } from './create-post-type';
import { createPost } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Callback for successful post creation
}

export const CreatePostDialog = ({ open, onClose, onSuccess }: Props) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [media, setMedia] = useState<CreateMediaRequest[]>([]);

    const { mutate, isPending, error } = useMutation({
        mutationFn: (post: CreatePostType) => createPost(post),
        onSuccess: () => {
            toast.success("Success", {
                description: 'Post created successfully',
            });
            resetForm();
            onClose();
            onSuccess?.();
        },
        onError: (error) => {
            toast.error("Error", {
                description: error.message || 'Failed to create post',
            });
        }
    });

    const addMedia = () => {
        setMedia([
            ...media,
            { postId: '', name: '', type: 'image', url: '', thumbnailUrl: '' },
        ]);
    };

    const updateMediaField = (index: number, field: keyof CreateMediaRequest, value: string) => {
        const updated = [...media];
        updated[index][field] = value;
        setMedia(updated);
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setMedia([]);
        setVisibility('public');
    };

    const handleSubmit = () => {
        const post: CreatePostType = {
            title,
            content,
            visibility,
            media,
        };
        mutate(post);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                resetForm();
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <div className="text-red-500 text-sm">
                            {error.message}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <div>
                        <Label>Visibility</Label>
                        <Select
                            value={visibility}
                            onValueChange={setVisibility}
                            disabled={isPending}
                        >
                            <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label>Media</Label>
                        {media.map((m, index) => (
                            <div key={index} className="border p-3 rounded-md space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Name"
                                        value={m.name}
                                        onChange={(e) => updateMediaField(index, 'name', e.target.value)}
                                        disabled={isPending}
                                    />
                                    <Select
                                        value={m.type}
                                        onValueChange={(value) => updateMediaField(index, 'type', value)}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="file">File</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Input
                                    placeholder="URL"
                                    value={m.url}
                                    onChange={(e) => updateMediaField(index, 'url', e.target.value)}
                                    disabled={isPending}
                                />
                                <Input
                                    placeholder="Thumbnail URL"
                                    value={m.thumbnailUrl}
                                    onChange={(e) => updateMediaField(index, 'thumbnailUrl', e.target.value)}
                                    disabled={isPending}
                                />
                                <Button
                                    variant="destructive"
                                    onClick={() => removeMedia(index)}
                                    disabled={isPending}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={addMedia}
                            disabled={isPending}
                        >
                            + Add Media
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? 'Creating...' : 'Create Post'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};