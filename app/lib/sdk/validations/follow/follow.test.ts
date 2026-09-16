import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    PostApiFollowAcceptFollowRequestBody,
    PostApiFollowFollowBody,
    PostApiFollowRejectFollowRequestBody,
    PostApiFollowUnfollowBody,
} from "./follow.js";

/**
 * The generated Zod bodies are the source of truth for the FollowRequest wire
 * shape (API_REFERENCE §5: `FollowRequest`). All four write endpoints share
 * the same body, so the four schemas must stay identical.
 */
const bodies = {
    follow: PostApiFollowFollowBody,
    unfollow: PostApiFollowUnfollowBody,
    accept: PostApiFollowAcceptFollowRequestBody,
    reject: PostApiFollowRejectFollowRequestBody,
};

describe("FollowRequest body schemas", () => {
    it("accept the canonical { followerId, targetUserId } pair", () => {
        for (const schema of Object.values(bodies)) {
            assert.deepEqual(schema.parse({ followerId: "u-1", targetUserId: "u-2" }), {
                followerId: "u-1",
                targetUserId: "u-2",
            });
        }
    });

    it("strip unknown keys so stale aliases never reach the wire", () => {
        // `followingId` is not part of the spec model; the server ignores it,
        // but the client must not send it.
        for (const schema of Object.values(bodies)) {
            assert.deepEqual(
                schema.parse({ followerId: "u-1", targetUserId: "u-2", followingId: "u-2" }),
                { followerId: "u-1", targetUserId: "u-2" }
            );
        }
    });

    it("allow empty payloads (both keys optional per spec)", () => {
        for (const schema of Object.values(bodies)) {
            assert.deepEqual(schema.parse({}), {});
        }
    });

    it("reject non-string ids", () => {
        for (const schema of Object.values(bodies)) {
            assert.throws(() => schema.parse({ followerId: 42 }));
        }
    });
});
