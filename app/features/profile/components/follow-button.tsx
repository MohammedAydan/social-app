import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { followUser, getUserProfile, rejectFollowRequest, unfollowUser } from "~/shared/api";
import Loading from "~/shared/components/loading";
import type { UserType } from "~/shared/types/user-type";
import {
    isAlreadyFollowingMessage,
    resolveButtonState,
    resolveOutgoingCancel,
    resolveUnfollow,
} from "../utils/follow-state";

interface FollowButtonProps {
    userId: string;
    isPrivate: boolean;
    /** I-follow-them state (NOT they-follow-me). */
    isFollowing: boolean;
    isFollowingAccepted: boolean;
}

const getEnvelopeMessage = (response: unknown): string =>
    (response as { message?: string } | null)?.message ?? "";

const FollowButton = ({
    userId,
    isPrivate,
    isFollowing,
    isFollowingAccepted,
}: FollowButtonProps) => {
    const { user, incrementFollowingCount, decrementFollowingCount } = useAuth();
    const queryClient = useQueryClient();
    const viewerId = user?.id ?? "";
    const [isRevalidating, setIsRevalidating] = useState(false);

    const updateUserProfileCache = (updates: Partial<UserType>) => {
        queryClient.setQueryData<UserType | null>(["user-profile", userId], (oldData) => {
            if (!oldData) return oldData;
            return { ...oldData, ...updates };
        });
    };

    /**
     * Pull fresh profile flags into the cache and return them. Follow state
     * can change on another device (the other party accepting my request),
     * and this view may be stale (no focus refetch globally), so every
     * destructive path revalidates before acting.
     */
    const refreshProfile = async (): Promise<UserType | null> => {
        try {
            const res = await getUserProfile(userId);
            if (!res.success) return null;
            const fresh = res.data ?? null;
            queryClient.setQueryData(["user-profile", userId], fresh);
            return fresh;
        } catch {
            return null;
        }
    };

    const followMutation = useMutation({
        mutationFn: () => followUser({ followerId: viewerId, targetUserId: userId }),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["user-profile", userId] });
            const previous = queryClient.getQueryData<UserType | null>(["user-profile", userId]);

            updateUserProfileCache({
                isFollowing: true,
                isFollowingAccepted: !isPrivate,
                followersCount: (!isPrivate) ? ((previous?.followersCount ?? 0) + 1) : previous?.followersCount,
            });

            if (!isPrivate) incrementFollowingCount();

            return { previous };
        },
        onSuccess: (response) => {
            // Converge with server truth (counts, accepted state) — but NOT
            // with an immediate refetch: the backend serves reads from a
            // lagging window after the write (verified live 2026-09-17: reads
            // seconds after a 200/success follow still show no row), which
            // would clobber the correct optimistic state. The optimistic
            // flags already show the right button; poll in the background
            // until the row becomes visible (or give up after ~30s — the 15s
            // pending poll and focus refetch remain as backstops).
            // Fire-and-forget: awaiting would pin the button in Loading.
            if (response.success && typeof window !== "undefined") {
                const before = queryClient.getQueryData<UserType | null>(["user-profile", userId]);
                const baseCount = before?.followersCount ?? 0;
                void (async () => {
                    for (let i = 0; i < 10; i++) {
                        await new Promise((r) => setTimeout(r, 3000));
                        try {
                            const res = await getUserProfile(userId);
                            if (!res.success || !res.data) break;
                            // Write ONLY on visible progress: stale lag-window
                            // reads must never clobber the correct optimistic
                            // state (verified live 2026-09-17).
                            if (res.data.isFollowing || (res.data.followersCount ?? 0) > baseCount) {
                                queryClient.setQueryData(["user-profile", userId], res.data);
                                break;
                            }
                        } catch {
                            break;
                        }
                    }
                })();
            }
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["user-profile", userId], context.previous);
            if (!isPrivate) decrementFollowingCount();
        },
        onSettled: async (response) => {
            // handleRequest returns failure envelopes (it doesn't throw), so
            // a 4xx/5xx like "already follow or pending" lands here.
            if (response && !response.success) {
                const message = getEnvelopeMessage(response) || "Follow action failed";
                if (isAlreadyFollowingMessage(message)) {
                    // Server truth: a relationship exists. Our optimistic
                    // increment may have double-counted → roll the count back,
                    // keep the following state, then converge via refetch.
                    if (!isPrivate) decrementFollowingCount();
                    updateUserProfileCache({ isFollowing: true });
                    toast.warning(message);
                } else {
                    toast.error(message);
                    if (!isPrivate) decrementFollowingCount();
                }
                await queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
            }
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            const pair = { followerId: viewerId, targetUserId: userId };
            const toPair = async (call: () => Promise<{ success: boolean; message?: string | null }>) => {
                const r = await call();
                return { success: r.success, message: r.message ?? null };
            };
            const outcome = await resolveUnfollow({
                unfollow: () => toPair(() => unfollowUser(pair)),
                reject: () => toPair(() => rejectFollowRequest(pair)),
            });
            return { success: outcome.ok, message: outcome.message, data: null, errors: null, via: outcome.via };
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["user-profile", userId] });
            const previous = queryClient.getQueryData<UserType | null>(["user-profile", userId]);

            updateUserProfileCache({
                isFollowing: false,
                isFollowingAccepted: false,
                followersCount: (!isPrivate) ? (Math.max((previous?.followersCount ?? 1) - 1, 0)) : previous?.followersCount,
            });

            if (isFollowingAccepted) decrementFollowingCount();

            return { previous };
        },
        onSuccess: async (response) => {
            if (response.success && response.via === "unfollow") {
                await queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
            }
            // "reject"/"converged" legs deliberately skip invalidation: the
            // handlers proved the flag stale, and an immediate refetch would
            // restore the contradicting flag into the cache.
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["user-profile", userId], context.previous);
            if (isFollowingAccepted) incrementFollowingCount();
        },
        onSettled: async (response) => {
            if (response && !response.success) {
                toast.error(getEnvelopeMessage(response) || "Unfollow action failed");
                if (isFollowingAccepted) incrementFollowingCount();
                await queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
            } else if (response?.success && response.via !== "unfollow") {
                toast.info(response.message || "You're not following this user");
            }
        }
    });

    /**
     * Cancel an outgoing follow request ("Requested" state). Reject-first:
     * the reject handler only removes pending rows (404 otherwise), so an
     * accepted row can never be deleted here. Sequencing lives in the tested
     * `resolveOutgoingCancel` helper; the injected refresh also syncs cache.
     */
    const cancelRequestMutation = useMutation({
        mutationFn: async () => {
            const pair = { followerId: viewerId, targetUserId: userId };
            const toPair = async (call: () => Promise<{ success: boolean; message?: string | null }>) => {
                const r = await call();
                return { success: r.success, message: r.message ?? null };
            };
            const outcome = await resolveOutgoingCancel({
                reject: () => toPair(() => rejectFollowRequest(pair)),
                unfollow: () => toPair(() => unfollowUser(pair)),
                refreshProfile: async () => {
                    const fresh = await refreshProfile();
                    return fresh
                        ? { isFollowing: fresh.isFollowing, isFollowingAccepted: fresh.isFollowingAccepted }
                        : null;
                },
            });
            return { success: outcome.ok, message: outcome.message, data: null, errors: null, via: outcome.via };
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["user-profile", userId] });
            const previous = queryClient.getQueryData<UserType | null>(["user-profile", userId]);
            updateUserProfileCache({ isFollowing: false, isFollowingAccepted: false });
            return { previous };
        },
        onSuccess: async (response) => {
            // "reject"/"unfollow"/"converged" all end at not-following; skip
            // invalidation so a stale flag can't flip the button straight back.
            if (response.success) {
                toast.success(response.message || "Follow request cancelled");
            }
        },
        onError: (_error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(["user-profile", userId], context.previous);
        },
        onSettled: async (response) => {
            if (response && !response.success) {
                if (response.via === "became-accepted") {
                    toast.success(response.message || "Your follow request was accepted");
                } else {
                    toast.error(response.message || "Failed to cancel follow request");
                    await queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
                }
            }
        },
    });

    const isLoading =
        followMutation.isPending || unfollowMutation.isPending || cancelRequestMutation.isPending;

    if (!user?.id) return null;

    // Three user states (API_REFERENCE §5):
    // - not following → Follow (accepted row, or pending if private)
    // - outgoing pending (Requested) → revalidate, then reject-first cancel
    // - accepted → Unfollow (with safe reject fallback)
    const handleClick = async () => {
        if (isLoading || isRevalidating) return;

        if (!isFollowing) {
            followMutation.mutate();
            return;
        }
        if (isFollowingAccepted) {
            unfollowMutation.mutate();
            return;
        }
        // "Requested" may be stale — the other party could have accepted
        // since this view was fetched. Revalidate before anything
        // destructive so an accepted follow is never cancelled by mistake.
        setIsRevalidating(true);
        try {
            const fresh = await refreshProfile();
            if (fresh) {
                if (!fresh.isFollowing) {
                    toast.info("No pending request found");
                    return;
                }
                if (fresh.isFollowingAccepted) {
                    toast.success("Your follow request was accepted");
                    return;
                }
            }
        } finally {
            setIsRevalidating(false);
        }
        cancelRequestMutation.mutate();
    };

    const buttonState = resolveButtonState({ isFollowing, isFollowingAccepted });

    let buttonText = "Follow";
    let variant: "default" | "outline" | "destructive" = "default";

    if (buttonState === "unfollow") {
        buttonText = "Unfollow";
        variant = "outline";
    } else if (buttonState === "requested") {
        buttonText = "Requested";
        variant = "destructive";
    }

    const busy = isLoading || isRevalidating;
    if (busy) {
        buttonText = "";
        variant = "outline";
    }

    return (
        <div className="w-full">
            <Button
                className="w-full"
                variant={variant}
                onClick={handleClick}
                disabled={busy}
                title={buttonText === "Requested" ? "Cancel follow request" : undefined}
            >
                {busy ? <Loading size="20px" /> : buttonText}
            </Button>
        </div>
    );
};

export default FollowButton;
