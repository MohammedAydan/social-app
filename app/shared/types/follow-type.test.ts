import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeFollowRequests } from "./follow-type.js";

describe("normalizeFollowRequests", () => {
    it("reads Follow rows with a nested follower summary", () => {
        const out = normalizeFollowRequests([
            {
                id: "row-1",
                followerId: "user-1",
                followingId: "me",
                accepted: false,
                follower: { id: "user-1", userName: "ahmed", firstName: "Ahmed", lastName: "Ali" },
            },
        ]);
        assert.deepEqual(out, [
            { id: "user-1", userName: "ahmed", firstName: "Ahmed", lastName: "Ali", profileImageUrl: undefined },
        ]);
    });

    it("reads plain user rows", () => {
        const out = normalizeFollowRequests([
            { id: "user-2", userName: "sara", firstName: "Sara", profileImageUrl: "https://img/x.png" },
        ]);
        assert.equal(out.length, 1);
        assert.equal(out[0]?.id, "user-2");
        assert.equal(out[0]?.userName, "sara");
        assert.equal(out[0]?.profileImageUrl, "https://img/x.png");
    });

    it("falls back to followerId when no nested summary exists", () => {
        const out = normalizeFollowRequests([{ id: "row-9", followerId: "user-9" }]);
        assert.deepEqual(out, [
            { id: "user-9", userName: undefined, firstName: undefined, lastName: undefined, profileImageUrl: undefined },
        ]);
    });

    it("unwraps { items } and { data } page envelopes", () => {
        const row = { id: "user-3", userName: "omar" };
        assert.equal(normalizeFollowRequests({ items: [row] }).length, 1);
        assert.equal(normalizeFollowRequests({ data: [row] }).length, 1);
    });

    it("skips junk entries and de-duplicates by id", () => {
        const out = normalizeFollowRequests([
            null,
            42,
            { id: "user-4", userName: "a" },
            { followerId: "user-4" },
            {},
        ]);
        assert.equal(out.length, 1);
        assert.equal(out[0]?.id, "user-4");
    });

    it("handles null/undefined input", () => {
        assert.deepEqual(normalizeFollowRequests(null), []);
        assert.deepEqual(normalizeFollowRequests(undefined), []);
    });
});
