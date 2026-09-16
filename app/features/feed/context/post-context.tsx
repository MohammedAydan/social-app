import {
    createContext,
    useState,
    useCallback,
    useEffect,
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
import { normalizeVisibility } from "~/shared/types/post-types";
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

    // Keep local state in sync when the parent passes a new post object
    // (feed refresh, pagination, query refetch). Without this the card
    // renders stale like/comment counters.
    useEffect(() => {
        setPost(initialPostData);
    }, [initialPostData]);

    const { addPostLocal, deletePostLocal, updatePostLocal } = useFeed();

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

        const wasLiked = post.isLiked;
        toggleLikeLocal();
        try {
            // handleRequest resolves to an envelope (success:false) instead of
            // throwing, so the result must be inspected explicitly.
            // POST is the only Like write op (DELETE → 405), so it serves as
            // the toggle for both directions.
            const response = await likePost(post.id);
            if (!response.success) {
                const msg = response.message ?? "Unknown error";
                const lower = msg.toLowerCase();
                const stateUnchanged = lower.includes("duplicate") || lower.includes("already");
                if (stateUnchanged) {
                    // Server says the like state didn't change: the optimistic
                    // update is right only when liking (already liked). When
                    // unliking, the like still exists → revert to liked.
                    if (wasLiked) toggleLikeLocal(); // revert
                    return;
                }
                toggleLikeLocal(); // revert
                toast.error(wasLiked ? "Failed to unlike post" : "Failed to like post", {
                    description: msg
                });
            }
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
            const response = await sharePost({ parentPostId: post.id, visibility: "Public" });
            if (response.success && response.data) {
                addPostLocal(response.data);
                toast.success("Post shared successfully");
            } else {
                toast.error("Failed to share post", {
                    description: response.message ?? "The post may be private, deleted, or blocked."
                });
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
                toast.error("Failed to delete post", { description: response.message });
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
        const normalized = {
            ...updatedPost,
            visibility: normalizeVisibility((updatedPost as PostType).visibility),
        } as PostType;
        setPost(prev => prev ? { ...prev, ...normalized } : prev);
        updatePostLocal(normalized);
    }, [updatePostLocal]);

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
