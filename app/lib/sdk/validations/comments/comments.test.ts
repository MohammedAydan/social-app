import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    GetApiCommentsPostPostIdQueryParams,
    PostApiCommentsBody,
    PostApiCommentsReplyBody,
    PutApiCommentsCommentIdBody,
} from "./comments.js";

/** Generated Zod bodies are the source of truth for the Comments wire shapes. */
describe("PostApiCommentsBody (create)", () => {
    it("accepts the canonical { postId, content } pair", () => {
        assert.deepEqual(
            PostApiCommentsBody.parse({ postId: "p-1", content: "Nice!" }),
            { postId: "p-1", content: "Nice!" }
        );
    });

    it("strips unknown keys", () => {
        assert.deepEqual(
            PostApiCommentsBody.parse({ postId: "p-1", content: "x", authorId: "u-1" }),
            { postId: "p-1", content: "x" }
        );
    });
});

describe("PostApiCommentsReplyBody", () => {
    it("accepts the canonical { postId, content, parentId } triple", () => {
        assert.deepEqual(
            PostApiCommentsReplyBody.parse({ postId: "p-1", content: "Agreed", parentId: "c-1" }),
            { postId: "p-1", content: "Agreed", parentId: "c-1" }
        );
    });
});

describe("PutApiCommentsCommentIdBody (update)", () => {
    it("accepts the canonical { id, content } pair", () => {
        assert.deepEqual(
            PutApiCommentsCommentIdBody.parse({ id: "c-1", content: "Edited" }),
            { id: "c-1", content: "Edited" }
        );
    });
});

describe("GetApiCommentsPostPostIdQueryParams", () => {
    it("defaults to page 1 / limit 10 (lowercase keys per spec)", () => {
        assert.deepEqual(GetApiCommentsPostPostIdQueryParams.parse({}), { page: 1, limit: 10 });
    });

    it("passes explicit values through", () => {
        assert.deepEqual(GetApiCommentsPostPostIdQueryParams.parse({ page: 2, limit: 5 }), {
            page: 2,
            limit: 5,
        });
    });
});
