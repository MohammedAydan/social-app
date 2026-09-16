# Context: platform-verification

## Backend read model (verified live 2026-09-17 — shapes the whole E2E)
- Profile flag/count reads are cached **per-target, viewer-insensitive**,
  TTL on the order of minutes (a stranger was served another viewer's
  Unfollow + "Follows you" + count=2 snapshot).
- Fresh writes are invisible to reads for seconds (write-lag window).
- Accept flips the row but refreshes neither flags nor counts for the
  requester side (frozen at request-time values in all observations).
- `isFollowing`/`isFollower` arrive swapped (fresh-read evidence, 6 pairs);
  compensated by `normalizeRelationshipFlags` (ADR-006).
- Consequence for tests: never reuse B (stale snapshots); assert flags only
  via reload-tolerant `toPass` loops; prove accept functionally (B reads A's
  post); reset+immediate-rerun is invalid (trailing writes eat fresh rows).

## Credentials & env (never commit)
- User A: `E2E_USER_A_EMAIL` / `E2E_USER_A_PASSWORD` env vars (values from human, runtime-only).
- User B: runtime registration (`e2e.b.<ts>@gmail.com` / strong password) via `POST /api/User/register`; if the backend blocks login (email confirmation), task 4 → `[!]` and ask human for a second credential.
- Base URLs: app under test = local prod build (`npm start`, port TBD); API = `VITE_API_BASE_URL` from `.env`.

## Proven selectors (read from source)
- Sign-in: `getByLabel("Email address")`, `getByLabel("Password")`, `getByRole("button", { name: "Sign in button" })` → navigates `/`.
- Search `/search`: `getByPlaceholder("Search for users...")` + `getByRole("button", { name: "Search" })`; 500ms debounce; rows have `View Profile` link → `/profile/:id`.
- Profile `/profile/:userId`: FollowButton text `Follow`/`Requested`/`Unfollow`.
- Notifications `/notifications`: follow-request cards with Accept/Decline (verify exact text at spec time).
- Publish `/post/add`: title + content + `Create Post` button.
- Feed `/`: post cards with like/comment actions (verify exact selectors at spec time).

## Guards
- `page.on("pageerror")` → hard fail. Console `error` + `response.status() >= 500` collected per step; 500s fail the run unless proven pre-existing backend mapping (GlobalExceptionMiddleware 404→500) with evidence.
- Leave E2E artifacts on the test accounts (or clean up at end if cheap); record IDs in the matrix.

## Files to touch
- `playwright.config.ts` (new), `tests/e2e/two-account-flow.spec.ts` (new), `package.json` (dev dep), `plans/TECH_STACK.md` (dep row), `tsconfig.test.json` (only if new unit suites).
- No app source changes expected; any fix goes through the normal verify loop.
