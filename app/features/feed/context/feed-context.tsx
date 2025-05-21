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

const PAGE_LIMIT = 10;

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
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getFeed(1, PAGE_LIMIT);
      if (!response.success) throw new Error("Failed to fetch feed");

      const data = response.data || [];
      setPosts(data);
      setHasMore(data.length === PAGE_LIMIT);
      setCurrentPage(1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch feed";
      setError(message);
      toast.error("Error loading feed", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNext = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await getFeed(nextPage, PAGE_LIMIT);
      if (!response.success) throw new Error("Failed to fetch more posts");

      const newPosts = response.data || [];
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(newPosts.length === PAGE_LIMIT);
      setCurrentPage(nextPage);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch more posts";
      setError(message);
      toast.error("Error loading more posts", { description: message });
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoading, isLoadingMore, hasMore]);

  const addPostLocal = useCallback((post: PostType) => {
    setPosts(prev => (prev.some(p => p.id === post.id) ? prev : [post, ...prev]));
  }, []);

  const deletePostLocal = useCallback((postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

  return <FeedContext.Provider value={contextValue}>{children}</FeedContext.Provider>;
};
