import { test, expect } from '@playwright/test';

test.describe('Notifications Workflow', () => {
  test('User can view and delete a notification', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to notification center
    await page.click('button[aria-label="Notifications"]');
    
    // Check if notification center opens
    await expect(page.locator('text=Notification Center')).toBeVisible();

    // Mark as read or delete
    const deleteButton = page.locator('button[aria-label="Delete Notification"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await expect(page.locator('text=Notification deleted')).toBeVisible();
    }
  });
});
