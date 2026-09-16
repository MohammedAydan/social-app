# Review: platform-verification (+ verification matrix)

## Gates (all green, final state)
- `npm test`: **92/92 pass, 36 suites, 0 fail** (was 82; +token storage 4, +follow-sequence 3, +user-type 3).
- `npm run typecheck`: exit 0. `npm run build`: exit 0 (client + SSR).
- Legacy sweep: zero manual HTTP outside `axios.ts` (transport), `custom-instance.ts` (mutator), `api.storage.ts` (ADR-005, no SDK coverage).
- E2E `tests/e2e/two-account-flow.spec.ts`: **1 passed (13.5s)** headless Chromium vs prod build + live API. Guards: pageErrors 0, console errors 0, HTTP 5xx 0, HTTP 4xx 0.

## E2E step log (green run)
register B 200 → A login → follow 200/success → button Unfollow → **server truth: A→B row in following list** → B follows A → Requested → accept 200 "Follow request accepted" → card consumed → **server truth: B→A accepted** → post published (id) → B like toggles + count (1) + comment renders → A sees count/comment + inbox mentions B.

## Bugs found & fixed by this mission (all verified live)
1. **Harness CORS**: API allow-lists `localhost` only — config uses `http://localhost:3000`.
2. **Swapped relationship flags** (backend): `isFollower*` carries I-follow-them. Fixed at boundary (`normalizeRelationshipFlags`, unit-tested, ADR-006). Was the reason the button could never leave Follow.
3. **Backend write-lag + per-target read cache (TTL minutes)**: followMutation keeps sticky optimistic flags + poll-until-progress (writes cache only on progress); same-URL reload loops in spec (reloads destroy the poll loop — no reload mid-convergence).
4. **Inbox Accept/Decline never rendered**: inbox follow-requests carry requester in `userId` (senderUser/followerId null) — card resolves fallback. Proof: buttons appeared, accept 200, card consumed.
5. **Accept left stale cards**: `useFollowRequestActions` now invalidates `['notifications']` too.
6. **ActionButton dropped `aria-label`** (like button unaddressable): forwards rest props now.
7. **Search fired empty `q` → 400**: `handleSearch` synced debounce instead of bare `refetch()` (bypassed `enabled`).

## Verification matrix
| Domain | Unit (node:test) | Live E2E proof |
|---|---|---|
| Auth/session | token storage 4/4; Bearer/refresh logic reviewed in `axios.ts` | UI logins A+B, token persistence across navigations |
| Envelope handling | `handleRequest` dual-shape 4/4 | every mutation envelope (follow/accept/post/like/comment) read `.success` correctly — the old double-unwrap would fail all of them |
| Follow/social graph | state machine 13/13 + sequences 3/3 + flags 3/3 | follow→Unfollow, request→accept→card-consumed, server-truth row asserts |
| Posts/likes/comments | Zod contracts 3+2+2+2 | publish→like(1)→comment renders→A observes |
| Notifications | Zod contracts 5/5 | inbox renders requests; like/comment notifications mention B |
| Block | Zod contracts 8/8 | (no UI exercise — no donor flow; contracts + sweep only) |
| User/auth DTOs | Zod incl. birthDate/password policy 7/7 | register + sign-in live |

## Known backend defects (reported, out of frontend scope)
- Swapped `isFollowing`/`isFollower` pairs; async write visibility (seconds–minutes); per-target flag/count cache (stranger served another viewer's snapshot — evidence: `2 Followers` + Unfollow for a no-relation pair); accept refreshes neither flags nor counts; duplicate-follow → HTTP 500 (handled via envelope classifier); aggressive 429s (register/sign-in; spec backs off).
- E2E design consequences (in `plans/platform-verification/context.md`): fresh B per run, no reset+immediate-rerun (trailing writes eat fresh rows), API lists (live) for server truth, UI flags best-effort.

## Follow-ups
- Principled accept-propagation (e.g. react to accept notifications → invalidate profile) once backend refreshes accept-side flags.
- `DECISIONS.md` now holds ADR-006; `TECH_STACK.md` gained the Playwright row.
- Stop the prod harness server when done (`:3000`) — it was left running for inspection.
