export interface FollowType {
    id: string;
    followerId: string;
    followingId: string;
    accepted: boolean;
    createdAt: Date;
    updatedAt: Date;
    follower?: UserSummaryDto;
    following?: UserSummaryDto;
}

export interface UserSummaryDto {
    id: string;
    userName?: string;
    profileImageUrl?: string;
    firstName?: string;
    lastName?: string;
}

/** Flat requester summary for pending follow requests (API_REFERENCE §5). */
export interface FollowRequestSummary {
    id: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
}

/**
 * Pending requests may arrive as Follow rows (with a nested `follower` /
 * `following` summary) or as plain user rows, depending on backend version.
 * The requester is always the *follower* side of the pair.
 */
export const normalizeFollowRequests = (raw: unknown): FollowRequestSummary[] => {
    const arr: unknown[] = Array.isArray(raw)
        ? raw
        : (((raw as { items?: unknown[]; data?: unknown[] } | null)?.items
            ?? (raw as { data?: unknown[] } | null)?.data
            ?? []) as unknown[]);
    const out: FollowRequestSummary[] = [];
    for (const entry of arr) {
        if (!entry || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        const nested = (e.follower ?? e.following ?? e.user) as Record<string, unknown> | null | undefined;
        if (nested && typeof nested === "object") {
            const id = nested.id ?? e.followerId ?? e.id;
            if (typeof id === "string" && id) {
                out.push({
                    id,
                    userName: typeof nested.userName === "string" ? nested.userName : undefined,
                    firstName: typeof nested.firstName === "string" ? nested.firstName : undefined,
                    lastName: typeof nested.lastName === "string" ? nested.lastName : undefined,
                    profileImageUrl: typeof nested.profileImageUrl === "string" ? nested.profileImageUrl : undefined,
                });
                continue;
            }
        }
        const id = e.followerId ?? e.id ?? e.userId;
        if (typeof id === "string" && id) {
            out.push({
                id,
                userName: typeof e.userName === "string" ? e.userName : undefined,
                firstName: typeof e.firstName === "string" ? e.firstName : undefined,
                lastName: typeof e.lastName === "string" ? e.lastName : undefined,
                profileImageUrl: typeof e.profileImageUrl === "string" ? e.profileImageUrl : undefined,
            });
        }
    }
    const seen = new Set<string>();
    return out.filter((u) => (seen.has(u.id) ? false : (seen.add(u.id), true)));
};