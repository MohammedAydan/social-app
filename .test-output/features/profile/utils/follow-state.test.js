import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isAlreadyFollowingMessage, isNotFoundMessage, resolveButtonState, resolveOutgoingCancel, resolveUnfollow, } from "./follow-state.js";
const ok = (message = "OK") => ({ success: true, message });
const notFound = (message = "An error occurred: Follow relationship not found.") => ({
    success: false,
    message,
});
const hardFail = (message = "Something broke") => ({ success: false, message });
describe("isAlreadyFollowingMessage", () => {
    it("matches duplicate/already phrasing", () => {
        assert.equal(isAlreadyFollowingMessage("You already follow or have a pending request."), true);
    });
    it("matches pending phrasing", () => {
        assert.equal(isAlreadyFollowingMessage("Follow request pending approval"), true);
    });
    it("is case-insensitive", () => {
        assert.equal(isAlreadyFollowingMessage("ALREADY following"), true);
    });
    it("rejects unrelated errors", () => {
        assert.equal(isAlreadyFollowingMessage("Follow relationship not found."), false);
        assert.equal(isAlreadyFollowingMessage(""), false);
    });
});
describe("isNotFoundMessage", () => {
    it("matches the unfollow 500 envelope", () => {
        assert.equal(isNotFoundMessage("An error occurred: Follow relationship not found."), true);
    });
    it("matches no-relation / no-pending variants", () => {
        assert.equal(isNotFoundMessage("No relation exists"), true);
        assert.equal(isNotFoundMessage("404 no pending request"), true);
    });
    it("is case-insensitive", () => {
        assert.equal(isNotFoundMessage("NOT FOUND"), true);
    });
    it("rejects unrelated errors", () => {
        assert.equal(isNotFoundMessage("You already follow"), false);
        assert.equal(isNotFoundMessage("Blocked users cannot interact"), false);
        assert.equal(isNotFoundMessage(""), false);
    });
});
describe("resolveButtonState", () => {
    it("shows Follow when not following", () => {
        assert.equal(resolveButtonState({ isFollowing: false, isFollowingAccepted: false }), "follow");
        // Accepted without following is incoherent input — still Follow, never Unfollow.
        assert.equal(resolveButtonState({ isFollowing: false, isFollowingAccepted: true }), "follow");
    });
    it("shows Requested for outgoing pending", () => {
        assert.equal(resolveButtonState({ isFollowing: true, isFollowingAccepted: false }), "requested");
    });
    it("shows Unfollow for accepted follows", () => {
        assert.equal(resolveButtonState({ isFollowing: true, isFollowingAccepted: true }), "unfollow");
    });
});
describe("resolveOutgoingCancel (Requested path)", () => {
    const calls = [];
    const track = (name, fn) => async () => {
        calls.push(name);
        return fn();
    };
    it("cancels via reject and never touches unfollow when pending", async () => {
        calls.length = 0;
        const deps = {
            reject: track("reject", () => ok()),
            unfollow: track("unfollow", () => ok()),
            refreshProfile: async () => ({ isFollowing: true, isFollowingAccepted: false }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, true);
        assert.equal(out.via, "reject");
        assert.deepEqual(calls, ["reject"]);
    });
    it("NEVER calls unfollow when revalidation shows the request was accepted", async () => {
        calls.length = 0;
        const deps = {
            reject: track("reject", () => notFound("404 no pending")),
            unfollow: track("unfollow", () => ok()),
            refreshProfile: async () => ({ isFollowing: true, isFollowingAccepted: true }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.via, "became-accepted");
        assert.equal(out.ok, false);
        assert.deepEqual(calls, ["reject"]);
    });
    it("converges without deleting when nothing exists", async () => {
        calls.length = 0;
        const deps = {
            reject: track("reject", () => notFound()),
            unfollow: track("unfollow", () => ok()),
            refreshProfile: async () => ({ isFollowing: false, isFollowingAccepted: false }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, true);
        assert.equal(out.via, "converged");
        assert.deepEqual(calls, ["reject"]);
    });
    it("falls back to unfollow only when still pending, and converges on its 404", async () => {
        calls.length = 0;
        const deps = {
            reject: track("reject", () => notFound()),
            unfollow: track("unfollow", () => notFound()),
            refreshProfile: async () => ({ isFollowing: true, isFollowingAccepted: false }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, true);
        assert.equal(out.via, "converged");
        assert.deepEqual(calls, ["reject", "unfollow"]);
    });
    it("uses unfollow success when the backend removes pending that way", async () => {
        const deps = {
            reject: async () => notFound(),
            unfollow: async () => ok("Cancelled"),
            refreshProfile: async () => ({ isFollowing: true, isFollowingAccepted: false }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, true);
        assert.equal(out.via, "unfollow");
    });
    it("passes hard reject errors through without further calls", async () => {
        calls.length = 0;
        const deps = {
            reject: track("reject", () => hardFail("Blocked users cannot interact")),
            unfollow: track("unfollow", () => ok()),
            refreshProfile: async () => ({ isFollowing: true, isFollowingAccepted: false }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, false);
        assert.equal(out.via, "error");
        assert.equal(out.message, "Blocked users cannot interact");
        assert.deepEqual(calls, ["reject"]);
    });
    it("passes hard unfollow errors through after revalidation", async () => {
        const deps = {
            reject: async () => notFound(),
            unfollow: async () => hardFail("DB down"),
            refreshProfile: async () => ({ isFollowing: true, isFollowingAccepted: false }),
        };
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, false);
        assert.equal(out.via, "error");
        assert.equal(out.message, "DB down");
    });
    it("falls back to a missing message when envelopes carry none", async () => {
        const deps = {
            reject: async () => ({ success: false }),
            unfollow: async () => ok(),
            refreshProfile: async () => null,
        };
        // reject with empty message is NOT a not-found → hard error path.
        const out = await resolveOutgoingCancel(deps);
        assert.equal(out.ok, false);
        assert.equal(out.via, "error");
        assert.equal(out.message, "Failed to cancel follow request");
    });
});
describe("resolveUnfollow (accepted path)", () => {
    it("unfollows directly on success", async () => {
        const calls = [];
        const out = await resolveUnfollow({
            unfollow: async () => { calls.push("unfollow"); return ok(); },
            reject: async () => { calls.push("reject"); return ok(); },
        });
        assert.equal(out.ok, true);
        assert.equal(out.via, "unfollow");
        assert.deepEqual(calls, ["unfollow"]);
    });
    it("removes a pending row via reject when unfollow 404s", async () => {
        const calls = [];
        const out = await resolveUnfollow({
            unfollow: async () => { calls.push("unfollow"); return notFound(); },
            reject: async () => { calls.push("reject"); return ok(); },
        });
        assert.equal(out.ok, true);
        assert.equal(out.via, "reject");
        assert.deepEqual(calls, ["unfollow", "reject"]);
    });
    it("converges when both handlers report nothing", async () => {
        const out = await resolveUnfollow({
            unfollow: async () => notFound(),
            reject: async () => notFound("404 no pending"),
        });
        assert.equal(out.ok, true);
        assert.equal(out.via, "converged");
    });
    it("passes hard unfollow errors through without calling reject", async () => {
        const calls = [];
        const out = await resolveUnfollow({
            unfollow: async () => { calls.push("unfollow"); return hardFail("Blocked users cannot interact"); },
            reject: async () => { calls.push("reject"); return ok(); },
        });
        assert.equal(out.ok, false);
        assert.equal(out.via, "error");
        assert.deepEqual(calls, ["unfollow"]);
    });
    it("passes hard reject errors through after an unfollow 404", async () => {
        const out = await resolveUnfollow({
            unfollow: async () => notFound(),
            reject: async () => hardFail("DB down"),
        });
        assert.equal(out.ok, false);
        assert.equal(out.via, "error");
        assert.equal(out.message, "DB down");
    });
});
