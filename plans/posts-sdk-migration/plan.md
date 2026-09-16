# Plan: posts-sdk-migration

## Goal
Migrate the posts domain (`app/shared/api/api.posts.ts` + local request DTOs) to the generated SDK with zero behavior change, and fix the latent `handleRequest` double-unwrap bug the follow migration introduced.

## Acceptance criteria
- [ ] `api.posts.ts` calls only SDK endpoint functions; no `api.post/get/put/delete` literals.
- [ ] No local `CreatePostType`/`CreateMediaRequest`/`UpdatePostRequest`(request)/`SharePostRequest` (request) — all importers use `app/lib/sdk/models`.
- [ ] Payloads pass through generated Zod bodies (`PostApiPostsBody`, `PutApiPostsBody`, `PostApiPostsShareBody`).
- [ ] `handleRequest` returns the full envelope for BOTH `AxiosResponse` input and SDK-unwrapped input (regression-tested).
- [ ] `npm test` (incl. 2 new suites), `npm run typecheck`, `npm run build` all green.

## Approach
1. Fix `handleRequest` with an AxiosResponse shape guard (`status`+`config` present → `.data`, else body as-is).
2. Rewrite `api.posts.ts` on `postApiPosts`, `putApiPosts`, `postApiPostsShare`, `getApiPostsMyPosts`, `getApiPostsUserUserId`, `getApiPostsFeed`, `getApiPostsPostId`, `deleteApiPostsPostId`; Zod-parse bodies; `normalizeVisibility` before send; PascalCase paging.
3. Swap type imports at the 5 call sites; delete the 3 local DTO files. Keep `post-types.ts` (response entities have no spec model).
4. Add `posts.test.ts` (Zod contracts) + `api.handle-request.test.ts` (both input shapes); extend `tsconfig.test.json`; run all gates.

## Scope
IN: `api.posts.ts`, `api.handle-request.ts`, 3 DTO files, 5 importing files, 2 new test files.
OUT: other domains (comments/likes/user/notifications stay manual), UI redesign, generated-code logic edits.

## Dependencies
- Hardened axios + `customInstance` (done, follow migration). No new deps.

## Complexity
M
