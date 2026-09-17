# Context: post-reporting

## SDK surface (verified from source, do not re-derive)
- Raw fns (`app/lib/sdk/endpoints/posts/posts.ts`): `postApiPostsPostIdReport(postId, body)` (POST `/api/Posts/{postId}/report`, query-style wrapper — do NOT use generated hook; wrap raw fn in own `useMutation`), `getApiPostsReportsMine(params?)` (GET-as-mutation shape, call directly with `{Page, Limit}`), `deleteApiPostsReportsReportId(reportId)`.
- Types (`models/`): `ReportPostRequest { reason?: string; details?: string|null }`, `GetApiPostsReportsMineParams { Page?: number; Limit?: number }`.
- Schemas (`validations/posts/posts.ts`): `PostApiPostsPostIdReportBody { reason: optional, details: nullish }`, `PostApiPostsPostIdReportParams { postId }`, `GetApiPostsReportsMineQueryParams { Page d1, Limit d20 }`, `DeleteApiPostsReportsReportIdParams { reportId }`.
- Server enum (API_REFERENCE §2 + SDK_WEB §3.5, case-insensitive): `Spam, Harassment, HateSpeech, Nudity, Violence, Misinformation, Copyright, Other`; `details` required when `Other`.
- Errors: 400 duplicate open report / self-report / validation; 401; 404 missing/deleted (cancel: 404 missing/foreign; only Pending cancellable).

## Files to touch (exclusive ownership per agent)
- Task 1 (facade): `app/shared/api/api.posts.ts` (+ local `app/shared/types/report-type.ts` if ReportType needed — no spec response model, same class as PostType; NOT a duplicate DTO).
- Task 2 (UI): `app/features/feed/hooks/use-report-post.tsx` (new), `app/features/feed/components/report-post-dialog.tsx` (new), `app/shared/components/post/post-header.tsx` (add menu item only).
- Task 3 (tests): `app/shared/api/api.posts.reports.test.ts` (new; stub `~/lib/sdk/endpoints/posts/posts`), extend `tsconfig.test.json` file list; run `npm test`, `npm run typecheck`, `npm run build`.

## Conventions (must hold)
- SDK-only: network via endpoints, types via models, validation via validations. No `fetch`/bare `axios`, no local request DTOs.
- `handleRequest` dual-shape (AxiosResponse | unwrapped envelope) — facades return `ApiResponse<T>`, never throw on envelope errors.
- Posts paging is PascalCase `Page`/`Limit`.
- `custom-instance.ts` import path `../../custom-instance` (item #22 note) is the sanctioned repair class — do not touch generated files.
- Toasts via `sonner`; error classifier maps envelope `message` substrings (duplicate/already, self/own, not found/deleted, validation) — mirror `follow-state.ts` classifier pattern.

## Open questions
- None blocking. Report-row shape for `ReportType`: define minimal `{ id, postId, reason, details, status, createdAt }` with all-optional tolerance (wire shape undocumented; envelope `data` cast) — confirm at implementation from live sample if available, else keep permissive.
