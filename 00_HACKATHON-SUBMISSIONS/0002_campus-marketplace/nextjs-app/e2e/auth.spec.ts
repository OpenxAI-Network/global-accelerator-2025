import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const uniqueUser = `user_${Date.now()}@test.com`;
  const password = 'password123';

  test('should allow a user to sign up and then log in', async ({ page }) => {
    // --- Signup ---
    await page.goto('/');

    // Go to signup form
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Join Campus Marketplace' })).toBeVisible();

    // Fill out form
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email Address').fill(uniqueUser);
    await page.getByLabel('School/University').selectOption('Ateneo de Manila University');
    await page.getByLabel('Password').fill(password);
    await page.getByLabel('Confirm Password').fill(password);

    // Submit
    await page.getByRole('button', { name: 'Create Account' }).click();

    // After signup, it should go to the login page, wait for the navigation
    await page.waitForURL('**/auth-page**'); // Or whatever the URL is
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // --- Login ---
    await page.getByLabel('Email Address').fill(uniqueUser);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // --- Assertions ---
    // Should be on the marketplace page, and the header should be visible
    await expect(page.getByRole('heading', { name: 'The Student Marketplace, Reimagined' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'List Item' })).toBeVisible();
  });
});
