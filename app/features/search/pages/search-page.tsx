import {
    useState,
    useEffect,
    useRef,
    useCallback,
    type KeyboardEvent,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { BadgeCheck, User } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { searchUsers } from "~/shared/api";
import UserAvatar from "~/shared/components/user-avatar";

import type { UserType } from "~/shared/types/user-type";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { getDisplayName, getHandle } from "~/shared/utils/display-name";

const DEFAULT_PAGE_SIZE = 10;

const SearchPage = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
        queryFn: async ({ pageParam = 1 }) => {
            const res = await searchUsers(debouncedQuery, pageParam, DEFAULT_PAGE_SIZE, { userId: user?.id ?? null });
            if (!res.success) throw new Error(res.message || "Search failed");
            // Backend may return a bare array (ApiResponse<UserType[]>) or a
            // paginated object ({ items|data, currentPage, totalPages, ... }).
            // Normalize both shapes here so display never crashes.
            const raw: unknown = res.data;
            if (Array.isArray(raw)) {
                return {
                    items: raw as UserType[],
                    nextPage: raw.length === DEFAULT_PAGE_SIZE ? pageParam + 1 : undefined,
                };
            }
            const obj = (raw ?? {}) as {
                items?: UserType[]; data?: UserType[];
                currentPage?: number; page?: number;
                totalPages?: number; total?: number;
            };
            const items = obj.items ?? obj.data ?? [];
            const currentPage = obj.currentPage ?? obj.page ?? pageParam;
            const totalPages = obj.totalPages ?? (obj.total != null ? Math.ceil(obj.total / DEFAULT_PAGE_SIZE) : undefined);
            return {
                items,
                nextPage: totalPages != null
                    ? (currentPage < totalPages ? currentPage + 1 : undefined)
                    : (items.length === DEFAULT_PAGE_SIZE ? pageParam + 1 : undefined),
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: debouncedQuery.length > 0,
    });

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

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleSearch = () => {
        const q = searchQuery.trim();
        if (!q) return;
        // Sync the debounced value instead of bare refetch(): refetch()
        // bypasses `enabled` and would fire with the stale (possibly empty)
        // debouncedQuery — the server 400s empty `q` (verified live E2E).
        // Only force-refetch when the query didn't change.
        if (q === debouncedQuery) {
            void refetch();
        } else {
            setDebouncedQuery(q);
        }
    };

    const allResults = data?.pages.flatMap((page) => page.items) || [];

    const renderSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3 rounded" />
                        <Skeleton className="h-4 w-1/2 rounded" />
                        <Skeleton className="h-3 w-2/3 rounded" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded" />
                </div>
            </Card>
        ));

    return (
        <div className="min-h-screen bg-background p-0 pt-24 md:p-24 md:pt-24 pl-0">
            <div className="max-w-4xl mx-auto">
                {/* Sticky Search bar */}
                <div className="bg-background/80 backdrop-blur-md px-6 py-6 md:px-0 md:py-8 mb-8 rounded-b-xl shadow">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <Input
                            placeholder="Search for users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="border-2 border-primary/30 rounded-lg focus:border-primary transition h-12"
                            autoFocus
                        />
                        <Button
                            onClick={handleSearch}
                            className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition font-semibold shadow h-11"
                        >
                            Search
                        </Button>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && !isFetchingNextPage && (
                    <div className="space-y-4">{renderSkeletons(3)}</div>
                )}

                {/* Error */}
                {isError && (
                    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl shadow">
                        <p className="text-red-500 font-semibold">
                            Something went wrong. Please try again.
                        </p>
                    </div>
                )}

                {/* No Results */}
                {!isLoading &&
                    !isError &&
                    debouncedQuery.length > 0 &&
                    allResults.length === 0 && (
                        <div className="text-center p-12 bg-muted/30 border border-muted rounded-xl shadow">
                            <User className="mx-auto h-12 w-12 text-muted-foreground/60 mb-4" />
                            <p className="text-muted-foreground text-lg font-semibold">
                                No users found matching "{debouncedQuery}"
                            </p>
                            <p className="text-sm text-muted-foreground/80 mt-2">
                                Try a different search term
                            </p>
                        </div>
                    )}

                {/* Results */}
                {allResults.length > 0 && (
                    <div className="flex flex-col gap-6 mb-8">
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

export default SearchPage;

const UserCard = ({ user }: { user: UserType }) => {
    const displayName = getDisplayName(user);
    const handle = getHandle(user);
    return (
        <Card className="p-4 shadow-sm hover:shadow-md transition duration-200 rounded-xl">
            <div className="flex items-center gap-4">
                <UserAvatar url={user.profileImageUrl} username={user.userName} displayName={displayName} />
                <div className="flex-1 min-w-0">
                    {/* <h3 className="text-md font-semibold">{user.userName}</h3> */}
                    <h3 className="text-md font-semibold flex items-center gap-2 truncate">
                        <span className="truncate">{displayName}</span>
                        {user?.isVerified && (<BadgeCheck className="text-primary shrink-0" size={20} />)}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                        {handle}{user.email ? ` · ${user.email}` : ""}
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
