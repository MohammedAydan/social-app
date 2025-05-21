import {
    createContext,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
    useState,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { usePost } from "../hooks/use-post";
import {
    createComment,
    createReplyComment,
    deleteComment,
    deleteReplyComment,
    getPostComments,
} from "~/shared/api";
import type { CommentType } from "~/shared/types/comment-type";

// Constants
const COMMENTS_PER_PAGE = 10;
const SCROLL_THRESHOLD = 100;

// Context type definition
interface CommentsContextProps {
    comments: CommentType[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    error: Error | null;
    loadingAddComment: boolean;
    loadingAddReplyComment: boolean;
    loadingDeleteComment: boolean;
    addComment: (comment: string) => Promise<void>;
    addReplyComment: (parentId: string, comment: string) => Promise<void>;
    removeComment: (commentId: string) => Promise<void>;
    removeReplyComment: (replyId: string) => Promise<void>;
    refetchComments: () => void;
}

// Create context with initial values
const initialContext: CommentsContextProps = {
    comments: [],
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    error: null,
    loadingAddComment: false,
    loadingAddReplyComment: false,
    loadingDeleteComment: false,
    addComment: async () => {
        throw new Error("CommentsContext not initialized");
    },
    addReplyComment: async () => {
        throw new Error("CommentsContext not initialized");
    },
    removeComment: async () => {
        throw new Error("CommentsContext not initialized");
    },
    removeReplyComment: async () => {
        throw new Error("CommentsContext not initialized");
    },
    refetchComments: () => {
        throw new Error("CommentsContext not initialized");
    },
};

export const CommentsContext = createContext<CommentsContextProps>(initialContext);

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
    const { post, incrementCommentsCounter, decrementCommentsCounter } = usePost();
    const [loadingAddComment, setLoadingAddComment] = useState(false);
    const [loadingAddReplyComment, setLoadingAddReplyComment] = useState(false);
    const [loadingDeleteComment, setLoadingDeleteComment] = useState(false);

    // Fetch comments with infinite scroll
    const {
        data,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["comments", post?.id],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getPostComments(post?.id || "", pageParam, COMMENTS_PER_PAGE);
            return {
                data: response.data,
                nextPage: response.data?.length === COMMENTS_PER_PAGE ? pageParam + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: Boolean(post?.id),
        initialPageParam: 1,
    });

    // Flatten comments from all pages
    const comments = useMemo(
        () => data?.pages.flatMap((page) => page.data || []) || [],
        [data]
    );

    const refetchComments = useCallback(() => {
        refetch();
    }, [refetch]);

    // Add a new comment
    const addComment = useCallback(
        async (content: string) => {
            if (!content.trim()) {
                toast.error("Comment cannot be empty");
                return;
            }

            try {
                setLoadingAddComment(true);
                if (!post?.id) throw new Error("Post not found");

                await createComment({ postId: post.id, content });
                incrementCommentsCounter();
                await refetch();

                toast.success("Comment added successfully");
            } catch (error) {
                toast.error("Failed to add comment", {
                    description: error instanceof Error ? error.message : "Unknown error",
                });
            } finally {
                setLoadingAddComment(false);
            }
        },
        [post?.id, incrementCommentsCounter, refetch]
    );

    // Add a reply to a comment
    const addReplyComment = useCallback(
        async (parentId: string, content: string) => {
            if (!content.trim()) {
                toast.error("Reply cannot be empty");
                return;
            }

            try {
                setLoadingAddReplyComment(true);
                if (!post?.id) throw new Error("Post not found");

                await createReplyComment({ postId: post.id, content, parentId });
                incrementCommentsCounter();
                await refetch();

                toast.success("Reply added successfully");
            } catch (error) {
                toast.error("Failed to add reply", {
                    description: error instanceof Error ? error.message : "Unknown error",
                });
            } finally {
                setLoadingAddReplyComment(false);
            }
        },
        [post?.id, incrementCommentsCounter, refetch]
    );

    // Delete a comment
    const removeComment = useCallback(
        async (commentId: string) => {
            try {
                setLoadingDeleteComment(true);
                await deleteComment(commentId);
                decrementCommentsCounter();
                await refetch();

                toast.success("Comment removed");
            } catch (error) {
                toast.error("Failed to remove comment", {
                    description: error instanceof Error ? error.message : "Unknown error",
                });
            } finally {
                setLoadingDeleteComment(false);
            }
        },
        [decrementCommentsCounter, refetch]
    );

    // Delete a reply
    const removeReplyComment = useCallback(
        async (replyId: string) => {
            try {
                await deleteReplyComment(replyId);
                decrementCommentsCounter();
                await refetch();

                toast.success("Reply removed");
            } catch (error) {
                toast.error("Failed to remove reply", {
                    description: error instanceof Error ? error.message : "Unknown error",
                });
            }
        },
        [decrementCommentsCounter, refetch]
    );

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - SCROLL_THRESHOLD;

            if (scrollPosition >= documentHeight && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Context value
    const contextValue = {
        comments,
        isLoading,
        isFetchingNextPage,
        hasNextPage: Boolean(hasNextPage),
        error,
        loadingAddComment,
        loadingAddReplyComment,
        loadingDeleteComment,
        addComment,
        addReplyComment,
        removeComment,
        removeReplyComment,
        refetchComments,
    };

    return (
        <CommentsContext.Provider value={contextValue}>
            {children}
        </CommentsContext.Provider>
    );
};