import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    REPORT_REASONS,
    classifyReportError,
    parseReportPayload,
} from "./report-helpers.js";

describe("parseReportPayload (client-side report validation)", () => {
    it("canonicalizes reasons case-insensitively", () => {
        assert.deepEqual(parseReportPayload({ reason: "spam" }), { reason: "Spam", details: null });
        assert.deepEqual(parseReportPayload({ reason: "  hatespeech " }), {
            reason: "HateSpeech",
            details: null,
        });
    });

    it("passes details through for non-Other reasons", () => {
        assert.deepEqual(parseReportPayload({ reason: "Harassment", details: "slur in title" }), {
            reason: "Harassment",
            details: "slur in title",
        });
    });

    it("accepts Other with non-blank details and defaults missing details to null", () => {
        assert.deepEqual(parseReportPayload({ reason: "Other", details: "see link" }), {
            reason: "Other",
            details: "see link",
        });
        assert.deepEqual(parseReportPayload({ reason: "Nudity" }), { reason: "Nudity", details: null });
    });

    it("throws on an unknown reason", () => {
        assert.throws(() => parseReportPayload({ reason: "dislike" }), /Invalid report reason/);
    });

    it("throws on Other with missing or blank details (any casing)", () => {
        assert.throws(() => parseReportPayload({ reason: "Other" }), /details are required/);
        assert.throws(() => parseReportPayload({ reason: "other", details: "   " }), /details are required/);
        assert.throws(() => parseReportPayload({ reason: "OTHER", details: null }), /details are required/);
    });

    it("exposes exactly the 8 server reasons", () => {
        assert.deepEqual([...REPORT_REASONS], [
            "Spam",
            "Harassment",
            "HateSpeech",
            "Nudity",
            "Violence",
            "Misinformation",
            "Copyright",
            "Other",
        ]);
    });
});

describe("classifyReportError (envelope message mapping)", () => {
    it("maps duplicate/open-report phrasing", () => {
        assert.equal(classifyReportError("Duplicate open report exists"), "duplicate");
        assert.equal(classifyReportError("You already reported this post"), "duplicate");
    });

    it("maps self-report phrasing", () => {
        assert.equal(classifyReportError("You cannot report your own post"), "self");
        assert.equal(classifyReportError("Self-report is not allowed"), "self");
    });

    it("maps missing/deleted phrasing", () => {
        assert.equal(classifyReportError("Post not found"), "not-found");
        assert.equal(classifyReportError("Target post has been deleted"), "not-found");
    });

    it("maps auth phrasing without false-positiving on 'author' or 'unknown'", () => {
        assert.equal(classifyReportError("Unauthorized"), "auth");
        assert.equal(classifyReportError("post author"), "unknown");
        assert.equal(classifyReportError("unknown error"), "unknown");
    });

    it("maps validation phrasing and falls through to unknown", () => {
        assert.equal(classifyReportError("Validation failed: reason"), "validation");
        assert.equal(classifyReportError("details are required"), "validation");
        assert.equal(classifyReportError(undefined), "unknown");
        assert.equal(classifyReportError(""), "unknown");
    });
});
