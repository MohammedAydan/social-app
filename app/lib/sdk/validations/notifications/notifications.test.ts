import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    GetApiNotificationsInboxQueryParams,
    GetApiNotificationsUserUserIdQueryParams,
    PostApiNotificationsBody,
    PutApiNotificationsIdBody,
    PutApiNotificationsPreferencesBody,
} from "./notifications.js";

/** Generated Zod bodies are the source of truth for the Notifications wire shapes. */
describe("PostApiNotificationsBody (create)", () => {
    it("accepts the canonical shape", () => {
        assert.deepEqual(
            PostApiNotificationsBody.parse({ recipientId: "u-2", type: "follow", message: "X" }),
            { recipientId: "u-2", type: "follow", message: "X" }
        );
    });

    it("strips unknown keys (replaces the old `Any` payload)", () => {
        assert.deepEqual(
            PostApiNotificationsBody.parse({ type: "like", whatever: 1 }),
            { type: "like" }
        );
    });
});

describe("PutApiNotificationsIdBody (update)", () => {
    it("accepts the canonical shape", () => {
        assert.deepEqual(
            PutApiNotificationsIdBody.parse({ id: "n-1", message: "Updated" }),
            { id: "n-1", message: "Updated" }
        );
    });
});

describe("PutApiNotificationsPreferencesBody", () => {
    it("accepts flat per-type toggles", () => {
        assert.deepEqual(
            PutApiNotificationsPreferencesBody.parse({ likeEnabled: true, digestEnabled: false }),
            { likeEnabled: true, digestEnabled: false }
        );
    });
});

describe("Notifications paging params", () => {
    it("defaults user lists to page 1 / limit 20", () => {
        assert.deepEqual(GetApiNotificationsUserUserIdQueryParams.parse({}), { page: 1, limit: 20 });
    });

    it("defaults inbox unreadOnly to false with page 1 / limit 20", () => {
        assert.deepEqual(GetApiNotificationsInboxQueryParams.parse({}), {
            unreadOnly: false,
            page: 1,
            limit: 20,
        });
    });
});
