# Review: post-reporting

## What was built
- Facade (`app/shared/api/api.posts.ts`): `reportPost`, `getMyReports` (PascalCase Page/Limit), `cancelReport` via raw SDK fns + Zod parse + `handleRequest`; pure helpers (`REPORT_REASONS`, `ReportReason`, `ReportPostInput`, `parseReportPayload`, `ReportErrorKind`, `classifyReportError`) extracted to alias-free `app/shared/utils/report-helpers.ts`, re-exported from the facade so UI imports are unchanged.
- Types: local `ReportType` (`app/shared/types/report-type.ts`, no spec response model — same class as `PostType`, not a duplicate DTO).
- UI: `useReportPost(postId)` hook (own `useMutation`, friendly error copy, sonner toasts) + `ReportPostDialog` (reason Select, details Textarea with Other-required guard + `role="alert"`, loading states) wired as a sibling-rendered dialog from the others'-posts `PostHeader` menu (Flag item; own-posts branch untouched — server 400s self-report).
- Tests: 12 schema-contract + 11 helper suites.

## Gates (final)
- `npm test`: **115/115 pass, 42 suites, 0 fail** (baseline 92 → +12 contracts → +11 helpers).
- `npm run typecheck`: exit 0. `npm run build`: exit 0 (client + SSR).
- Sweep: no manual HTTP in new code (only pre-existing query `refetch()` hits).

## Edge cases handled
- `Other` without details rejected client-side (case-insensitive); unknown reasons rejected before network.
- Duplicate/self-report/404/401 mapped to friendly messages; `own`/`auth` word-boundary guards (no false hit on "author"/"unknown") — encoded as tests.
- Dialog stays open with input intact on failure (retry); resets + closes on success.

## Follow-ups / limitations
- No `/reports/mine` page (facade + hooks ready; page out of scope per plan).
- Test-toolchain note: facades using the `~/` alias are unimportable under `tsconfig.test.json` (`paths:{}`) — pure/helper logic should keep living in alias-free leaf modules (pattern established here); do not "fix" by rewriting facades to relative imports (repo convention is `~/` under Vite).
