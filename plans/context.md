# Project: social-app
## Purpose
Social web app (posts, follows, likes, comments, notifications, blocking) with a .NET backend at `VITE_API_BASE_URL`. Frontend is React Router v7 + TanStack Query; all API traffic must go through the Orval-generated SDK at `app/lib/sdk`.

## Current Status
- Active feature: (none — platform-verification closed)
- Overall health: green
- Last updated: 2026-09-17

## Critical Constraints
- SDK-only: network via `app/lib/sdk/endpoints`, types via `app/lib/sdk/models`, validation via `app/lib/sdk/validations`. No manual `fetch`/bare `axios`, no duplicate DTOs.
- Generated SDK files are read-only except the import-path repair class (`../../custom-instance`); Orval toolchain is not in this repo.
- Never invent secrets/env values. No destructive ops without human confirmation.

## Active Features
- posts-sdk-migration: closed 2026-09-16 (all gates green)
- full-sdk-migration: closed 2026-09-16 (all gates green)
- platform-verification: closed 2026-09-17 (92/92 unit, E2E 1 passed live)

## Known Issues / Tech Debt
- Generated SDK endpoint fns declare `customInstance<void>` (envelopes flow as `any`) — fix at Orval-config level when available.
- Generated SDK hook wrappers are semantically inverted (POSTs as `use*Query`, GETs as `use*Mutation`); components use raw SDK functions inside their own hooks.
- `media-scroll-area-new.tsx` is unused dead code. No `/404` route.
- Backend defects on record (see platform-verification/review.md): swapped flags, write-lag, per-target read cache, accept-side staleness, duplicate→500, aggressive 429s.
