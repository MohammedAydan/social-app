import React, { useEffect, useCallback } from 'react';
import { useFeed } from '~/features/feed/hooks/use-feed';
import LoadingPost from './post/loading-post';
import PostCard from './post/post-card';

const PostsSection = () => {
    const { posts, isLoading, isLoadingMore, error } = useFeed();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center px-4 pt-20 md:pl-16 pl-0">
                <LoadingPost />
                <LoadingPost />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen py-6 pt-20 md:pl-16 pl-0">
                <p className="text-red-500">{error}</p>
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
            {posts?.length == 0 && (
                <div className="text-muted-foreground py-8">
                    No posts yet
                </div>
            )}
            {posts?.length > 0 && posts?.map((post) => (
                <PostCard key={post?.id} post={post} />
            ))}

            {isLoadingMore && (
                <div className="w-full flex flex-col items-center">
                    <LoadingPost />
                    <LoadingPost />
                </div>
            )}
        </div>
    );
};

export default PostsSection;
