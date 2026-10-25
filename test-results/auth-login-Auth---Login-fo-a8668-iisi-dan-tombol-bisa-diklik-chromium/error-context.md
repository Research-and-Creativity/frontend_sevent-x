# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-login.spec.ts >> Auth - Login >> form login bisa diisi dan tombol bisa diklik
- Location: tests\auth-login.spec.ts:15:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /login/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /login/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /login/i })

```

```yaml
- alert
- link "SEVENT X SEVENT X":
  - /url: /
  - img "SEVENT X"
  - text: SEVENT X
- heading "WELCOME BACK!" [level=1]
- paragraph: Input your email and password, let's continue your journey!
- text: Email
- textbox "Email"
- text: Password
- textbox "Password"
- button "Toggle password"
- link "Forgot password? Click here":
  - /url: /forgot-password
- button "Login"
- text: or
- button "Continue with Google":
  - img
  - text: Continue with Google
- paragraph:
  - text: Doesn't have an account?
  - link "Register":
    - /url: /register
- text: ©2026 SEVENT. All Rights Reserved
- link "social":
  - /url: "#"
- link "social":
  - /url: "#"
- link "social":
  - /url: "#"
- region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Auth - Login', () => {
  4  |   test('login salah muncul pesan error', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
  7  |     await page.fill('input[type="email"]', 'salah@example.com');
  8  |     await page.fill('input[type="password"]', 'Salah12345');
  9  |     await page.click('button[type="submit"]');
  10 |     
  11 |     // Tunggu toast atau pesan error muncul
  12 |     await expect(page.locator('[data-sonner-toast], .toast, [role="status"]')).toBeVisible({ timeout: 10000 });
  13 |   });
  14 | 
  15 |   test('form login bisa diisi dan tombol bisa diklik', async ({ page }) => {
  16 |     await page.goto('/login');
  17 |     
> 18 |     await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  19 |     await page.fill('input[type="email"]', 'test@example.com');
  20 |     await page.fill('input[type="password"]', 'Test12345');
  21 |     
  22 |     const submitBtn = page.locator('button[type="submit"]');
  23 |     await expect(submitBtn).toBeEnabled();
  24 |   });
  25 | });
  26 | 
```