# Context: full-sdk-migration

## SDK mapping (verified against generated sources)
| Legacy | SDK functions | Models | Validations |
|---|---|---|---|
| comments | `postApiComments`, `postApiCommentsReply`, `putApiCommentsCommentId(commentId, body)`, `deleteApiCommentsCommentId`, `getApiCommentsCommentId`, `getApiCommentsPostPostId`, `getApiCommentsRepliesParentId` | `CreateCommentRequest`, `CreateReplyCommentRequest`, `UpdateCommentRequest` | `validations/comments/comments.ts` |
| likes | `postApiLike`, `getApiLikePostId` (check exact name/signature at impl) | `LikeRequest` | `validations/like/like.ts` |
| block | `postApiBlockUserBlock`, `postApiBlockUserUnblock`, `getApiBlockUserBlockedUsers`, `getApiBlockUserIsBlocked` (check names at impl) | `BlockUserRequest` | `validations/block-user/` |
| notifications | `postApiNotifications`, `getApiNotificationsId`, `putApiNotificationsId`, `deleteApiNotificationsId`, `getApiNotificationsUserUserId`, `...Unread`, `postApiNotificationsIdMarkRead`, `postApiNotificationsUserUserIdMarkAllRead`, `deleteApiNotificationsUserUserIdAll`, `getApiNotificationsInbox`, unread-count, preferences | `CreateNotificationDto`, `UpdateNotificationDto`, `NotificationPreferenceDto` | `validations/notifications/` |
| user/auth | `postApiUserRegister`, `postApiUserSignIn`, `getApiUserGetUser`, `getApiUserGetUserUserId`, `getApiUserSearch`, `putApiUserUpdateUser` (check name), `postApiUserChangePassword/ForgetPassword/ResetPassword`, `deleteApiUserDeleteUser` | `CreateUserRequest`, `SignIn`, `UpdateUserDto`, `ChangePasswordRequest`, `ForgetPasswordRequest`, `ResetPasswordRequest` | `validations/user/` |

## Local DTO candidates for deletion (verify zero consumers before each delete)
`create-comment-type`, `create-reply-comment-type`, `update-comment-type`, `like-request-type`, `block-user-type`, `create-user-type`, `sign-in-type`, `auth-response-type` (check spec coverage!), `update-*-type` for user, password payload interfaces in `api.user.ts` (lines 55-68).
Keep (response entities, no spec model): `comment-type`, `comment-user-type`, `user-type`, `notification-type`, `like-type`, `post-types`, `follow-type`, `media-type` (verify), `api-response.ts` (check dup of `api.response.ts`).

## Notes
- `api.auth.ts` uses bespoke try/catch (not `handleRequest`) — normalize to `handleRequest` + SDK.
- `updateComment(id, payload)` legacy signature vs SDK `putApiCommentsCommentId(commentId, body)` — keep facade signature, adapt inside.
- Auth refresh/logout flow lives in `axios.ts` interceptors + `features/auth` — transport stays; only register/sign-in facades migrate.
- `InboxParams` in `api.notifications.ts` is facade-level (not a wire DTO) — keep or map to SDK params per signature.
