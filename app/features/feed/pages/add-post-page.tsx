import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import type { CreateMediaRequest, CreatePostType } from '~/shared/types/create-post-type';
import { useNavigate } from 'react-router';
import { createPost } from '~/shared/api';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import FullMDXEditor from './_editor';
import AddPostForm from '../components/add-post-form';

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
                <SelectTrigger className="w-full">
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

export default function AddPostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [media, setMedia] = useState<CreateMediaRequest[]>([]);
    const navigate = useNavigate();

    const { mutate, isPending } = useMutation({
        mutationFn: (post: CreatePostType) => createPost(post),
        onSuccess: () => {
            toast.success('Success', {
                description: 'Post created successfully',
            });
            resetForm();
            navigate("/");
        },
        onError: (error) => {
            toast.error('Error', {
                description: error?.message || 'Failed to create post',
            });
        },
    });

    const resetForm = () => {
        setTitle('');
        setContent('');
        setVisibility('public');
        setMedia([]);
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
        <main className="p-4 max-w-5xl mx-auto mt-16">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Add Post</h1>
                <Button onClick={handleSubmit} disabled={isPending || (title.length === 0 && content.length === 0)}>
                    {isPending ? 'Creating...' : 'Create Post'}
                </Button>
            </header>

            <Tabs defaultValue="basic" className="w-full">
                <div className="flex justify-between items-center mb-5">
                    <TabsList className="">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <VisibilitySelector
                        visibility={visibility}
                        setVisibility={setVisibility}
                        isPending={isPending}
                    />
                </div>

                <TabsContent value="basic">
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
                </TabsContent>

                <TabsContent value="advanced">
                    <FullMDXEditor initialMarkdown={content} onChange={setContent} />
                    <section className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-semibold mb-4">Markdown Output:</h2>
                        <pre className="bg-foreground/5 border p-4 rounded-md overflow-x-auto">{content}</pre>
                    </section>
                </TabsContent>
            </Tabs>
        </main>
    );
}
