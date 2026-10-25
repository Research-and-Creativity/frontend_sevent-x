import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Profile - Upload Dokumen', () => {
  test('upload dokumen dengan mock API - tidak hang', async ({ page }) => {
    // Set auth in localStorage
    await page.addInitScript(() => {
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
          }
        },
        version: 0
      }));
    });

    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'test-user-id',
            email: 'peserta@test.com',
            fullName: 'Test Peserta',
            role: 'PESERTA',
            isVerified: true,
          }
        })
      });
    });

    await page.route('**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
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
          }
        })
      });
    });

    await page.route('**/api/user/documents', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: []
          })
        });
      } else if (route.request().method() === 'POST') {
        // Simulate successful upload
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Dokumen berhasil disimpan',
            data: {
              id: 'doc-id',
              type: 'KTM',
              status: 'REVIEW'
            }
          })
        });
      }
    });

    await page.route('**/api/teams/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: null
        })
      });
    });

    await page.route('**/api/announcements/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { announcements: [] }
        })
      });
    });

    await page.route('**/api/news**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { news: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }
        })
      });
    });

    await page.goto('/peserta/profile', { waitUntil: 'domcontentloaded' });
    
    // Cek halaman profile muncul
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible({ timeout: 15000 });
    
    // Coba pilih file untuk dokumen KTM
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    
    // Buat file dummy untuk testing
    await fileInput.setInputFiles({
      name: 'ktm.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });
    
    // Pastikan file terpilih (muncul nama file)
    await expect(page.getByText('ktm.jpg')).toBeVisible({ timeout: 5000 });
    
    // Tombol Kirim Semua harus enabled
    const submitAllBtn = page.getByRole('button', { name: /kirim semua/i });
    await expect(submitAllBtn).toBeEnabled();
  });
});
