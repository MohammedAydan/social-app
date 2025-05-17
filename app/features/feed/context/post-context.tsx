import { createContext, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import {
    likePost,
    sharePost,
    deletePost as apiDeletePost
} from "~/shared/api";
import type { CommentType } from "~/shared/types/comment-type";
import type { PostType } from "~/shared/types/post-types";
import { useFeed } from "../hooks/use-feed";

interface PostContextProps {
    post: PostType | null;
    comments: CommentType[];
    loadingSharePost: boolean;
    deletePostLoading: boolean;
    toggleLike: () => Promise<void>;
    incrementCommentsCounter: () => void;
    decrementCommentsCounter: () => void;
    sharePostHandler: () => Promise<void>;
    deletePostHandler: () => Promise<void>;
}

const initialContext: PostContextProps = {
    post: null,
    comments: [],
    loadingSharePost: false,
    deletePostLoading: false,
    toggleLike: async () => {
        throw new Error("PostContext not initialized");
    },
    incrementCommentsCounter: () => {
        throw new Error("PostContext not initialized");
    },
    decrementCommentsCounter: () => {
        throw new Error("PostContext not initialized");
    },
    sharePostHandler: async () => {
        throw new Error("PostContext not initialized");
    },
    deletePostHandler: async () => {
        throw new Error("PostContext not initialized");
    },
};

export const PostContext = createContext<PostContextProps>(initialContext);

interface PostProviderProps {
    children: ReactNode;
    initialPostData: PostType;
}

export const PostProvider = ({
    children,
    initialPostData
}: PostProviderProps) => {
    const [post, setPost] = useState<PostType | null>(initialPostData);
    const [comments, setComments] = useState<CommentType[]>([]);
    const [loadingSharePost, setLoadingSharePost] = useState(false);
    const [deletePostLoading, setDeletePostLoading] = useState(false);

    const { addPostLocal, deletePostLocal } = useFeed();

    // Toggle like status locally before API call
    const toggleLikeLocal = useCallback(() => {
        setPost((prevPost) => {
            if (!prevPost) return prevPost;

            return {
                ...prevPost,
                isLiked: !prevPost.isLiked,
                likesCount: prevPost.isLiked
                    ? Math.max(0, prevPost.likesCount - 1)
                    : prevPost.likesCount + 1,
            };
        });
    }, []);

    // Toggle post like with optimistic update
    const toggleLike = useCallback(async () => {
        if (!post) {
            toast.error("Cannot like post", { description: "Post data is missing" });
            return;
        }

        try {
            // Optimistic update
            toggleLikeLocal();

            // API call
            await likePost(post.id);
        } catch (error) {
            // Revert on error
            toggleLikeLocal();
            toast.error("Failed to like post", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }, [post, toggleLikeLocal]);

    // Increment comments counter
    const incrementCommentsCounter = useCallback(() => {
        setPost((prevPost) => {
            if (!prevPost) return prevPost;

            return {
                ...prevPost,
                commentsCount: prevPost.commentsCount + 1,
            };
        });
    }, []);

    // Decrement comments counter
    const decrementCommentsCounter = useCallback(() => {
        setPost((prevPost) => {
            if (!prevPost) return prevPost;

            return {
                ...prevPost,
                commentsCount: Math.max(0, prevPost.commentsCount - 1),
            };
        });
    }, []);

    // Share post handler
    const sharePostHandler = useCallback(async () => {
        if (!post) {
            toast.error("Cannot share post", { description: "Post data is missing" });
            return;
        }

        try {
            setLoadingSharePost(true);

            const response = await sharePost({
                parentPostId: post.id,
                visibility: "public"
            });

            if (response.data) {
                addPostLocal(response.data);
                toast.success("Post shared successfully");
            }
        } catch (error) {
            toast.error("Failed to share post", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setLoadingSharePost(false);
        }
    }, [post, addPostLocal]);

    // Delete post handler
    const deletePostHandler = useCallback(async () => {
        if (!post) {
            toast.error("Cannot delete post", { description: "Post data is missing" });
            return;
        }

        try {
            setDeletePostLoading(true);

            const response = await apiDeletePost(post.id);

            if (response.status === 200 || response.status === 201 || response.status === 204) {
                deletePostLocal(post.id);
                setPost(null);
                toast.success("Post deleted successfully");
            } else {
                throw new Error("Failed to delete post");
            }
        } catch (error) {
            toast.error("Failed to delete post", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
        } finally {
            setDeletePostLoading(false);
        }
    }, [post, deletePostLocal]);

    // Context value
    const contextValue: PostContextProps = {
        post,
        comments,
        loadingSharePost,
        deletePostLoading,
        toggleLike,
        incrementCommentsCounter,
        decrementCommentsCounter,
        sharePostHandler,
        deletePostHandler,
    };

    return (
        <PostContext.Provider value={contextValue}>
            {children}
        </PostContext.Provider>
    );
};