import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against a locally served PROD build + the live API.
 * The server is managed manually (`npm start` on :3000) so its logs stay
 * visible during live runs; `reuseExistingServer` is not used here.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 1_200_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    // NOTE: the API's CORS policy echoes Access-Control-Allow-Origin for
    // `localhost` origins only — 127.0.0.1 gets none (verified 2026-09-17),
    // so the harness must use the localhost hostname.
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], headless: true } },
  ],
});
