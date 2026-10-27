import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test as setup } from '@playwright/test';

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'peserta.json');

setup('authenticate as participant', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => {
    localStorage.setItem('seventx-auth-user', JSON.stringify({
      state: {
        user: {
          id: 'test-user-id',
          email: 'peserta@test.com',
          fullName: 'Test Peserta',
          role: 'PESERTA',
          isVerified: true,
          institution: 'Test Univ',
          phone: '+628123456789',
          birthDate: '2000-01-01',
          domicile: 'Jakarta',
          discordId: 'test#1234',
        },
      },
      version: 0,
    }));
  });

  await expect.poll(() => page.evaluate(() => localStorage.getItem('seventx-auth-user'))).toContain('"role":"PESERTA"');
  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
