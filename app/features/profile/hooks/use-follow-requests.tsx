import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "~/features/auth/hooks/use-auth";
import {
    acceptFollowRequest,
    getPendingFollowRequests,
    rejectFollowRequest,
} from "~/shared/api";
import {
    normalizeFollowRequests,
    type FollowRequestSummary,
} from "~/shared/types/follow-type";

export const PENDING_FOLLOW_REQUESTS_KEY = ["pending-follow-requests"] as const;

const PAGE_SIZE = 20;

interface PendingPage {
    items: FollowRequestSummary[];
    nextPage: number | undefined;
}

/** Inbound pending follow requests (they want to follow me). */
export const usePendingFollowRequests = (enabled = true) => {
    const { user } = useAuth();
    return useInfiniteQuery<PendingPage>({
        queryKey: [...PENDING_FOLLOW_REQUESTS_KEY, user?.id ?? ""],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await getPendingFollowRequests(pageParam as number, PAGE_SIZE);
            if (!res.success) throw new Error(res.message || "Failed to load follow requests");
            const items = normalizeFollowRequests(res.data);
            return {
                items,
                nextPage: items.length === PAGE_SIZE ? (pageParam as number) + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: enabled && !!user?.id,
        retry: false,
    });
};

interface FollowRequestActions {
    accept: (requesterId: string) => void;
    decline: (requesterId: string) => void;
    actingId: string | null;
    isActing: boolean;
}

/**
 * Accept/decline inbound follow requests. The pair is always
 * (follower = requester, following = me); the API layer aliases the target
 * key so either DTO shape binds.
 */
export const useFollowRequestActions = (): FollowRequestActions => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const invalidate = async (requesterId: string) => {
        await queryClient.invalidateQueries({ queryKey: PENDING_FOLLOW_REQUESTS_KEY });
        await queryClient.invalidateQueries({ queryKey: ["user-profile", requesterId] });
        // The notifications page reads ['notifications', ...] (inbox), not
        // the pending key — without this, accepted/declined cards linger
        // until a manual refresh (verified live 2026-09-17).
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const acceptMutation = useMutation({
        mutationFn: (requesterId: string) =>
            acceptFollowRequest({ followerId: requesterId, targetUserId: user?.id ?? "" }),
        onSuccess: async (response, requesterId) => {
            if (response.success) {
                toast.success("Follow request accepted");
                await invalidate(requesterId);
            } else {
                toast.error(response.message || "Failed to accept follow request");
            }
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to accept follow request");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (requesterId: string) =>
            rejectFollowRequest({ followerId: requesterId, targetUserId: user?.id ?? "" }),
        onSuccess: async (response, requesterId) => {
            if (response.success) {
                toast.success("Follow request declined");
                await invalidate(requesterId);
            } else {
                toast.error(response.message || "Failed to decline follow request");
            }
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Failed to decline follow request");
        },
    });

    const actingId =
        (acceptMutation.variables as string | undefined) ??
        (rejectMutation.variables as string | undefined) ??
        null;

    return {
        accept: (requesterId: string) => acceptMutation.mutate(requesterId),
        decline: (requesterId: string) => rejectMutation.mutate(requesterId),
        actingId,
        isActing: acceptMutation.isPending || rejectMutation.isPending,
    };
};
