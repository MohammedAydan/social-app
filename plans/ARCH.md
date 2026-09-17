# System Architecture

## Overview
React Router v7 SPA + .NET REST API (`https://social-api-v1.runasp.net`). Client-side data via TanStack Query; mutations wrapped in `handleRequest` envelopes (`{ success, message, data }`).

## Architecture Pattern
Monolith frontend (route modules + feature folders) over REST. Feature folders: `app/features/{auth,feed,profile,notifications,...}`; shared kernel: `app/shared/{api,types,utils,components}`; generated SDK: `app/lib/sdk`.

## Core Components
| Component | Responsibility | Location |
|-----------|---------------|----------|
| SDK transport | Single axios instance (base URL, x-api-key, Bearer, 401 refresh) shared by manual layer and Orval mutator | `app/shared/api/axios.ts`, `app/lib/sdk/custom-instance.ts` |
| API facades | One module per domain mapping SDK functions to `ApiResponse` envelopes | `app/shared/api/api.*.ts` |
| Feed state | Feed list + per-post actions (share/delete/like, local list sync) | `app/features/feed/context/` |
| Follow state | Follow/Requested/Unfollow machine, inbound requests | `app/features/profile/components/follow-button.tsx`, `hooks/use-follow-requests.tsx` |
| Pure logic + tests | Framework-free resolvers tested with `node:test` | `*.test.ts` next to source, run via `npm test` |

## Data Flow
Component `useMutation`/`useInfiniteQuery` → `shared/api` facade (Zod-parse → SDK fn → `handleRequest`) → `customInstance` → hardened axios → envelope → cache update/invalidate.

## Boundaries & Invariants
- SDK generated files are not hand-edited (import-path repair only).
- `handleRequest` must accept BOTH `AxiosResponse` (manual layer) and unwrapped envelopes (SDK `customInstance`).
- Preserve the app-owned SDK mutator when refreshing generated output: it delegates to the shared transport and must not create an independent client reading `access_token`. Login persistence uses `ACCESS_TOKEN`; `tests/e2e/login-session.spec.ts` verifies actual Bearer headers and reload restoration.
- Visibility sent as PascalCase (`normalizeVisibility`); like toggle is POST-only.

## Security Model
- Auth: Bearer access token (`ACCESS_TOKEN`), single-flight 401 refresh, sign-in redirect.
- Input: Zod schemas at facade boundary; unknown keys stripped.
