# Review: full-sdk-migration

## What was built
All remaining manual API modules migrated to the generated SDK:
- **comments**: 7 SDK fns, 3 DTOs deleted (facade-only), lowercase paging preserved.
- **likes**: `postApiLike` + `getApiLikePostId`; `LikeRequestType` deleted (zero consumers).
- **block**: 4 SDK fns; `userId` echo dropped (server derives blocker from JWT) — `use-block-user.tsx` simplified, `BlockUserRequestType` deleted, response normalizer kept.
- **notifications**: 13 SDK fns; `Any` payloads → canonical DTOs (`any.ts` deleted); unconsumed local `NotificationPreference` deleted in favor of `NotificationPreferenceDto`; `InboxParams` kept (facade-level, validated by the generated inbox schema).
- **user + auth**: 10 SDK fns incl. `postApiUserLogout` (also fixed a stray manual `api.post` in `AuthService.signOut`); `CreateUserType`/`SignInType`/`UpdateUserType`/inline password interfaces deleted; `birthDate` serialized `Date → ISO` at the 3 constructing call sites (Zod enforces datetime+offset); `AuthResponseType`/`UserType` kept (no spec models).
- 5 new Zod contract suites (30 tests). Total: 82/82.

## Edge cases handled
- `update-user-dialog` keeps UI-only form extras (`userGender`, date-only string) and restores the wire shape at submit; `userGender` explicitly omitted (spec has no such key).
- `updateComment(id, payload)` facade signature kept; adapted to `putApiCommentsCommentId(commentId, body)` inside.
- `api.auth.ts` bespoke try/catch normalized to `handleRequest` (identical semantics).

## Known limitations / follow-ups
- `api.storage.ts` is the single manual-HTTP exception (no SDK storage endpoint, ADR-005).
- `customInstance<void>` typing + inverted generated hooks still upstream Orval issues.
- `git status` could not run (Windows ownership guard on `.git`); legacy sweep done via grep instead — zero true remnants (only transport, mutator, storage).
- Live smoke test still owed (register → post → follow-request → accept on two accounts).
