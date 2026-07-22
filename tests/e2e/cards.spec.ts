import { test, expect } from '@playwright/test';

test.describe('Card Management Workflow', () => {
  test('User can freeze and unfreeze a card', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to cards
    await page.click('text=Cards');
    
    // Assume a card is displayed, click Freeze
    await page.click('button:has-text("Freeze Card")');
    await expect(page.locator('text=Card frozen successfully')).toBeVisible();

    // Now unfreeze
    await page.click('button:has-text("Unfreeze Card")');
    await expect(page.locator('text=Card unfrozen successfully')).toBeVisible();
  });
});
