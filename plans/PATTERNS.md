# Engineering Patterns

## Pattern: SDK facade slice [feature: posts-sdk-migration]
- **Problem:** Migrating a domain to the SDK without behavior change.
- **Solution:** Rewrite `api.<domain>.ts` as Zod-parse → SDK fn → `handleRequest`; swap type imports at call sites; delete local DTOs; add a Zod contract test.
- **Example:** `app/shared/api/api.posts.ts`, `app/lib/sdk/validations/posts/posts.test.ts`
- **Gotchas:** `parse` strips unknown keys (verify create-vs-update media `id` semantics in a test first); SDK paging keys are PascalCase (`Page`/`Limit`); write fns are typed `void` so `handleRequest` sees `any`.

## Pattern: Canonical-shape guard [feature: posts-sdk-migration]
- **Problem:** Spec marks DTO keys optional, so stale aliases (e.g. `followingId`) type-check but pollute the wire.
- **Solution:** Always `parse` with the generated Zod body before sending — unknown keys are stripped by default.
- **Example:** `api.follow.ts` header comment; `follow.test.ts` "strip unknown keys".

## Pattern: Dual-shape envelope handling [feature: posts-sdk-migration]
- **Problem:** `customInstance` unwraps axios; manual calls don't. One `handleRequest` serves both.
- **Solution:** Guard on `status`+`config` (AxiosResponse-only keys), never on `data` (both shapes carry it).
- **Example:** `app/shared/api/api.handle-request.ts` + `api.handle-request.test.ts`

## Pattern: Response entities without spec models stay local [feature: posts-sdk-migration]
- **Problem:** `PostType`, `CommentType`, `UserType` etc. have no spec model — deleting them would invent SDK types that don't exist.
- **Solution:** Keep response/normalizer types in `app/shared/types`; delete only request DTOs duplicated by the spec.
---
