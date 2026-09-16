export interface UserType {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    userGender: string;
    email: string;
    birthDate: string | Date;
    bio: string;
    profileImageUrl: string;
    coverImageUrl: string;
    isVerified: boolean;
    isPrivate: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    roles: string[];
    isFollower: boolean;
    isFollowerAccepted: boolean;
    isFollowing: boolean;
    isFollowingAccepted: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

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
export const normalizeRelationshipFlags = <T extends Pick<
    UserType,
    "isFollower" | "isFollowerAccepted" | "isFollowing" | "isFollowingAccepted"
>>(
    user: T
): T => ({
    ...user,
    isFollower: user.isFollowing,
    isFollowerAccepted: user.isFollowingAccepted,
    isFollowing: user.isFollower,
    isFollowingAccepted: user.isFollowerAccepted,
});