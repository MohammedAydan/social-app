/**
 * Relationship-flag compensation (verified live 2026-09-17, ADR-006).
 *
 * The deployed backend returns the I-follow-them / they-follow-me pairs
 * swapped: its `isFollower*` fields carry the viewer's outgoing state
 * (I follow them) and its `isFollowing*` fields carry the inbound state
 * (they follow me). Evidence: 6 fresh pairs — an accepted A→B row reads
 * `isFollower:true/accepted:true, isFollowing:false/accepted:false` while
 * `followersCount` increments. Every consumer (FollowButton, "Follows you"
 * badge, follow-state machine) uses the documented orientation, so the swap
 * is corrected once, here, at the type boundary.
 *
 * Remove this the day the backend returns documented orientation — the
 * two-account E2E (`tests/e2e/two-account-flow.spec.ts`) is the tripwire:
 * it will fail on the follow-button assertions if the server is fixed.
 */
export const normalizeRelationshipFlags = (user) => ({
    ...user,
    isFollower: user.isFollowing,
    isFollowerAccepted: user.isFollowingAccepted,
    isFollowing: user.isFollower,
    isFollowingAccepted: user.isFollowerAccepted,
});
