import { test, expect } from '@playwright/test';

test('shows the initial focused body label', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Saturn')).toBeVisible();
});
