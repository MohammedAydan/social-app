import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeRelationshipFlags } from "./user-type.js";
/**
 * Locks the ADR-006 compensation: the deployed backend returns the
 * relationship pairs swapped (verified live against 6 fresh pairs —
 * accepted A→B reads isFollower:true/accepted:true,
 * isFollowing:false/accepted:false while followersCount increments).
 */
describe("normalizeRelationshipFlags", () => {
    it("swaps the pairs into documented orientation", () => {
        const out = normalizeRelationshipFlags({
            isFollower: true,
            isFollowerAccepted: true,
            isFollowing: false,
            isFollowingAccepted: false,
        });
        assert.deepEqual(out, {
            isFollower: false,
            isFollowerAccepted: false,
            isFollowing: true,
            isFollowingAccepted: true,
        });
    });
    it("is symmetric (no-op on already-correct or empty flags)", () => {
        const empty = normalizeRelationshipFlags({
            isFollower: false,
            isFollowerAccepted: false,
            isFollowing: false,
            isFollowingAccepted: false,
        });
        assert.deepEqual(empty, {
            isFollower: false,
            isFollowerAccepted: false,
            isFollowing: false,
            isFollowingAccepted: false,
        });
        // Double application restores the input — exactly one layer swaps.
        const once = normalizeRelationshipFlags({
            isFollower: true,
            isFollowerAccepted: false,
            isFollowing: false,
            isFollowingAccepted: true,
        });
        assert.deepEqual(normalizeRelationshipFlags(once), {
            isFollower: true,
            isFollowerAccepted: false,
            isFollowing: false,
            isFollowingAccepted: true,
        });
    });
    it("preserves every other field by reference shape", () => {
        const out = normalizeRelationshipFlags({
            id: "u-1",
            isFollower: true,
            isFollowerAccepted: true,
            isFollowing: false,
            isFollowingAccepted: false,
        });
        assert.equal(out.id, "u-1");
        assert.equal(out.isFollowing, true);
        assert.equal(out.isFollowingAccepted, true);
    });
});
