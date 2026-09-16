import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { blockUser, checkIsBlocked, unblockUser } from "~/shared/api/api.block";

export const BLOCKED_USERS_KEY = ["blocked-users"] as const;
export const isBlockedKey = (userId: string) => ["is-blocked", userId] as const;

/** One-direction check (me → them). Disabled when no target. */
export const useIsBlocked = (userId?: string | null) => {
    return useQuery({
        queryKey: isBlockedKey(userId ?? ""),
        queryFn: async () => {
            const res = await checkIsBlocked(userId ?? "");
            if (!res.success) throw new Error(res.message || "Failed to check block status");
            return res.data ?? false;
        },
        enabled: !!userId,
        staleTime: 60_000,
        retry: false,
    });
};

interface BlockMutations {
    block: () => void;
    unblock: () => void;
    isBlocking: boolean;
    isUnblocking: boolean;
    isPending: boolean;
}

/**
 * Block/unblock mutations for one target user.
 * On success refreshes every block-sensitive cache (profile, posts, search,
 * block list) and asks the feed to refetch, since the server filters
 * blocked parties out of feed/profile/search/followers server-side
 * (ARCHITECTURE.md §2.3) but local caches still hold their rows.
 */
export const useBlockUser = (targetUserId: string): BlockMutations => {
    const queryClient = useQueryClient();

    const invalidateBlockCaches = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: isBlockedKey(targetUserId) }),
            queryClient.invalidateQueries({ queryKey: BLOCKED_USERS_KEY }),
            queryClient.invalidateQueries({ queryKey: ["user-profile", targetUserId] }),
            queryClient.invalidateQueries({ queryKey: ["user-posts", targetUserId] }),
            queryClient.invalidateQueries({ queryKey: ["searchResults"] }),
        ]);
        // FeedContext holds local state (not react-query) — nudge it to refetch.
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("feed:refresh"));
        }
    };

    const blockMutation = useMutation({
        mutationFn: () => blockUser(targetUserId),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error("Failed to block user", { description: response.message });
                return;
            }
            toast.success("User blocked", {
                description: "You won't see each other's posts or interact.",
            });
            await invalidateBlockCaches();
        },
        onError: (error) => {
            toast.error("Failed to block user", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        },
    });

    const unblockMutation = useMutation({
        mutationFn: () => unblockUser(targetUserId),
        onSuccess: async (response) => {
            if (!response.success) {
                toast.error("Failed to unblock user", { description: response.message });
                return;
            }
            toast.success("User unblocked");
            await invalidateBlockCaches();
        },
        onError: (error) => {
            toast.error("Failed to unblock user", {
                description: error instanceof Error ? error.message : "Unknown error",
            });
        },
    });

    return {
        block: () => blockMutation.mutate(),
        unblock: () => unblockMutation.mutate(),
        isBlocking: blockMutation.isPending,
        isUnblocking: unblockMutation.isPending,
        isPending: blockMutation.isPending || unblockMutation.isPending,
    };
};
