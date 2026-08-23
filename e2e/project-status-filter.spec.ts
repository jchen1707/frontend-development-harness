import { expect, test } from '@playwright/test';

test('a user can filter Projects by Status and reload the combined filters', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByRole('link', { name: 'Project 1' })).toBeVisible();

  await page.keyboard.press('Tab');
  const searchBox = page.getByRole('searchbox', { name: 'Search projects' });
  await expect(searchBox).toBeFocused();

  await page.keyboard.press('Tab');
  const statusControl = page.getByRole('combobox', { name: 'Status' });
  await expect(statusControl).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Project 1' })).toBeFocused();

  await statusControl.selectOption('archived');
  await searchBox.fill('Project 3');
  await expect(page).toHaveURL(/\/projects\?status=archived&q=Project\+3$/);
  await expect(page.getByRole('link', { name: 'Project 3' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('1 project found.');

  await page.reload();
  await expect(searchBox).toHaveValue('Project 3');
  await expect(statusControl).toHaveValue('archived');
  await expect(page.getByRole('link', { name: 'Project 3' })).toBeVisible();
});
