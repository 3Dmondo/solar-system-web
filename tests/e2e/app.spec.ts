import { test, expect } from '@playwright/test';

test('shows the overview hud and interaction help on startup', async ({ page }) => {
  await page.goto('/');

  const helpButton = page.getByRole('button', { name: 'Show interaction help' });

  await expect(page.getByText('Solar System', { exact: true })).toBeVisible();
  await expect(page.getByText(/focus it from the overview/i)).toBeVisible();
  await expect(helpButton).toHaveAttribute('aria-expanded', 'false');

  await helpButton.click();

  await expect(helpButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/Desktop: drag to orbit/i)).toBeVisible();
  await expect(page.getByText(/Mobile: drag to orbit/i)).toBeVisible();
  await expect(page.getByText(/Zoom farther out/i)).toBeVisible();
});
