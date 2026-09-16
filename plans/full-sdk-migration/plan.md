# Plan: full-sdk-migration

## Goal
Migrate every remaining manual API module (comments, likes, block, notifications, user, auth) to the generated SDK so zero legacy HTTP references remain outside transport (`axios.ts`), the envelope helper, and the storage exception (ADR-005).

## Acceptance criteria
- [ ] No `api.get/post/put/delete(` literals outside `axios.ts`, `api.storage.ts`.
- [ ] No local request DTOs duplicated by spec models; consumers import from `app/lib/sdk/models`.
- [ ] All write payloads pass through generated Zod bodies; paging uses generated query-param schemas.
- [ ] `npm test` all green (incl. new per-domain contract suites), `npm run typecheck` exit 0, `npm run build` exit 0.
- [ ] `git status` shows only intended files; grep for legacy references returns only the documented exceptions.

## Approach
Per domain, same slice pattern (PATTERNS.md): read SDK signatures → rewrite facade → swap consumer type imports → delete dup DTOs → add Zod contract test → run gates at the end (plus typecheck after each domain to catch breakage early).

## Scope
IN: `api.comments.ts`, `api.likes.ts`, `api.block.ts`, `api.notifications.ts`, `api.user.ts`, `api.auth.ts`, dup DTOs in `app/shared/types/`, consumer import swaps, new tests.
OUT: `axios.ts` (transport, ADR-002), `api.storage.ts` (no SDK coverage, ADR-005), generated-code logic edits, UI changes, admin SDK surface (no consumers).

## Dependencies
- `handleRequest` dual-shape fix (done). No new deps.

## Complexity
L
