# Tech Stack

## Runtime
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Language | TypeScript | 5.8.x | strict, `~/*` → `./app/*` |
| Runtime | Node / Vite | Node 25, Vite 6.3 | |
| Package Manager | npm | 11.x | `package-lock.json` committed |

## Frontend
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React Router | 7.5.3 | Framework (Remix-style) mode |
| UI | React 19, Tailwind 4, Radix, shadcn-style `components/` | — | |
| State/fetch | TanStack Query | 5.76.x | `useMutation`/`useInfiniteQuery` in components |
| HTTP | axios | 1.9.x | single shared instance |
| SDK gen | Orval (generated output only) | — | `app/lib/sdk/{endpoints,models,validations}` |
| Validation | Zod | 3.24.x | generated schemas + `parse` at facade |
| Forms | React Hook Form + zodResolver | 7.56.x | |
| Tests | `node:test` + repo `tsc` | — | `npm test` → `tsconfig.test.json` → `.test-output/` |
| E2E | Playwright + Chromium | `^1.x` dev | `tests/e2e/`, `playwright.config.ts`, headless vs prod build |

## Backend (external)
| Layer | Technology | Notes |
|-------|-----------|-------|
| API | .NET Social API v1 | `VITE_API_BASE_URL=https://social-api-v1.runasp.net`, `VITE_API_KEY` in `.env` |
| Errors | GlobalExceptionMiddleware maps some 404s to 500 | envelope classifiers in `follow-state.ts` |

## Key Conventions
- Facades return `ApiResponse<T>` (`success/message/data/errors`); `handleRequest` returns envelopes, never throws (except no-response network failure).
- SDK payload keys are PascalCase for paging (`Page`/`Limit`).
- Co-located tests: `foo.ts` → `foo.test.ts`.
