import {
    createContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";
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
    loadingSharePost: boolean;
    deletePostLoading: boolean;
    toggleLike: () => Promise<void>;
    incrementCommentsCounter: () => void;
    decrementCommentsCounter: () => void;
    sharePostHandler: () => Promise<void>;
    deletePostHandler: () => Promise<void>;
    updatePostLocalHandler?: (post: PostType) => void;
}

const initialContext: PostContextProps = {
    post: null,
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

export const PostProvider = ({ children, initialPostData }: PostProviderProps) => {
    const [post, setPost] = useState<PostType | null>(initialPostData);
    const [loadingSharePost, setLoadingSharePost] = useState(false);
    const [deletePostLoading, setDeletePostLoading] = useState(false);

    const { addPostLocal, deletePostLocal } = useFeed();

    const toggleLikeLocal = useCallback(() => {
        setPost(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1,
            };
        });
    }, []);

    const toggleLike = useCallback(async () => {
        if (!post) return;

        toggleLikeLocal();
        try {
            await likePost(post.id);
        } catch (error) {
            toggleLikeLocal(); // revert
            toast.error("Failed to like post", {
                description: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }, [post, toggleLikeLocal]);

    const incrementCommentsCounter = useCallback(() => {
        setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
    }, []);

    const decrementCommentsCounter = useCallback(() => {
        setPost(prev => prev ? { ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) } : prev);
    }, []);

    const sharePostHandler = useCallback(async () => {
        if (!post) return;

        setLoadingSharePost(true);
        try {
            const response = await sharePost({ parentPostId: post.id, visibility: "public" });
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

    const deletePostHandler = useCallback(async () => {
        if (!post) return;

        setDeletePostLoading(true);
        try {
            const response = await apiDeletePost(post.id);
            if (response.success) {
                deletePostLocal(post?.id);
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

    const updatePostLocalHandler = useCallback((updatedPost: PostType) => {
        setPost(prev => prev ? { ...prev, ...updatedPost } : prev);
    }, []);

    return (
        <PostContext.Provider
            value={{
                post,
                loadingSharePost,
                deletePostLoading,
                toggleLike,
                incrementCommentsCounter,
                decrementCommentsCounter,
                updatePostLocalHandler,
                sharePostHandler,
                deletePostHandler,
            }}
        >
            {children}
        </PostContext.Provider>
    );
};
