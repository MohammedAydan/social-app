import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    resolveButtonState,
    resolveOutgoingCancel,
    resolveUnfollow,
    type PairResult,
} from "./follow-state.js";

/**
 * Full social-graph sequences against a tiny fake server, mirroring the
 * production failure point (API_REFERENCE §5): the follow-button label must
 * track the server row through request → accept → unfollow transitions, and
 * cancelling after a remote accept must never delete the accepted row.
 */
const notFound = (): PairResult => ({ success: false, message: "Follow relationship not found." });
const ok = (): PairResult => ({ success: true, message: "OK" });

/** Minimal server: at most one row per pair, pending or accepted. */
const makeServer = () => {
    let row: "pending" | "accepted" | null = null;
    const calls: string[] = [];
    return {
        calls,
        flags: () => ({
            isFollowing: row !== null,
            isFollowingAccepted: row === "accepted",
        }),
        /** Test-only writer: seeds the server row. */
        seed: (next: "pending" | "accepted" | null) => {
            row = next;
        },
        // Accept happens "elsewhere" (second account / notification action).
        acceptElsewhere: () => {
            if (row === "pending") row = "accepted";
        },
        reject: async (): Promise<PairResult> => {
            calls.push("reject");
            if (row === "pending") {
                row = null;
                return ok();
            }
            return notFound();
        },
        unfollow: async (): Promise<PairResult> => {
            calls.push("unfollow");
            if (row !== null) {
                row = null;
                return ok();
            }
            return notFound();
        },
    };
};

const labelOf = (server: ReturnType<typeof makeServer>): string =>
    resolveButtonState(server.flags());

describe("follow → accept → unfollow sequence (envelope regression target)", () => {
    it("end-to-end through the real seams: pending accept then cancel is safe", async () => {
        const server = makeServer();
        server.seed("pending");
        assert.equal(labelOf(server), "requested");

        server.acceptElsewhere();
        assert.equal(labelOf(server), "unfollow");

        // User still sees Requested (stale cache) and hits cancel: the
        // reject-first chain must report became-accepted and call nothing else.
        const out = await resolveOutgoingCancel({
            reject: server.reject,
            unfollow: server.unfollow,
            refreshProfile: async () => server.flags(),
        });
        assert.equal(out.via, "became-accepted");
        assert.deepEqual(server.calls, ["reject"]);
        // The accepted row survives; the button now reads Unfollow.
        assert.equal(labelOf(server), "unfollow");
    });

    it("Unfollow removes the accepted row and returns to Follow", async () => {
        const server = makeServer();
        server.seed("accepted");
        assert.equal(labelOf(server), "unfollow");

        const out = await resolveUnfollow({ unfollow: server.unfollow, reject: server.reject });
        assert.equal(out.ok, true);
        assert.equal(out.via, "unfollow");
        assert.deepEqual(server.calls, ["unfollow"]);
        assert.equal(labelOf(server), "follow");
    });

    it("cancel of a genuinely pending request deletes exactly that row", async () => {
        const server = makeServer();
        server.seed("pending");

        const out = await resolveOutgoingCancel({
            reject: server.reject,
            unfollow: server.unfollow,
            refreshProfile: async () => server.flags(),
        });
        assert.equal(out.ok, true);
        assert.equal(out.via, "reject");
        assert.deepEqual(server.calls, ["reject"]);
        assert.equal(labelOf(server), "follow");
    });
});
