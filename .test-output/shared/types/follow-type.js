/**
 * Pending requests may arrive as Follow rows (with a nested `follower` /
 * `following` summary) or as plain user rows, depending on backend version.
 * The requester is always the *follower* side of the pair.
 */
export const normalizeFollowRequests = (raw) => {
    const arr = Array.isArray(raw)
        ? raw
        : (raw?.items
            ?? raw?.data
            ?? []);
    const out = [];
    for (const entry of arr) {
        if (!entry || typeof entry !== "object")
            continue;
        const e = entry;
        const nested = (e.follower ?? e.following ?? e.user);
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
    const seen = new Set();
    return out.filter((u) => (seen.has(u.id) ? false : (seen.add(u.id), true)));
};
