import { expect, test } from '@playwright/test';

// E2E smoke test: the dev server boots, routing works, and the app renders.
// (Frontend analog of the python-harness testcontainers integration test.)
test('the root path renders the harness heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'frontend-harness' })).toBeVisible();
});
