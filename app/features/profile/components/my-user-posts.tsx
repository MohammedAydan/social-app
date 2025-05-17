'use client';

import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyPosts } from '~/shared/api';
import LoadingPost from '~/shared/components/post/loading-post';
import type { PostType } from '~/shared/types/post-types';
import PostCard from '~/shared/components/post/post-card';

const LIMIT = 10;
const QUERY_KEY = ["my-user-posts"];

export const useMyUserPostsQuery = () => {
    return useInfiniteQuery({
        queryKey: QUERY_KEY,
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getMyPosts(pageParam, LIMIT);
            return {
                data: response.data,
                nextPage: response.data.length === LIMIT ? pageParam + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
    });
};

const MyUserPosts = () => {
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useMyUserPostsQuery();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (
                scrollTop + windowHeight >= documentHeight - 100 &&
                !isFetchingNextPage &&
                hasNextPage
            ) {
                fetchNextPage();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

    if (status === 'pending') {
        return (
            <div className="flex flex-col items-center px-4 pt-12">
                <LoadingPost />
                <LoadingPost />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-6">
                <p className="text-red-500">{error.message}</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-2xl"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center px-4 pt-12">
            {data.pages.flatMap((page) =>
                page.data?.map((post: PostType) => (
                    <PostCard key={post.id} post={post} />
                ))
            )}
            {isFetchingNextPage && (
                <div className="w-full flex flex-col items-center">
                    <LoadingPost />
                    <LoadingPost />
                </div>
            )}
            {!isFetchingNextPage && !hasNextPage && data.pages[0]?.data.length === 0 && (
                <div className="text-muted-foreground py-8">
                    No posts yet
                </div>
            )}
        </div>
    );
};

export default MyUserPosts;