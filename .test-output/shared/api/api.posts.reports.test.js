import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ZodError } from "zod";
import { DeleteApiPostsReportsReportIdParams, GetApiPostsReportsMineQueryParams, PostApiPostsPostIdReportBody, PostApiPostsPostIdReportParams, } from "../../lib/sdk/validations/posts/posts.js";
/**
 * Report-facade param-mapping contracts (`app/shared/api/api.posts.ts`).
 *
 * What this file covers: the exact Zod schemas the report facades parse with
 * before touching the network — paging defaults for `getMyReports`, the
 * `postId` / `reportId` params for `reportPost` / `cancelReport`, and the
 * report body shape. Each facade parses its params FIRST and only then invokes
 * the raw SDK fn, so a schema rejection here is proof the facade throws before
 * any network call. No test below invokes an SDK endpoint fn: zero live traffic.
 *
 * Direct helper suites (`parseReportPayload` canonicalization, `Other`→details
 * rule, `classifyReportError` word-boundary guards) live in
 * `app/shared/utils/report-helpers.test.ts` — the helpers were extracted to the
 * alias-free `report-helpers.ts` leaf module precisely so node:test can import
 * them (the facade's `~/` alias is unresolvable under `tsconfig.test.json`).
 */
describe("report paging contract (getMyReports mapping)", () => {
    it("defaults an empty parse to { Page: 1, Limit: 20 }", () => {
        assert.deepEqual(GetApiPostsReportsMineQueryParams.parse({}), { Page: 1, Limit: 20 });
    });
    it("passes explicit PascalCase Page/Limit through unchanged", () => {
        assert.deepEqual(GetApiPostsReportsMineQueryParams.parse({ Page: 2, Limit: 5 }), {
            Page: 2,
            Limit: 5,
        });
    });
    it("rejects a non-integer Page", () => {
        assert.throws(() => GetApiPostsReportsMineQueryParams.parse({ Page: 1.5 }));
    });
});
describe("reportPost pre-network param validation (PostApiPostsPostIdReportParams)", () => {
    it("accepts a string postId", () => {
        assert.deepEqual(PostApiPostsPostIdReportParams.parse({ postId: "p-1" }), { postId: "p-1" });
    });
    it("rejects a missing postId with a ZodError (facade throws before any SDK call)", () => {
        assert.throws(() => PostApiPostsPostIdReportParams.parse({}), ZodError);
    });
    it("rejects undefined/null/non-string postIds with a ZodError", () => {
        for (const postId of [undefined, null, 123]) {
            assert.throws(() => PostApiPostsPostIdReportParams.parse({ postId: postId }), ZodError, `expected ZodError for postId=${String(postId)}`);
        }
    });
});
describe("report payload shape (PostApiPostsPostIdReportBody)", () => {
    it("accepts a canonical reason with null details (the facade's default mapping)", () => {
        assert.deepEqual(PostApiPostsPostIdReportBody.parse({ reason: "Spam", details: null }), {
            reason: "Spam",
            details: null,
        });
    });
    it("accepts a reason with details text (the Other path)", () => {
        assert.deepEqual(PostApiPostsPostIdReportBody.parse({ reason: "Other", details: "copied artwork" }), { reason: "Other", details: "copied artwork" });
    });
    it("leaves details optional (facade normalizes missing details to null first)", () => {
        assert.deepEqual(PostApiPostsPostIdReportBody.parse({ reason: "HateSpeech" }), {
            reason: "HateSpeech",
        });
    });
    it("rejects a non-string reason", () => {
        assert.throws(() => PostApiPostsPostIdReportBody.parse({ reason: 7 }), ZodError);
    });
});
describe("cancelReport pre-network param validation (DeleteApiPostsReportsReportIdParams)", () => {
    it("accepts a string reportId", () => {
        assert.deepEqual(DeleteApiPostsReportsReportIdParams.parse({ reportId: "r-1" }), {
            reportId: "r-1",
        });
    });
    it("rejects missing/undefined/null/non-string reportIds with a ZodError", () => {
        assert.throws(() => DeleteApiPostsReportsReportIdParams.parse({}), ZodError);
        for (const reportId of [undefined, null, 42]) {
            assert.throws(() => DeleteApiPostsReportsReportIdParams.parse({
                reportId: reportId,
            }), ZodError, `expected ZodError for reportId=${String(reportId)}`);
        }
    });
});
