import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    GetApiPostsFeedQueryParams,
    GetApiPostsMyPostsQueryParams,
    GetApiPostsUserUserIdQueryParams,
    PostApiPostsBody,
    PostApiPostsShareBody,
    PutApiPostsBody,
} from "./posts.js";

/**
 * The generated Zod bodies are the source of truth for the Posts wire shapes.
 * Paging keys are PascalCase (`Page`/`Limit`) per the spec — the facade must
 * pass them through unchanged.
 */
describe("PostApiPostsBody (create)", () => {
    it("accepts the canonical shape", () => {
        assert.deepEqual(
            PostApiPostsBody.parse({
                title: "Hi",
                content: "Hello",
                visibility: "Public",
                media: [{ name: "a.png", type: "image", url: "https://x/a.png" }],
            }),
            {
                title: "Hi",
                content: "Hello",
                visibility: "Public",
                media: [{ name: "a.png", type: "image", url: "https://x/a.png" }],
            }
        );
    });

    it("strips media `id` (server assigns on create) but keeps `postId`", () => {
        assert.deepEqual(
            PostApiPostsBody.parse({
                title: "Hi",
                visibility: "Public",
                media: [{ id: "m-1", postId: "p-1", name: "a.png", type: "image", url: "https://x/a.png" }],
            }),
            {
                title: "Hi",
                visibility: "Public",
                media: [{ postId: "p-1", name: "a.png", type: "image", url: "https://x/a.png" }],
            }
        );
    });

    it("rejects non-string title/content", () => {
        assert.throws(() => PostApiPostsBody.parse({ title: 42 }));
    });
});

describe("PutApiPostsBody (update)", () => {
    it("keeps media `id` for server-side reconciliation", () => {
        const out = PutApiPostsBody.parse({
            id: "p-1",
            title: "New",
            visibility: "Private",
            media: [{ id: "m-1", name: "a.png", type: "image", url: "https://x/a.png" }],
        });
        assert.equal(out.media?.[0]?.id, "m-1");
    });

    it("allows id-less media entries (inserts)", () => {
        const out = PutApiPostsBody.parse({ id: "p-1", media: [{ name: "b.png" }] });
        assert.equal(out.media?.length, 1);
    });
});

describe("PostApiPostsShareBody", () => {
    it("requires parentPostId", () => {
        assert.throws(() => PostApiPostsShareBody.parse({ title: "x" }));
        assert.deepEqual(
            PostApiPostsShareBody.parse({ parentPostId: "p-9", visibility: "Public" }),
            { parentPostId: "p-9", visibility: "Public" }
        );
    });
});

describe("Posts paging params", () => {
    it("default to page 1 / limit 20 with PascalCase keys", () => {
        assert.deepEqual(GetApiPostsFeedQueryParams.parse({}), { Page: 1, Limit: 20 });
        assert.deepEqual(GetApiPostsMyPostsQueryParams.parse({}), { Page: 1, Limit: 20 });
        assert.deepEqual(GetApiPostsUserUserIdQueryParams.parse({}), { Page: 1, Limit: 20 });
    });

    it("passes explicit values through", () => {
        assert.deepEqual(GetApiPostsFeedQueryParams.parse({ Page: 3, Limit: 5 }), { Page: 3, Limit: 5 });
    });
});
