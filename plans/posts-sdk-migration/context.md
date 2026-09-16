# Context: posts-sdk-migration

## The double-unwrap bug (found pre-plan, drives task 1)
- `customInstance` (`app/lib/sdk/custom-instance.ts:23`) does `api.request<T>().then(({data}) => data)` → SDK fns resolve to the **body** (the `{success,message,data}` envelope).
- `handleRequest` (`app/shared/api/api.handle-request.ts:5`) does `return response.data` → correct for `AxiosResponse`, but for SDK input returns `envelope.data` (inner payload). Callers (`use-follow-requests.tsx:30`, `follow-button.tsx`) read `.success` → `undefined` → every follow mutation misbehaves against the live API. Unit tests missed it (faked facades).
- Fix: shape guard — AxiosResponse (`status`+`config` keys) → `response.data`, else body as-is. Covers mixed manual/SDK world during staged migration.

## Files to touch
- `app/shared/api/api.handle-request.ts` (fix) + `api.handle-request.test.ts` (new)
- `app/shared/api/api.posts.ts` (rewrite)
- Importers (type-import swap only): `app/features/feed/pages/add-post-page.tsx`, `app/features/feed/pages/update-post.tsx`, `app/shared/types/create-post-dialog.tsx`, `app/features/feed/components/add-post-form.tsx`, `app/features/feed/hooks/use-manage-media.tsx`
- Delete: `app/shared/types/create-post-type.ts`, `update-post-type.ts`, `share-post-type.ts`
- Keep: `app/shared/types/post-types.ts` (PostType/PostUserType/Media/normalizeVisibility — no spec model exists)
- `tsconfig.test.json` (add 2 suites), `app/lib/sdk/validations/posts/posts.test.ts` (new)

## SDK notes
- Writes: `postApiPosts` / `putApiPosts` / `postApiPostsShare` (all `customInstance<void>` — `handleRequest` takes `Promise<any>`, fine).
- Reads: `getApiPostsFeed({Page,Limit})`, `getApiPostsMyPosts({Page,Limit})`, `getApiPostsUserUserId(userId,{Page,Limit})`, `getApiPostsPostId(postId)`, `deleteApiPostsPostId(postId)`.
- Zod `PutApiPostsBody` media includes `id`; `PostApiPostsBody` media has no `id` (stripped on create — correct, server assigns). `parse` strips unknown keys.
- GET/DELETE SDK wrappers are mislabeled `use*Mutation` and POST/PUT as `use*Query` upstream — use raw fns in existing hooks (established pattern).

## Open questions
- None. Behavior to preserve: PascalCase visibility, update-post media semantics, `ApiResponse` envelope shape at every facade.
