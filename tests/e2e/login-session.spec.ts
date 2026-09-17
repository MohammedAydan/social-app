import { test, expect, type Page, type Response } from '@playwright/test';

// Auth responses contain credentials: do not retain traces or storage-state files.
test.use({ trace: 'off', screenshot: 'off' });
test.setTimeout(90_000);

async function verifyAuthenticatedResponse(page: Page, response: Response): Promise<void> {
  expect(response.status(), `HTTP status for ${new URL(response.url()).pathname}`).toBe(200);
  const envelope: unknown = await response.json();
  expect(typeof envelope === 'object' && envelope !== null &&
    'success' in envelope && envelope.success === true).toBe(true);
  const matchesStoredToken = await page.evaluate((authorization) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    return Boolean(token) && authorization === `Bearer ${token}`;
  }, response.request().headers()['authorization'] ?? '');
  // Assert a boolean so a failure cannot print the token in the report.
  expect(matchesStoredToken, 'request uses the persisted ACCESS_TOKEN').toBe(true);
}

test('login loads the feed and survives a full reload', async ({ page }) => {
  const email = process.env.E2E_USER_A_EMAIL;
  const password = process.env.E2E_USER_A_PASSWORD;
  if (!email || !password) throw new Error('Set E2E_USER_A_EMAIL and E2E_USER_A_PASSWORD.');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.name));
  const feedResponse = (response: Response) =>
    new URL(response.url()).pathname.toLowerCase() === '/api/posts/feed' &&
    response.request().method() === 'GET';

  await page.goto('/sign-in');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(email);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  const [feed] = await Promise.all([
    page.waitForResponse(feedResponse, { timeout: 30_000 }),
    page.getByRole('button', { name: 'Sign in button' }).click(),
  ]);
  await verifyAuthenticatedResponse(page, feed);
  await expect(page).toHaveURL(/\/$/);
  console.log('[session] login → feed HTTP 200, persisted Bearer verified');

  const [profile, reloadedFeed] = await Promise.all([
    page.waitForResponse((response) =>
      new URL(response.url()).pathname.toLowerCase() === '/api/user/get-user', { timeout: 30_000 }),
    page.waitForResponse(feedResponse, { timeout: 30_000 }),
    page.reload(),
  ]);
  await verifyAuthenticatedResponse(page, profile);
  await verifyAuthenticatedResponse(page, reloadedFeed);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Request failed with status code 401', { exact: false })).toHaveCount(0);
  expect(errors).toEqual([]);
  console.log('[session] reload → profile and feed HTTP 200; session retained');
});
