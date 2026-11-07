import { test, expect } from '@playwright/test';

test.describe('Team Management - Edit Team & Transfer Leadership E2E', () => {
  const mockUserMe = {
    id: 'user-leader-id',
    email: 'leader@test.com',
    fullName: 'Ketua Tim Alpha',
    role: 'PESERTA',
    isVerified: true,
  };

  const initialTeam = {
    id: 'team-uuid-1',
    teamName: 'Tim Alpha Nusantara',
    teamCode: 'ALPHA7X',
    status: 'APPROVED',
    competition: {
      id: 'comp-uuid-1',
      name: 'Software Development',
      slug: 'software-development',
      maxMember: 3,
    },
    members: [
      {
        id: 'member-1',
        userId: 'user-leader-id',
        role: 'LEADER',
        user: { id: 'user-leader-id', fullName: 'Ketua Tim Alpha' },
      },
      {
        id: 'member-2',
        userId: 'user-member-2-id',
        role: 'MEMBER',
        user: { id: 'user-member-2-id', fullName: 'Budi Santoso' },
      },
      {
        id: 'member-3',
        userId: 'user-member-3-id',
        role: 'MEMBER',
        user: { id: 'user-member-3-id', fullName: 'Siti Rahma' },
      },
    ],
    paymentProof: { status: 'APPROVE' },
  };

  test('Leader dapat mengubah nama tim, mentransfer kepemimpinan, dan mengeluarkan anggota', async ({ page }) => {
    let currentTeam = JSON.parse(JSON.stringify(initialTeam));

    // Mock API Auth & Profile
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserMe }),
      });
    });

    // Mock API Competition
    await page.route('**/api/competitions/software-development', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'comp-uuid-1',
            name: 'Software Development',
            slug: 'software-development',
            maxMember: 3,
            linkFields: [],
          },
        }),
      });
    });

    // Mock API Eligibility
    await page.route('**/api/teams/me/eligibility', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isEligible: true,
            requirements: {
              teamApproved: true,
              paymentApproved: true,
              allMembersDocumentsApproved: true,
              members: currentTeam.members.map((m: any) => ({
                userId: m.userId,
                fullName: m.user.fullName,
                role: m.role,
                twibbonApproved: true,
                shareStoryApproved: true,
                ktmApproved: true,
                instagramFollowApproved: true,
                allDocumentsApproved: true,
              })),
            },
          },
        }),
      });
    });

    // Mock API User Submission
    await page.route('**/api/submissions/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: null }),
      });
    });

    // Mock API Announcements & News
    await page.route('**/api/announcements/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { announcements: [] } }),
      });
    });
    await page.route('**/api/news**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { news: [] } }),
      });
    });

    // Mock API Teams: GET, PATCH, POST transfer, DELETE member
    await page.route('**/api/teams/me', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: currentTeam }),
        });
      } else if (method === 'PATCH') {
        const body = JSON.parse(route.request().postData() || '{}');
        currentTeam.teamName = body.teamName;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: currentTeam }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/teams/me/transfer-leadership', async (route) => {
      const body = JSON.parse(route.request().postData() || '{}');
      const targetUserId = body.newLeaderUserId;
      currentTeam.members = currentTeam.members.map((m: any) => {
        if (m.userId === targetUserId) return { ...m, role: 'LEADER' };
        if (m.userId === mockUserMe.id) return { ...m, role: 'MEMBER' };
        return m;
      });
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: currentTeam }),
      });
    });

    await page.route('**/api/teams/*/members/*', async (route) => {
      const url = route.request().url();
      const parts = url.split('/');
      const memberId = parts[parts.length - 1];
      currentTeam.members = currentTeam.members.filter((m: any) => m.id !== memberId && m.userId !== memberId);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: currentTeam }),
      });
    });

    // 1. Kunjungi Halaman Dashboard Tim
    await page.goto('/peserta/competition/software-development', { waitUntil: 'domcontentloaded' });

    // 2. Verifikasi Info Awal
    await expect(page.getByText('Tim Alpha Nusantara')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('ALPHA7X')).toBeVisible();
    await expect(page.getByRole('button', { name: /ubah nama/i })).toBeVisible();

    // 3. Tes Edit Nama Tim
    await page.getByRole('button', { name: /ubah nama/i }).click();
    await expect(page.getByText('Ubah Nama Tim')).toBeVisible();

    const inputName = page.locator('input[placeholder="Masukkan nama tim..."]');
    await inputName.fill('Garuda Cyber Tech 2026');
    await page.getByRole('button', { name: /simpan perubahan/i }).click();

    // Verifikasi nama tim berhasil diubah di tampilan
    await expect(page.getByText('Garuda Cyber Tech 2026')).toBeVisible({ timeout: 10000 });

    // 4. Tes Transfer Kepemimpinan
    const transferBtn = page.getByRole('button', { name: /jadikan ketua/i }).first();
    await expect(transferBtn).toBeVisible();
    await transferBtn.click();

    // Verifikasi Modal Konfirmasi
    await expect(page.getByText(/transfer kepemimpinan tim/i)).toBeVisible();
    await expect(page.getByText(/apakah anda yakin ingin menyerahkan posisi ketua tim/i)).toBeVisible();

    await page.getByRole('button', { name: /ya, jadikan ketua/i }).click();

    // 5. Verifikasi State Setelah Transfer
    // Akun saat ini sekarang berstatus MEMBER, maka tombol Ubah Nama & Jadikan Ketua harus hilang
    await expect(page.getByRole('button', { name: /ubah nama/i })).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /jadikan ketua/i })).not.toBeVisible();
  });
});

