import { test, expect } from '@playwright/test';

test.describe('Competition - Eligibility Guard', () => {
  test('banner muncul dan tombol submit disabled jika dokumen belum disetujui', async ({ page }) => {
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
          }
        },
        version: 0
      }));
    });

    // Mock semua API yang dibutuhkan
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
          }
        })
      });
    });

    await page.route('**/api/teams/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'team-id',
            teamName: 'Test Team',
            teamCode: 'ABC123',
            status: 'APPROVED',
            members: [
              { id: 'm1', role: 'LEADER', user: { id: 'test-user-id', fullName: 'Test Peserta' } }
            ],
            competition: { id: 'comp-id', name: 'Web Development', slug: 'web-development' },
            paymentProof: { status: 'APPROVED' }
          }
        })
      });
    });

    await page.route('**/api/teams/me/eligibility', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isEligible: false,
            requirements: {
              teamApproved: true,
              paymentApproved: true,
              allMembersDocumentsApproved: false,
              members: [
                {
                  userId: 'test-user-id',
                  fullName: 'Test Peserta',
                  role: 'LEADER',
                  twibbonApproved: false,
                  shareStoryApproved: false,
                  ktmApproved: false,
                  instagramFollowApproved: false,
                  allDocumentsApproved: false
                }
              ]
            }
          }
        })
      });
    });

    await page.route('**/api/competitions/web-development', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'comp-id',
            name: 'Web Development',
            slug: 'web-development',
            linkFields: []
          }
        })
      });
    });

    await page.route('**/api/submissions/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: null
        })
      });
    });

    await page.route('**/api/user/documents', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
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

    await page.goto('/peserta/competition/web-development', { waitUntil: 'domcontentloaded' });
    
    // Banner warning harus muncul
    await expect(page.getByText(/belum bisa mengumpulkan karya/i)).toBeVisible({ timeout: 20000 });
    
    // Tombol lengkapi dokumen di profile harus ada
    await expect(page.getByRole('button', { name: /lengkapi dokumen di profile/i })).toBeVisible({ timeout: 10000 });
    
    // Tombol submit all harus disabled
    const submitBtn = page.getByRole('button', { name: /submit all/i });
    await expect(submitBtn).toBeDisabled();
  });
});
