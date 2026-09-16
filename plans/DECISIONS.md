# Architecture Decisions

## ADR-001: Generated SDK is the only API layer
- **Date:** 2026-09-16
- **Status:** Accepted
- **Context:** Manual facades in `app/shared/api/` duplicated DTOs and drifted from the backend spec.
- **Decision:** All network traffic goes through `app/lib/sdk/endpoints`, all DTOs come from `app/lib/sdk/models`, all boundary validation uses `app/lib/sdk/validations`. Local duplicate request DTOs are deleted.
- **Alternatives considered:** Keep manual facades and sync by hand — rejected (drift already caused bugs).
- **Consequences:** Facades become thin SDK+envelope adapters; Orval regeneration must preserve the `../../custom-instance` import path.

## ADR-002: Single axios transport shared by manual layer and SDK mutator
- **Date:** 2026-09-16
- **Status:** Accepted
- **Context:** Generated `custom-instance.ts` shipped with a Next.js `process.env` base URL and wrong token key — unusable under Vite.
- **Decision:** `custom-instance.ts` delegates to `shared/api/axios` (base URL, x-api-key, Bearer, single-flight 401 refresh). One interceptor chain.
- **Consequences:** `axios.ts` is transport, not legacy — it stays.

## ADR-006: Compensate swapped relationship flags + write-lag at the frontend boundary
- **Date:** 2026-09-17
- **Status:** Accepted
- **Context:** Live E2E triage (6 fresh pairs, stable across reads): an accepted A→B row reads `isFollower:true/accepted:true, isFollowing:false/accepted:false` while `followersCount` increments — the backend returns the I-follow-them / they-follow-me pairs swapped. Separately, reads in the first seconds after a 200/success write miss the row (async write visibility), so invalidate-on-success clobbers the correct optimistic state with stale flags.
- **Decision:** (1) `normalizeRelationshipFlags` swaps the pairs once in `getUserProfile`/`getCurrentUser` (unit-tested; E2E is the tripwire — remove when the backend returns documented orientation). (2) `followMutation.onSuccess` keeps the optimistic flags and converges via a background poll (10×3s, break on `isFollowing` or count increment — a fixed 4s delay proved shorter than the write-lag window); 15s pending poll + focus refetch remain backstops. Unfollow/reject paths already skip invalidation — unchanged.
- **Alternatives considered:** Wait for a backend fix — rejected (button permanently stuck on "Follow" for all users meanwhile; backend repo not in scope).
- **Consequences:** Private-target zeroed flags (single observation) remain unhandled — indistinguishable from no-relation client-side.
---

## ADR-003: `handleRequest` accepts both AxiosResponse and SDK-unwrapped envelopes
- **Date:** 2026-09-16
- **Status:** Accepted
- **Context:** `customInstance` strips axios (`response.data`), so `handleRequest` double-unwrapped SDK results and broke every `.success` check (found in posts migration).
- **Decision:** Shape guard (`status`+`config` ⇒ AxiosResponse ⇒ `.data`, else body as-is). Regression-tested both shapes.
- **Consequences:** Mixed manual/SDK world is safe during staged migration.

## ADR-004: Raw SDK functions inside app hooks, not generated wrappers
- **Date:** 2026-09-16
- **Status:** Accepted
- **Context:** Generated wrappers are semantically inverted (POSTs as `use*Query`, GETs as `use*Mutation`).
- **Decision:** Components keep their own `useMutation`/`useInfiniteQuery` and call raw SDK functions. Fix the wrappers at Orval-config level when available.
---

## ADR-005: Storage uploads stay manual (no SDK coverage)- **Date:** 2026-09-16
- **Status:** Accepted
- **Context:** The spec/SDK has no storage endpoint; uploads need multipart `FormData` + progress callbacks.
- **Decision:** `api.storage.ts` remains the single manual-HTTP exception (transport reuse, not a facade).
---
