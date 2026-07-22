import { test, expect } from '@playwright/test';

test.describe('Loan Application Workflow', () => {
  test('User can submit a loan application', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to loans
    await page.click('text=Loans');
    await page.click('text=Apply for Loan');
    
    // Fill application form
    await page.fill('input[name="amount"]', '50000');
    await page.fill('input[name="durationMonths"]', '24');
    await page.selectOption('select[name="loanType"]', 'PERSONAL');
    await page.click('button:has-text("Submit Application")');

    // Verify submission
    await expect(page.locator('text=Application submitted successfully')).toBeVisible();
    await expect(page.locator('text=Status: Submitted')).toBeVisible();
  });
});
