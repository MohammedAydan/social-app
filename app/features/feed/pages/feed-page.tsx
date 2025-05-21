import React from 'react';
import { FeedProvider } from '../context/feed-context';
import PostsSection from '~/shared/components/posts-section';

const FeedPage = () => {
    return (
        <FeedProvider>
            <div className="pt-16 pl-0 md:pl-16 w-full min-h-screen bg-background">
                <PostsSection />
            </div>
        </FeedProvider>
    );
};

export default FeedPage;