# Login session fix — verification

## Root cause and fix
AuthService writes ACCESS_TOKEN, but the replaced SDK custom-instance created another axios client reading access_token. Protected SDK calls therefore lacked Bearer authentication; reloading called getCurrentUser through the same broken client and checkAuth cleared tokens on failure.

Restored SDK delegation to shared/api/axios.ts (existing ADR-002), which owns base URL, API key, ACCESS_TOKEN injection and refresh handling. Kept AXIOS_INSTANCE as a compatibility alias, envelope unwrapping, and AbortSignal forwarding. Added an SSR guard before accessing localStorage in the shared request interceptor. No auth-layout changes.

## Verified against real output
- npm test: 115 passed, 0 failed, 42 suites.
- npm run typecheck: exit 0.
- npm run build: exit 0, client and SSR; existing sourcemap/size/unused-import warnings remain.
- Playwright tests/e2e/login-session.spec.ts: 1 passed, 4.7 seconds total, live API via localhost production build. Login → feed 200 with persisted Bearer token; reload → current-user 200 and feed 200 with persisted Bearer token; stayed on home; no page errors.
- Traces and screenshots disabled for this auth-only test to avoid retaining credential-bearing data; no visual UI changes made.
- No lint/formatter script configured in package.json. No dependencies added.

## Limits
The test covers the reported successful-login/reload path, not every expiry/refresh/network-failure scenario. Existing checkAuth clears tokens on all restoration errors, including transient failures; that broader policy is unchanged. Earlier temporary probes failed and were removed; they are not evidence.

## Run
Serve the production build with npm start; supply E2E_USER_A_EMAIL and E2E_USER_A_PASSWORD in process env, then run npx playwright test tests/e2e/login-session.spec.ts. Do not run the separate two-account mutation suite for this regression.
