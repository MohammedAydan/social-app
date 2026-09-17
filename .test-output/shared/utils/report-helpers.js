// utils/report-helpers.ts — pure post-reporting helpers (reasons, payload
// builder, error classifier). Lives here (not in the facade) so the
// node:test toolchain can import it: this module uses only relative imports,
// while `app/shared/api/api.posts.ts` uses the `~/` alias which
// `tsconfig.test.json` cannot resolve. The facade re-exports everything below,
// so UI imports stay on `~/shared/api/api.posts`.
import { PostApiPostsPostIdReportBody } from "../../lib/sdk/validations/posts/posts.js";
/** Server report reasons (API_REFERENCE §2 + SDK_WEB §3.5); matched case-insensitively. */
export const REPORT_REASONS = [
    "Spam",
    "Harassment",
    "HateSpeech",
    "Nudity",
    "Violence",
    "Misinformation",
    "Copyright",
    "Other",
];
/** Canonicalize a free-form reason to the server enum (case-insensitive). */
const canonicalReason = (reason) => REPORT_REASONS.find((r) => r.toLowerCase() === reason.trim().toLowerCase());
/**
 * Build a validated `ReportPostRequest` from UI input. Throws on an unknown
 * reason or on a missing `details` when the reason is `Other`
 * (case-insensitive) — the server 400s both, so fail fast client-side.
 */
export const parseReportPayload = (input) => PostApiPostsPostIdReportBody.parse((() => {
    const canonical = canonicalReason(input.reason ?? "");
    if (!canonical) {
        throw new Error(`Invalid report reason: "${input.reason}". Must be one of: ${REPORT_REASONS.join(", ")}.`);
    }
    if (canonical === "Other" && !input.details?.trim()) {
        throw new Error("Invalid report: details are required when reason is Other.");
    }
    return { reason: canonical, details: input.details ?? null };
})());
/**
 * Map an envelope `message` to a report error kind. Substring matching in the
 * style of `app/features/profile/utils/follow-state.ts`. Word-boundary guards
 * on `own`/`auth` avoid false hits inside words like "unknown" or "author".
 */
export const classifyReportError = (message) => {
    const lower = (message ?? "").toLowerCase();
    if (lower.includes("duplicate") || lower.includes("already"))
        return "duplicate";
    if (lower.includes("own post") ||
        lower.includes("your own") ||
        lower.includes("yourself") ||
        lower.includes("self-report") ||
        lower.includes("self report") ||
        lower.includes("cannot report") ||
        lower.includes("can't report") ||
        lower.includes("can not report") ||
        /(^|[^a-z])own([^a-z]|$)/.test(lower))
        return "self";
    if (lower.includes("not found") ||
        lower.includes("deleted") ||
        lower.includes("does not exist") ||
        lower.includes("no longer") ||
        lower.includes("missing") ||
        lower.includes("not exist"))
        return "not-found";
    if (lower.includes("unauthorized") ||
        lower.includes("unauthenticated") ||
        lower.includes("authentication") ||
        lower.includes("forbidden") ||
        lower.includes("login") ||
        lower.includes("log in") ||
        lower.includes("sign in") ||
        lower.includes("signin") ||
        lower.includes("sign-in") ||
        lower.includes("401") ||
        /(^|[^a-z])auth([^a-z]|$)/.test(lower))
        return "auth";
    if (lower.includes("validation") ||
        lower.includes("invalid") ||
        lower.includes("required") ||
        lower.includes("bad request") ||
        lower.includes("must provide"))
        return "validation";
    return "unknown";
};
