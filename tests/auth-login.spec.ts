import { test, expect } from '@playwright/test';

test.describe('Auth - Login', () => {
  test('login salah muncul pesan error', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'salah@example.com');
    await page.fill('input[type="password"]', 'Salah12345');
    await page.click('button[type="submit"]');
    
    // Tunggu toast atau pesan error muncul
    await expect(page.locator('[data-sonner-toast], .toast, [role="status"]')).toBeVisible({ timeout: 10000 });
  });

  test('form login bisa diisi dan tombol bisa diklik', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test12345');
    
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });
});
