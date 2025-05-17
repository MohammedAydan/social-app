import {
    createContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { toast } from "sonner";
import { getFeed } from "~/shared/api";
import type { PostType } from "~/shared/types/post-types";

// Constants
const PAGE_LIMIT = 10;
const SCROLL_THRESHOLD = 100;

interface FeedContextProps {
    posts: PostType[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    fetchNext: () => Promise<void>;
    addPostLocal: (post: PostType) => void;
    deletePostLocal: (postId: string) => void;
}

const initialContext: FeedContextProps = {
    posts: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    fetch: async () => {
        throw new Error("FeedContext not initialized");
    },
    fetchNext: async () => {
        throw new Error("FeedContext not initialized");
    },
    addPostLocal: () => {
        throw new Error("FeedContext not initialized");
    },
    deletePostLocal: () => {
        throw new Error("FeedContext not initialized");
    },
};

export const FeedContext = createContext<FeedContextProps>(initialContext);

interface FeedProviderProps {
    children: ReactNode;
}

export const FeedProvider = ({ children }: FeedProviderProps) => {
    // State variables
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch initial feed data
    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getFeed(1, PAGE_LIMIT);

            if (response.status != 200) {
                throw new Error("Failed to fetch feed");
            }

            setPosts(response.data || []);
            setHasMore((response.data || []).length === PAGE_LIMIT);
            setCurrentPage(1);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch feed";
            setError(errorMessage);
            toast.error("Error loading feed", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    // Fetch next page of feed data
    const fetchNext = useCallback(async () => {
        // Don't fetch if already loading more, no more data, or initial load in progress
        if (isLoadingMore || !hasMore || isLoading) return;

        setIsLoadingMore(true);

        try {
            const nextPage = currentPage + 1;
            const response = await getFeed(nextPage, PAGE_LIMIT);

            if (response.status! - 200) {
                throw new Error("Failed to fetch more posts");
            }

            const newPosts = response.data || [];

            setPosts(prevPosts => [...prevPosts, ...newPosts]);
            setHasMore(newPosts.length === PAGE_LIMIT);
            setCurrentPage(nextPage);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch more posts";
            setError(errorMessage);
            toast.error("Error loading more posts", { description: errorMessage });
        } finally {
            setIsLoadingMore(false);
        }
    }, [currentPage, isLoading, isLoadingMore, hasMore]);

    // Add a post to the local state
    const addPostLocal = useCallback((post: PostType) => {
        setPosts(prevPosts => {
            // Check if post already exists
            const exists = prevPosts.some(p => p.id === post.id);
            if (exists) return prevPosts;

            // Add new post at the beginning
            return [post, ...prevPosts];
        });
    }, []);

    // Remove a post from the local state
    const deletePostLocal = useCallback((postId: string) => {
        setPosts(prevPosts => prevPosts.filter(post => post?.id !== postId));
    }, []);

    // Initial fetch
    useEffect(() => {
        // Set isLoading to false first to avoid fetch guard
        setIsLoading(false);
        fetch();
    }, []);

    // Handle scroll for infinite loading
    const handleScroll = useCallback(() => {
        if (isLoading || isLoadingMore || !hasMore) return;

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - SCROLL_THRESHOLD) {
            fetchNext();
        }
    }, [isLoading, isLoadingMore, hasMore, fetchNext]);

    // Set up scroll listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Context value
    const contextValue: FeedContextProps = {
        posts,
        isLoading,
        isLoadingMore,
        hasMore,
        error,
        fetch,
        fetchNext,
        addPostLocal,
        deletePostLocal,
    };

    return (
        <FeedContext.Provider value={contextValue}>
            {children}
        </FeedContext.Provider>
    );
};