# Session Log

## Session: 2026-09-16 (bootstrap + posts-sdk-migration start)
### What was done
- Bootstrapped `plans/` (context, ARCH, TECH_STACK, this log). `DECISIONS.md`/`PATTERNS.md` deferred: 8-file plans budget vs 6-file bootstrap + 3-file feature plan; empty placeholders carry no info.
- Prior state recovered: follow domain migrated to SDK; 40 unit tests green; typecheck/build green.
- Pre-plan code read found a latent integration bug: `handleRequest` does `response.data`, but SDK `customInstance` already unwraps axios — so every SDK-backed facade returns `envelope.data` instead of the envelope and callers reading `.success` break. Unit tests missed it (faked boundaries).

### Decisions made
- Fix `handleRequest` to accept both `AxiosResponse` and unwrapped envelopes as task #1 of posts-sdk-migration (same-turn, same files) — Reason: posts migration would copy the bug to the whole feed otherwise.
- `PostType`/`PostUserType`/`Media`/visibility helpers stay: the spec has no Post response model, so they are not duplicates.

### Files changed
- `plans/*` (new)

### State at end of session
- Active feature: posts-sdk-migration — plan files written, implementation pending.
- Next task: implement `tasks.md` in order.
- Blockers: none.

### Resume instructions
Read `plans/context.md`, last entry of this file, then `plans/posts-sdk-migration/{plan,tasks,context}.md`. Continue at first `[ ]`/`[~]` task.
---

## Session: 2026-09-16 (posts-sdk-migration closed)
### What was done
- All 6 tasks `[x]`. `api.posts.ts` on SDK; 3 local DTO files deleted; 5 importers on SDK models; `handleRequest` dual-shape fix; 2 new suites.
- Test run caught a wrong test expectation (create schema keeps `postId`, strips only `id`) — test corrected, schema untouched.
- Typecheck initially failed on a dropped import in `update-post.tsx` (my edit) — restored.
- `api.handle-request.ts` type import uses `./api.response.js` suffix (NodeNext test compile); Vite build resolves it fine.

### Decisions made
- `PostType`/`Media`/visibility helpers stay — no spec response model exists, not duplicates.
- `MediaDto` (not `CreateMediaRequest`) for update-media state — preserves id-reconciliation.

### Files changed
- `app/shared/api/api.handle-request.ts`, `api.posts.ts`; 5 feed/type files; deleted 3 DTO files; 2 new test files; `tsconfig.test.json`; `plans/*`.

### State at end of session
- Active feature: none. Gates: `npm test` 52/52 · typecheck 0 · build 0 (client + SSR).
- Next task: live two-account smoke test (follow accept → sender flips to Unfollow); next SDK domain as requested.
- Blockers: none.

### Resume instructions
Read `plans/context.md` + last entry here. Suggested next domain: comments or likes (same facade pattern). Create `DECISIONS.md`/`PATTERNS.md` first (deferred by file budget).
---

## Session: 2026-09-16 (full-sdk-migration closed)
### What was done
- All 6 tasks `[x]` without per-domain approval stops. Migrated comments, likes, block, notifications, user, auth to SDK; deleted 11 local DTO/type files (`create-comment`, `create-reply-comment`, `update-comment`, `like-request`, `BlockUserRequestType`, `NotificationPreference`, `any`, `create-user`, `sign-in`, `UpdateUserType`, `create-follow`); fixed stray manual logout POST in `AuthService`.
- 5 new Zod suites (30 tests). Gates: `npm test` 82/82 · typecheck 0 · build 0 (client + SSR).
- Mid-run fixes: missing `);` in block-user test; `birthDate` Date→ISO at 3 call sites (Zod enforces it).
- Created deferred `DECISIONS.md` (5 ADRs) + `PATTERNS.md` (4 patterns).

### Decisions made
- `api.storage.ts` stays manual (ADR-005, no SDK coverage); `axios.ts` is transport, not legacy (ADR-002).
- Response entities without spec models stay local (`UserType`, `CommentType`, `NotificationType`, `LikeType`, `AuthResponseType`, block/post normalizers).

### Files changed
- `app/shared/api/`: 6 facades rewritten; `app/features/{auth,profile,feed}`: 7 consumer files; 11 type files deleted; 5 test files added; `tsconfig.test.json`; `plans/*` (6 new this session).

### State at end of session
- Active feature: none. Legacy sweep via grep: zero true remnants.
- Next task: live two-account smoke test (register → post → follow-request → accept).
- Blockers: none (`git status` blocked by Windows ownership guard — use `git config --global --add safe.directory` or run git as owner).

### Resume instructions
Read `plans/context.md` + last entry here. Next work: live smoke test, then admin SDK surface only if consumers appear.
---

## Session: 2026-09-17 (platform-verification closed)
### What was done
- All 5 tasks `[x]`. Gates: typecheck 0, build 0 (client+SSR), sweep clean, `npm test` 92/92 (36 suites: +token 4, +follow-sequence 3, +user-type 3).
- Playwright + Chromium installed (`@playwright/test` dev dep, `playwright.config.ts`, `tests/e2e/two-account-flow.spec.ts`); prod build served on :3000 (localhost — API CORS allow-lists localhost only).
- E2E green (13.5s): full two-account loop with server-truth asserts (live list endpoints) + zero-guard (pageErrors/console/5xx/4xx all 0).
- 7 bugs fixed en route: harness CORS origin; swapped relationship flags (ADR-006, `normalizeRelationshipFlags`); write-lag poll-until-progress; reload-destroys-poll-loop; inbox requesterId fallback (Accept/Decline never rendered); notifications-list invalidation on accept/decline; ActionButton aria-label forwarding; search empty-q 400.

### Decisions made
- Fresh B per run (registration reopened); no reset+immediate-rerun (trailing writes eat fresh rows); B-override env fallback kept for rate-limited periods.
- Backend defects documented as out-of-scope with evidence (review.md matrix); E2E asserts only deterministic properties, flags best-effort.

### Files changed
- App: `follow-button.tsx` (sticky optimistic + progress-only poll), `api.user.ts` (flag normalize), `user-type.ts` (+test), `notification-card.tsx` (requesterId), `use-follow-requests.tsx` (notifications invalidate), `action-button.tsx` (prop forwarding), `search-page.tsx` (debounce sync), `token.ts` (.js suffix).
- Tests: `token.test.ts`, `follow-sequence.test.ts`, `user-type.test.ts`, `tests/e2e/*`, `playwright.config.ts`, `package.json` (dev dep), `tsconfig.test.json`, `TECH_STACK.md`, `DECISIONS.md` (ADR-006), `plans/*` (4 new).

### State at end of session
- Active feature: none. Prod harness server left running on :3000 — stop it when done.
- Live test data: ~15 e2e/triage bot accounts + follows + posts on the real API (all timestamped `e2eb*`/`triage*`).
- Next task: none pending — suggest backend ticket (flags/visibility staleness) + accept-propagation follow-up.
- Blockers: none.

### Resume instructions
Read `plans/context.md` + last entry here. E2E reruns need User A creds via env (`E2E_USER_A_*`); registration may 429 after bursts (spec backs off; B-override fallback available).
---
