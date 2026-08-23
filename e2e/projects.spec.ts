import { expect, test } from '@playwright/test';

// End-to-end journey against the real browser worker.
// This is the only proof that the MSW worker starts and serves data in Chrome.
test('a user follows a Project row to its detail screen and returns to the list', async ({
  page,
}) => {
  await page.goto('/projects');
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

  await page.getByRole('link', { name: 'Project 1' }).click();
  await expect(page).toHaveURL('/projects/project-1');
  const projectHeading = page.getByRole('heading', { name: 'Project 1' });
  await expect(projectHeading).toBeVisible();
  await expect(projectHeading).toBeFocused();

  await page.getByRole('link', { name: 'Back to projects' }).click();
  await expect(page).toHaveURL('/projects');
  const projectsHeading = page.getByRole('heading', { name: 'Projects' });
  await expect(projectsHeading).toBeVisible();
  await expect(projectsHeading).toBeFocused();
});
