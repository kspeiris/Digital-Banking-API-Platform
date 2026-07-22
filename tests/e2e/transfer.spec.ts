import { test, expect } from '@playwright/test';

test.describe('Money Transfer Workflow', () => {
  test('User can transfer money successfully', async ({ page }) => {
    // Authenticate (mocked or full flow)
    await page.goto('/');

    // Assuming we can navigate to transfer page
    await page.click('text=Transfers');
    
    // Fill transfer details
    await page.fill('input[name="beneficiary"]', 'John Doe');
    await page.fill('input[name="accountNumber"]', '1234567890');
    await page.fill('input[name="amount"]', '500');
    await page.click('button:has-text("Transfer")');

    // Verify success toast or page
    await expect(page.locator('text=Transfer completed successfully')).toBeVisible();
  });
});
