/** BlockUser domain types (API_REFERENCE §6). */
export interface BlockedUserSummary {
    id: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    isVerified?: boolean;
}

export interface BlockUserType {
    id: string;
    userId: string;
    blockedUserId: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    blockedUser?: BlockedUserSummary | null;
    user?: BlockedUserSummary | null;
}

/**
 * The blocked-users list may come back as BlockUser rows (with a nested
 * `blockedUser`/`user`) or as plain user rows, depending on backend version.
 * Normalize every shape to a flat summary so the UI never crashes.
 */
export const normalizeBlockedUsers = (raw: unknown): BlockedUserSummary[] => {
    const arr: unknown[] = Array.isArray(raw)
        ? raw
        : (((raw as { items?: unknown[]; data?: unknown[] } | null)?.items
            ?? (raw as { data?: unknown[] } | null)?.data
            ?? []) as unknown[]);
    const out: BlockedUserSummary[] = [];
    for (const entry of arr) {
        if (!entry || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        const nested = (e.blockedUser ?? e.user ?? e.blocked) as Record<string, unknown> | null | undefined;
        if (nested && typeof nested === "object") {
            const id = nested.id ?? e.blockedUserId ?? e.id;
            if (typeof id === "string" && id) {
                out.push({
                    id,
                    userName: typeof nested.userName === "string" ? nested.userName : undefined,
                    firstName: typeof nested.firstName === "string" ? nested.firstName : undefined,
                    lastName: typeof nested.lastName === "string" ? nested.lastName : undefined,
                    profileImageUrl: typeof nested.profileImageUrl === "string" ? nested.profileImageUrl : undefined,
                    isVerified: typeof nested.isVerified === "boolean" ? nested.isVerified : undefined,
                });
                continue;
            }
        }
        if (typeof e.userName === "string") {
            const id = e.id ?? e.blockedUserId ?? e.userId;
            if (typeof id === "string" && id) {
                out.push({
                    id,
                    userName: e.userName,
                    firstName: typeof e.firstName === "string" ? e.firstName : undefined,
                    lastName: typeof e.lastName === "string" ? e.lastName : undefined,
                    profileImageUrl: typeof e.profileImageUrl === "string" ? e.profileImageUrl : undefined,
                    isVerified: typeof e.isVerified === "boolean" ? e.isVerified : undefined,
                });
                continue;
            }
        }
        const id = e.blockedUserId ?? e.id;
        if (typeof id === "string" && id) out.push({ id });
    }
    // De-duplicate by id: pagination overlap must not duplicate rows.
    const seen = new Set<string>();
    return out.filter((u) => (seen.has(u.id) ? false : (seen.add(u.id), true)));
};
