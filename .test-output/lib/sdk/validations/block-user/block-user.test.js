import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GetApiBlockUserBlockedUsersQueryParams, GetApiBlockUserIsBlockedQueryParams, PostApiBlockUserBlockBody, PostApiBlockUserUnblockBody, } from "./block-user.js";
/**
 * Generated Zod bodies are the source of truth for the BlockUser wire shapes
 * (API_REFERENCE §6). The server derives the blocker from the JWT — the wire
 * carries only `blockedUserId`, never a `userId` echo.
 */
for (const [name, schema] of Object.entries({
    block: PostApiBlockUserBlockBody,
    unblock: PostApiBlockUserUnblockBody,
})) {
    describe(`PostApiBlockUser${name === "block" ? "Block" : "Unblock"}Body`, () => {
        it("accepts the canonical { blockedUserId } shape", () => {
            assert.deepEqual(schema.parse({ blockedUserId: "u-9" }), { blockedUserId: "u-9" });
        });
        it("strips the legacy userId echo", () => {
            assert.deepEqual(schema.parse({ blockedUserId: "u-9", userId: "me" }), {
                blockedUserId: "u-9",
            });
        });
        it("requires blockedUserId", () => {
            assert.throws(() => schema.parse({}));
        });
    });
}
describe("BlockUser paging/check params", () => {
    it("defaults blocked-users to page 1 / limit 20", () => {
        assert.deepEqual(GetApiBlockUserBlockedUsersQueryParams.parse({}), { page: 1, limit: 20 });
    });
    it("accepts the is-blocked check shape", () => {
        assert.deepEqual(GetApiBlockUserIsBlockedQueryParams.parse({ blockedUserId: "u-9" }), {
            blockedUserId: "u-9",
        });
    });
});
