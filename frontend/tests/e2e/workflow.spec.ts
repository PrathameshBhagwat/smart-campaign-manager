import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('E2E Workflow', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test('Complete User Journey', async ({ page }) => {
    // 1. Authentication (Signup)
    await page.goto('/signup');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button:has-text("Sign Up")');

    // Wait for redirect to landing page and click Dashboard
    await expect(page).toHaveURL(/\/$/);
    await page.locator('button:has-text("Dashboard")').first().click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 2. Settings Configuration
    await page.goto('/settings');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('h1')).toContainText('Settings');

    // 3. Campaign Creation
    await page.goto('/campaigns');
    await page.click('button:has-text("Create Campaign")');
    await page.fill('input[name="name"]', 'E2E Campaign');
    await page.fill('input[name="city"]', 'New York');
    await page.fill('input[name="course_name"]', 'E2E Course');
    
    // Select Business Type from Shadcn Select
    // Assuming the first combobox is business type
    await page.locator('button[role="combobox"]').first().click();
    await page.locator('div[role="option"]:has-text("Education")').click();

    await page.click('button[type="submit"]:has-text("Create")');
    
    // Wait for the modal to close and the new campaign to appear in the list (API might be slow)
    await expect(page.locator('h3:has-text("E2E Campaign")').first()).toBeVisible({ timeout: 15000 });

    // Click on the campaign card's View button to navigate to details
    await page.locator('.bg-card').filter({ hasText: 'E2E Campaign' }).getByRole('button', { name: 'View' }).click();

    // Check if we navigated to campaign details
    await expect(page).toHaveURL(/.*\/campaigns\/.+/);
    await expect(page.locator('h1').first()).toContainText('E2E Campaign', { timeout: 15000 });

    // 4. Contact Management (Upload CSV)
    // Create a tiny CSV on the fly for upload
    const fs = require('fs');
    const testCsvPath = path.join(__dirname, 'test_contacts.csv');
    fs.writeFileSync(testCsvPath, 'name,email,phone,company,job_title,city\nJohn Doe,john@example.com,1234567890,TestCorp,Tester,New York');

    // Upload the file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Select File")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testCsvPath);

    // Wait for contact to be in the table
    await expect(page.locator('text=John Doe').first()).toBeVisible({ timeout: 15000 });

    // 5. AI Generation
    // Click View Messages button (MessageSquare icon)
    await page.locator('button[title="View Messages"]').first().click();
    
    // Wait for the sheet to open
    await expect(page.locator('text=Messages for John Doe').first()).toBeVisible();

    // Click Generate AI Message trigger
    await page.click('button:has-text("Generate AI Message")');
    // Click the LinkedIn option from the dropdown menu
    await page.click('div[role="menuitem"]:has-text("LinkedIn Message")');

    // Wait for generation to complete (message card appears)
    await expect(page.locator('.bg-card').filter({ hasText: 'Quality:' }).first()).toBeVisible({ timeout: 30000 });
  });
});
