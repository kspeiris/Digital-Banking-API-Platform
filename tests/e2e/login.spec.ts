import { test, expect } from '@playwright/test';

test.describe('Authentication Workflow', () => {
  test('User can log in successfully', async ({ page }) => {
    // Navigate to the app (assuming login is the entry point or redirect)
    await page.goto('/');

    // Check if redirect to login happens or if it's already on login
    // Depending on routing, might need to wait for redirect
    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', 'john@example.com');
      await page.fill('input[type="password"]', 'Password123');
      await page.click('button[type="submit"]');

      // Ensure that we navigate away from login after success
      await expect(page).not.toHaveURL(/.*login/);
      // Wait for a dashboard element to be visible
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }
  });

  test('Shows error on invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Expect an error toast or message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
