/**
 * Pure follow-state logic (API_REFERENCE §5).
 *
 * Kept free of React/Query so it can be unit-tested with plain `node:test`.
 * The UI components in `../components/follow-button.tsx` inject the real API
 * calls; tests inject fakes and assert the safety invariants — chiefly that
 * cancelling a "Requested" state can never delete an accepted follow.
 */

/** Server says a relationship already exists (informational, not a bug). */
export const isAlreadyFollowingMessage = (message: string): boolean => {
    const lower = message.toLowerCase();
    return lower.includes("already") || lower.includes("pending");
};

/**
 * Server says no relationship exists. Per API_REFERENCE §5 this is the
 * documented 404 outcome ("no relation" / "no pending") — the deployed
 * backend surfaces it as a 500 via GlobalExceptionMiddleware, but the
 * meaning is identical: the mutation endpoint is the source of truth and
 * there is nothing to remove.
 */
export const isNotFoundMessage = (message: string): boolean => {
    const lower = message.toLowerCase();
    return lower.includes("not found") || lower.includes("no relation") || lower.includes("no pending");
};

export type FollowButtonState = "follow" | "requested" | "unfollow";

/** Button label state derived from the I-follow-them flags. */
export const resolveButtonState = (flags: {
    isFollowing: boolean;
    isFollowingAccepted: boolean;
}): FollowButtonState => {
    if (!flags.isFollowing) return "follow";
    return flags.isFollowingAccepted ? "unfollow" : "requested";
};

/** Minimal shape of a follow-write envelope needed for sequencing. */
export interface PairResult {
    success: boolean;
    message?: string | null;
}

/** Fresh relationship flags from a profile revalidation. */
export interface FreshFlags {
    isFollowing: boolean;
    isFollowingAccepted: boolean;
}

const msg = (r: PairResult): string => r.message ?? "";

const FALLBACK_ERROR = "Failed to cancel follow request";

export interface CancelDeps {
    reject: () => Promise<PairResult>;
    unfollow: () => Promise<PairResult>;
    refreshProfile: () => Promise<FreshFlags | null>;
}

export type CancelVia = "reject" | "unfollow" | "converged" | "became-accepted" | "error";

export interface CancelOutcome {
    ok: boolean;
    via: CancelVia;
    message: string;
}

/**
 * Cancel an outgoing follow request ("Requested" state). Reject-first: the
 * reject handler only removes pending rows (404 otherwise), so an accepted
 * row can never be deleted here. When the row isn't pending, the profile is
 * revalidated before touching unfollow — the request may have been accepted
 * elsewhere, in which case the caller must flip to Unfollow and delete
 * nothing.
 */
export const resolveOutgoingCancel = async (deps: CancelDeps): Promise<CancelOutcome> => {
    const first = await deps.reject();
    if (first.success) return { ok: true, via: "reject", message: "Follow request cancelled" };
    if (!isNotFoundMessage(msg(first))) {
        return { ok: false, via: "error", message: msg(first) || FALLBACK_ERROR };
    }
    const fresh = await deps.refreshProfile();
    if (fresh) {
        if (!fresh.isFollowing) {
            return { ok: true, via: "converged", message: "No pending request found" };
        }
        if (fresh.isFollowingAccepted) {
            return { ok: false, via: "became-accepted", message: "Your follow request was just accepted" };
        }
    }
    const second = await deps.unfollow();
    if (second.success) return { ok: true, via: "unfollow", message: "Follow request cancelled" };
    if (isNotFoundMessage(msg(second))) {
        return { ok: true, via: "converged", message: "No pending request found" };
    }
    return { ok: false, via: "error", message: msg(second) || FALLBACK_ERROR };
};

export interface UnfollowDeps {
    unfollow: () => Promise<PairResult>;
    reject: () => Promise<PairResult>;
}

export type UnfollowVia = "unfollow" | "reject" | "converged" | "error";

export interface UnfollowOutcome {
    ok: boolean;
    via: UnfollowVia;
    message: string;
}

/**
 * Remove an accepted follow. When the row isn't accepted, it may still be a
 * pending request (stale accepted flag), which only the reject handler
 * removes — reject 404s (safely, no deletion) when the row is accepted or
 * missing, so this fallback can never destroy state the user didn't ask to
 * remove.
 */
export const resolveUnfollow = async (deps: UnfollowDeps): Promise<UnfollowOutcome> => {
    const first = await deps.unfollow();
    if (first.success) return { ok: true, via: "unfollow", message: "Unfollowed" };
    if (!isNotFoundMessage(msg(first))) {
        return { ok: false, via: "error", message: msg(first) || "Unfollow action failed" };
    }
    const second = await deps.reject();
    if (second.success) return { ok: true, via: "reject", message: "Follow request cancelled" };
    if (isNotFoundMessage(msg(second))) {
        return { ok: true, via: "converged", message: "You're not following this user" };
    }
    return { ok: false, via: "error", message: msg(second) || "Unfollow action failed" };
};
