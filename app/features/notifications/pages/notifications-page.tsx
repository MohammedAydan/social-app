import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useAuth } from '~/features/auth/hooks/use-auth';
import { getUserNotifications } from '~/shared/api';
import { NotificationCard } from '../components/notification-card';
import { useNavigate } from 'react-router';

const PAGE_SIZE = 10;
const SCROLL_THRESHOLD = 200;

const NotificationsPage = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate('/login');
        }
    }, [user, isAuthLoading, navigate]);

    const {
        data,
        isLoading,
        isError,
        error,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['notifications', user?.id || ''],
        queryFn: async ({ pageParam = 1 }) => {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const response = await getUserNotifications(user.id, pageParam, PAGE_SIZE);

            if (response.status != 200) {
                throw new Error('Failed to load notifications');
            }

            return {
                data: response.data || [],
                nextPage: response.data.length === PAGE_SIZE ? pageParam + 1 : undefined
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled: Boolean(user?.id),
        initialPageParam: 1,
        retry: 2,
        retryDelay: 1000,
    });

    // Retry loading notifications
    const handleRetry = useCallback(() => {
        refetch();
    }, [refetch]);

    // Implement infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isLoading || isFetchingNextPage || !hasNextPage) return;

            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - SCROLL_THRESHOLD;

            if (scrollPosition >= documentHeight) {
                fetchNextPage();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [fetchNextPage, hasNextPage, isLoading, isFetchingNextPage]);

    // Flatten all notification data
    const notifications = data?.pages.flatMap(page => page.data) || [];
    const hasNotifications = notifications.length > 0;

    // Loading state
    if (isAuthLoading || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <div className="animate-pulse flex flex-col items-center gap-4 w-full">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-24 bg-gray-200 rounded w-full max-w-md"></div>
                    <div className="h-24 bg-gray-200 rounded w-full max-w-md"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen py-6 px-4">
                <div className="mb-6 text-red-500 text-xl">⚠️</div>
                <p className="text-red-500 mb-4 text-center font-medium">
                    {error instanceof Error ? error.message : 'Failed to load notifications'}
                </p>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handleRetry}
                    aria-label="Retry loading notifications"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full pl-0 md:pl-16  mt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold mb-6">Notifications</h1>

                {/* No notifications state */}
                {!hasNotifications && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="text-4xl mb-4">🔔</div>
                        <p className="text-gray-500 mb-2">No notifications yet</p>
                        <p className="text-gray-400 text-sm">
                            When you receive notifications, they will appear here
                        </p>
                    </div>
                )}

                {/* Notification list */}
                {hasNotifications && (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}

                            />
                        ))}
                    </div>
                )}

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                    <div className="w-full flex justify-center py-4 mt-4">
                        <div className="animate-pulse flex space-x-2 items-center">
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>
                )}

                {/* Load more button (backup for scroll) */}
                {hasNextPage && !isFetchingNextPage && (
                    <div className="w-full flex justify-center py-4 mt-2">
                        <button
                            onClick={() => fetchNextPage()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            aria-label="Load more notifications"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;