# Context
- Root cause: AuthService persists ACCESS_TOKEN; standalone SDK mutator read access_token and omitted x-api-key/refresh behavior.
- Changed before interruption: app/lib/sdk/custom-instance.ts delegates to app/shared/api/axios.ts; 115 unit tests, typecheck and build passed. Temporary probes failed to execute and were removed; they are NOT verification evidence.
- Next: SSR-safe request interceptor; tests/e2e/login-session.spec.ts real login/read-only browser regression. Use supplied credentials only in process env, never source. Disable trace for auth test to avoid retaining tokens/passwords. No live writes other than authentication.
- Existing Playwright uses localhost:3000; API CORS does not allow 127.0.0.1. Reuse project tools; no dependencies added.
