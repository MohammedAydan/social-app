import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type KeyboardEvent,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { BadgeCheck, User } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { searchUsers } from "~/shared/api";
import UserAvatar from "~/shared/components/user-avatar";

import type { UserType } from "~/shared/types/user-type";
import { useAuth } from "~/features/auth/hooks/use-auth";

const DEFAULT_PAGE_SIZE = 10;

const SearchPage = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useRef<HTMLDivElement | null>(null);

    // Debounce user input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // React Query: Infinite search
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["searchResults", debouncedQuery],
        queryFn: ({ pageParam = 1 }) =>
            searchUsers(debouncedQuery, pageParam, DEFAULT_PAGE_SIZE, { userId: user?.id ?? null }).then(
                (res) => res.data
            ),
        getNextPageParam: (lastPage) =>
            lastPage.currentPage < lastPage.totalPages
                ? lastPage.currentPage + 1
                : undefined,
        initialPageParam: 1,
        enabled: debouncedQuery.length > 0,
    });

    // Infinite scroll logic
    const lastResultElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading || isFetchingNextPage) return;

            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasNextPage) {
                        fetchNextPage();
                    }
                },
                { threshold: 0.5 }
            );

            if (node) observer.current.observe(node);
            lastElementRef.current = node;
        },
        [isLoading, isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    // Handle enter key
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    // Manual search trigger
    const handleSearch = () => {
        if (searchQuery.trim()) refetch();
    };

    const allResults = data?.pages.flatMap((page) => page) || [];

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            </Card>
        ));

    return (
        <div className="min-h-screen bg-background p-6 pt-24 md:p-20 pl-0 md:pl-16 ">
            <div className="max-w-4xl mx-auto">
                {/* Search bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <Input
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        autoFocus
                    />
                    <Button
                        onClick={handleSearch}
                        className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition"
                    >
                        Search
                    </Button>
                </div>

                {/* Loading */}
                {isLoading && !isFetchingNextPage && (
                    <div className="space-y-4">{renderSkeletons(3)}</div>
                )}

                {/* Error */}
                {isError && (
                    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-500">
                            Something went wrong. Please try again.
                        </p>
                    </div>
                )}

                {/* No Results */}
                {!isLoading &&
                    !isError &&
                    debouncedQuery.length > 0 &&
                    allResults.length === 0 && (
                        <div className="text-center p-12 bg-muted/30 border border-muted rounded-lg">
                            <User className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
                            <p className="text-muted-foreground text-lg">
                                No users found matching "{debouncedQuery}"
                            </p>
                            <p className="text-sm text-muted-foreground/80 mt-2">
                                Try a different search term
                            </p>
                        </div>
                    )}

                {/* Results */}
                {allResults.length > 0 && (
                    <div className="space-y-4 mb-8">
                        {allResults.map((user: UserType, index) => {
                            const isLast = index === allResults.length - 1;
                            return (
                                <div
                                    key={user.id}
                                    ref={isLast ? lastResultElementRef : null}
                                >
                                    <UserCard user={user} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Fetching more */}
                {isFetchingNextPage && (
                    <div className="space-y-4 mt-4">{renderSkeletons(2)}</div>
                )}
            </div>
        </div>
    );
};

const UserCard = ({ user }: { user: UserType }) => {
    return (
        <Card className="p-4 shadow-sm hover:shadow-md transition duration-200 rounded-xl">
            <div className="flex items-center gap-4">
                <UserAvatar url={user.profileImageUrl} username={user.userName} />
                <div className="flex-1">
                    {/* <h3 className="text-md font-semibold">{user.userName}</h3> */}
                    <h3 className="text-md font-semibold flex items-center gap-2">
                        {user?.userName} {user?.isVerified && (<BadgeCheck className="text-primary" size={20} />)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {user.email || "No email"}
                    </p>
                    {user.bio && (
                        <p className="text-sm mt-1 line-clamp-2 text-muted-foreground/80">
                            {user.bio}
                        </p>
                    )}
                </div>
                <Link to={`/profile/${user.id}`}>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                    >
                        View Profile
                    </Button>
                </Link>
            </div>
        </Card>
    );
};

export default SearchPage;