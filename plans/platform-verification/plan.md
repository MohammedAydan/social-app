# Plan: platform-verification

## Goal
Prove zero regressions from the SDK migration with gates (typecheck/build/sweep/unit), then prove the live social-graph flows with a real two-account browser E2E (follow → accept → Unfollow flip, post → like + comment → counts/notification).

## Acceptance criteria
- [ ] `npm run typecheck` exit 0, `npm run build` exit 0 (client + SSR).
- [ ] Legacy sweep script green (only transport/mutator/storage touch axios or manual URLs).
- [ ] `npm test` all green with exact counts reported (incl. any new suites).
- [ ] Playwright installed + configured; `tests/e2e/two-account-flow.spec.ts` runs headless against prod build + live API.
- [ ] E2E proves: A follows B → B sees request → B accepts → A sees Unfollow; A posts → B likes + comments → A sees counts + notification.
- [ ] Console/network guard active (pageerror fail; 500s and Zod errors recorded, investigated, reported).
- [ ] Final verification matrix published (this plan's close report).

## Approach
1. Re-run static gates + sweep (fast, catches drift since last session).
2. Expand unit tests only where runnable in node (token storage with stubbed localStorage if feasible; envelope-sequence already covered).
3. Install `@playwright/test` + Chromium; serve prod build; spec uses UI login (aria-labels), search → View Profile → Follow, notifications Accept, add-post page, feed like/comment; second account via runtime registration (fallback: ask human).
4. Fix root causes on failure, rerun to 100% green, publish matrix.

## Scope
IN: gates, sweep, unit additions, Playwright config + 1 spec, live run, matrix.
OUT: UI redesign, load/perf testing, admin surface, email-verification flows (if registration blocks User B, escalate to human for a second credential instead of hacking around it).

## Dependencies
- Live API + provided User A creds (env vars, never committed). Chromium download (~170MB).
- New dev dep `@playwright/test` → update `TECH_STACK.md`.

## Complexity
L
