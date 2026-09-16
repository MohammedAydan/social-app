import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GetApiLikePostIdQueryParams, PostApiLikeBody } from "./like.js";
/** Generated Zod bodies are the source of truth for the Like wire shapes. */
describe("PostApiLikeBody (toggle)", () => {
    it("accepts the canonical { postId } shape", () => {
        assert.deepEqual(PostApiLikeBody.parse({ postId: "p-1" }), { postId: "p-1" });
    });
    it("strips unknown keys", () => {
        assert.deepEqual(PostApiLikeBody.parse({ postId: "p-1", userId: "u-1" }), { postId: "p-1" });
    });
});
describe("GetApiLikePostIdQueryParams", () => {
    it("defaults to page 1 / limit 20 (lowercase keys per spec)", () => {
        assert.deepEqual(GetApiLikePostIdQueryParams.parse({}), { page: 1, limit: 20 });
    });
});
