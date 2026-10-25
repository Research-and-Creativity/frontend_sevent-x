import { test, expect } from '@playwright/test';

test.describe('Competition - Eligibility Guard', () => {
  test('banner muncul dan tombol submit disabled jika dokumen belum disetujui', async ({ page }) => {
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

    await page.goto('/peserta/competition/web-development');
    
    // Banner warning harus muncul
    await expect(page.getByText(/belum bisa mengumpulkan karya/i)).toBeVisible({ timeout: 10000 });
    
    // Tombol lengkapi dokumen di profile harus ada
    await expect(page.getByRole('button', { name: /lengkapi dokumen di profile/i })).toBeVisible();
    
    // Tombol submit all harus disabled
    const submitBtn = page.getByRole('button', { name: /submit all/i });
    await expect(submitBtn).toBeDisabled();
  });
});
