# Plan: post-reporting

## Goal
Let users report another user's post for policy violation via SDK-only API, with reason validation, duplicate/self-report error handling, plus my-reports list + cancel-pending backed by the same facade.

## Acceptance criteria
- [ ] `reportPost(postId, {reason, details})` sends PascalCase-validated body through raw SDK `postApiPostsPostIdReport`; `details` required when `reason=Other` (client-side, case-insensitive).
- [ ] `getMyReports(Page, Limit)` + `cancelReport(reportId)` facades use raw SDK fns + PascalCase paging; no manual HTTP, no duplicate DTOs (types from `models`, schemas from `validations`).
- [ ] PostHeader others'-posts menu shows Report item (own posts excluded — server 400s self-report); dialog offers 8 server reasons, details field, loading/error/toast states; success toast on envelope success.
- [ ] Envelope errors map to user messages: duplicate open report, self-report, validation (400), missing/deleted (404), auth (401); no unhandled rejections.
- [ ] Unit tests green for reason validation + error classifier + facade param mapping; `npm test`, `typecheck`, `build` green.

## Approach
1. Extend `app/shared/api/api.posts.ts` with report facades (raw SDK fns + Zod parse + `handleRequest`), local `ReportType` (no spec response model — same class as `PostType`), reason constants + `parseReportPayload` helper enforcing Other→details.
2. Add `useReportPost` hook (own `useMutation`, fire raw fetcher — generated `usePostApiPostsPostIdReport` is query-style/inverted per ADR pattern) + `ReportPostDialog` wired into `PostHeader` BlockAuthorMenu area (rename-safe: add item, keep Block flow untouched).
3. Unit tests co-located: payload validation + error-message classifier + facade mapping (stub SDK module, assert parsed args). Verify with real `npm test`/typecheck/build; no live E2E (rate-limited API, no donor flow).

## Scope
IN: 3 report endpoints in posts facade, reason constants/helper, report dialog + hook, my-reports/cancel hooks (facade-level, no dedicated page), unit tests, TECH_STACK/DECISIONS touch-ups if needed.
OUT: Admin moderation queue/resolve UI, dedicated `/reports/mine` route/page, notifications copy changes, backend changes.

## Dependencies
- SDK surface verified: `postApiPostsPostIdReport`, `getApiPostsReportsMine`, `deleteApiPostsReportsReportId` (raw fns) + `ReportPostRequest` model + `PostApiPostsPostIdReportBody/Params`, `GetApiPostsReportsMineQueryParams`, `DeleteApiPostsReportsReportIdParams` schemas.
- UI primitives: Dialog, DropdownMenu, Select, Textarea, Button, sonner toast (already in repo).

## Complexity
M
