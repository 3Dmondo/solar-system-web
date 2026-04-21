import { test, expect } from '@playwright/test';

test('supports overview hud discovery, help, and focus recovery', async ({ page }) => {
  test.setTimeout(75_000);
  await page.goto('/');

  const helpButton = page.getByRole('button', { name: 'Show interaction help' });
  const hudTitle = page.locator('.experience-hud__title');
  const jumpButton = page.getByRole('button', { name: 'Open jump to bodies' });

  await expect(hudTitle).toHaveText('Solar System');
  await expect(jumpButton).toBeVisible();
  await expect(page.getByText(/interactive solar system overview/i)).toBeVisible();
  await expect(helpButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus/i)).not.toBeVisible();

  await helpButton.click();

  await expect(helpButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/Desktop: drag to orbit, wheel to zoom, double click a body, or use Jump to focus/i)).toBeVisible();
  await expect(page.getByText(/Mobile: drag to orbit, pinch to zoom, double tap a body, or use Jump to focus/i)).toBeVisible();
  await expect(page.getByText(/Use Overview while focused/i)).toBeVisible();

  await helpButton.click();
  await expect(helpButton).toHaveAttribute('aria-expanded', 'false');

  await jumpButton.click();
  await expect(page.getByRole('dialog', { name: 'Jump to bodies' })).toBeVisible();
  await page.getByRole('button', { name: 'Jump to Earth' }).click();
  await expect(hudTitle).toHaveText('Earth');
  await expect(page.getByRole('button', { name: 'Return to solar system overview' })).toBeVisible();

  await page.getByRole('button', { name: 'Return to solar system overview' }).click();
  await expect(hudTitle).toHaveText('Solar System');
  await expect(jumpButton).toBeVisible();
});
