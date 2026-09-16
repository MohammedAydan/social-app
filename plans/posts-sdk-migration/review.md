# Review: posts-sdk-migration

## What was built
- `api.posts.ts` rewritten on the 8 SDK endpoint functions with canonical models + Zod `parse` at the boundary; `normalizeVisibility` centralized in the facade.
- `handleRequest` fixed to accept both `AxiosResponse` and SDK-unwrapped envelopes (shape guard on `status`+`config`) — this also repairs the follow domain, which was silently returning `envelope.data` and breaking every `.success` check against the live API.
- Deleted `create-post-type.ts`, `update-post-type.ts`, `share-post-type.ts`; 5 importers moved to SDK models (update flow uses `MediaDto` to preserve id-reconciliation).
- New suites: `api.handle-request.test.ts` (4), `validations/posts/posts.test.ts` (8).

## Edge cases handled
- Update media semantics preserved: update schema keeps `id` (reconcile), create schema drops it; never-empty-array rule untouched in `update-post.tsx`.
- Optional SDK media fields guarded at the two strict-mode call sites (`m.url`, `m.type`).
- PascalCase paging (`Page`/`Limit`) + Zod defaults (1/20) match previous literals.

## Known limitations / follow-ups
- `customInstance` is still typed `<T>` while endpoint fns declare `void` — envelopes flow as `any` through `handleRequest`. Fix at Orval-config level when the spec pipeline is available.
- Other domains still manual — migrate one domain per change.
- `add-post-form-D8fCY6O7`/`follow-*` chunks carry Zod weight; lazy-load candidates.
- Live two-account smoke test still owed (follow accept → sender flips to Unfollow).
