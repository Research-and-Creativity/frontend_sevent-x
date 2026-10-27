import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Auth - Login', () => {
  test('login salah muncul pesan error', async ({ page }) => {
    await page.route('**/api/**', (route) =>
      route.fulfill({ json: { data: [] } }),
    );
    await page.route('**/api/auth/refresh-token', (route) =>
      route.fulfill({ json: { data: {} } }),
    );
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        status: 401,
        json: { message: 'Email atau password salah.' },
      }),
    );

    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'salah@example.com');
    await page.fill('input[type="password"]', 'Salah12345');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[data-sonner-toast]')).toContainText(
      'Email atau password salah.',
    );
  });

  test('login berhasil menyimpan sesi dan mengarahkan peserta', async ({ page }) => {
    const user = {
      id: 'login-test-user',
      email: 'peserta@example.com',
      fullName: 'Test Peserta',
      role: 'PESERTA',
      institution: 'Test University',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    await page.route('**/api/**', (route) =>
      route.fulfill({ json: { data: [] } }),
    );
    await page.route('**/api/auth/refresh-token', (route) =>
      route.fulfill({ json: { data: {} } }),
    );
    await page.route('**/api/auth/login', (route) =>
      route.fulfill({
        json: {
          data: {
            user,
            accessToken: 'test-access-token',
          },
        },
      }),
    );
    await page.route('**/api/user/me', (route) =>
      route.fulfill({ json: { data: user } }),
    );
    await page.goto('/login');
    await page.fill('input[type="email"]', 'peserta@example.com');
    await page.fill('input[type="password"]', 'Test12345');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/peserta\/dashboard$/);
  });

  test('email kosong menampilkan pesan validasi', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="password"]', 'Test12345');
    await page.click('button[type="submit"]');

    await expect(page.locator('#email-error')).toHaveText('Email is required');
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
