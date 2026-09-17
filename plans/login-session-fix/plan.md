# Login session fix

## Goal
Restore authenticated SDK requests immediately after sign-in and across page reloads.

## Evidence and approach
Login stores ACCESS_TOKEN/REFRESH_TOKEN. The SDK mutator was replaced with a standalone axios client reading access_token, omitting the API key and shared refresh interceptor. Restore delegation to shared/api/axios.ts (ADR-002), keep envelope unwrapping and cancellation intact, and guard browser storage access during SSR.

## Acceptance criteria
- One shared HTTP client for SDK and legacy storage.
- A real browser login sends the persisted access token on the feed request.
- Reload restores the current user and feed without clearing tokens or redirecting to sign-in.
- Focused Playwright regression, existing unit tests, typecheck and client/SSR build pass.

## Scope
Transport repair and focused session regression only. No account creation, post mutations, auth redesign, or generated endpoint edits.

## Complexity
S
