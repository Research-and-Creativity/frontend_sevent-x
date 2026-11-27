import { test, expect } from '@playwright/test';

test.describe('Juri Scoring & Peserta Evaluation Dashboard E2E', () => {
  const mockUserPeserta = {
    id: 'user-peserta-id',
    email: 'peserta@test.com',
    fullName: 'Ahmad Peserta',
    role: 'PESERTA',
    isVerified: true,
    institution: 'Universitas Indonesia',
    birthDate: '2001-05-10',
    domicile: 'Jakarta',
    phone: '08123456789',
    discordId: 'ahmad_dev#1234',
  };

  const mockUserJuri = {
    id: 'user-juri-id',
    email: 'juri.softdev.1@seventx.zetech',
    fullName: 'Pak Amru',
    role: 'JURI',
    isVerified: true,
    institution: 'Panitia SEVENT X',
  };

  test.beforeEach(async ({ page }) => {
    // Cegah redirect ke /login bila ada background refresh-token request
    await page.route('**/api/auth/refresh-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { accessToken: 'mock-valid-token' } }),
      });
    });
  });

  test('1. Peserta Profile: Single document upload & format validation (.heic/video rejected)', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserPeserta);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserPeserta }),
      });
    });

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserPeserta }),
      });
    });

    await page.route('**/api/teams/me**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: null }),
      });
    });

    let uploadedDocsCount = 0;
    await page.route('**/api/user/documents', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
      } else if (route.request().method() === 'POST') {
        uploadedDocsCount += 1;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'doc-1', type: 'SHARE_STORY', status: 'REVIEW' },
          }),
        });
      }
    });

    await page.goto('/peserta/profile');

    // Cek bahwa helper text menyebutkan dukungan format dan upload satu per satu
    await expect(page.getByText(/JPG, PNG, WEBP, PDF/i)).toBeVisible();
    await expect(page.getByText(/Anda dapat mengunggah dokumen satu per satu atau sekaligus/i)).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();

    // 1. Simulasikan pemilihan file HEIC -> harus ditolak
    await page.getByLabel('Upload Post Story').click();
    await fileInput.setInputFiles({
      name: 'screenshot-story.heic',
      mimeType: 'image/heic',
      buffer: Buffer.from('fake-heic-content'),
    });

    // Cek toast penolakan HEIC
    await expect(page.getByText(/Format .heic belum didukung/i)).toBeVisible();

    // 2. Sekarang pilih file PNG valid untuk Post Story
    await page.getByLabel('Upload Post Story').click();
    await fileInput.setInputFiles({
      name: 'bukti-share-story.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-png-content'),
    });

    // Harus muncul nama file dan tombol aksi upload
    await expect(page.getByText('bukti-share-story.png')).toBeVisible();
    await expect(page.getByText('Kirim Semua Dokumen (1)')).toBeVisible();

    // 3. Klik tombol Upload untuk dokumen tersebut (mengunggah hanya 1 dokumen tanpa paksa 4 dokumen)
    await page.getByText('Kirim Semua Dokumen (1)').click();
    await expect(page.getByText(/1 dokumen berhasil dikirim/i)).toBeVisible();
    expect(uploadedDocsCount).toBe(1);
  });

  test('2. Juri Scoring Form: Includes per-criteria note inputs and sends notes in payload', async ({ page }) => {
    // Inject auth state role JURI agar tidak di-redirect middleware
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/judge/submissions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    const mockCriteria = [
      { id: 'crit-1', name: 'Kesesuaian Tema', maxScore: 100, weight: 50, order: 1, round: 'PENYISIHAN' },
      { id: 'crit-2', name: 'Implementasi Kode', maxScore: 100, weight: 50, order: 2, round: 'PENYISIHAN' },
    ];

    await page.route('**/api/judge/submissions/sub-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            submission: {
              id: 'sub-123',
              projectTitle: 'E-Commerce Maritim',
              description: 'Platform logistik ekspor impor',
              team: { teamName: 'Tim Pelaut AI', competition: { name: 'Software Development', slug: 'software-development' } },
              submittedAt: '2026-11-09T08:00:00Z',
              scores: [],
            },
            criteriaList: mockCriteria,
            existingScores: [],
            evaluation: null,
            round: 'PENYISIHAN',
            rubric: { totalWeight: 100, isValid: true, criteriaCount: 2 },
          },
        }),
      });
    });

    let submittedPayload: {
      scores: Array<{ criteriaId: string; score: number; note?: string }>;
      feedback: string;
      isDraft: boolean;
    } | null = null;
    await page.route('**/api/judge/submissions/sub-123/score', async (route) => {
      submittedPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.goto('/juri/already-submitted/sub-123');

    // Cek header babak dan petunjuk kolom wajib bertanda bintang (*)
    await expect(page.getByText(/Judgement/i).first()).toBeVisible();
    await expect(page.getByText(/Kolom bertanda/i)).toBeVisible();
    await expect(page.locator('span[title="Wajib diisi"]').first()).toBeVisible();
    await expect(page.getByText('Notes for the Team (Opsional)')).toBeVisible();

    // Cek input skor dan input catatan per kriteria
    const noteInput1 = page.getByPlaceholder('Catatan untuk kriteria "Kesesuaian Tema" (opsional)');
    const noteInput2 = page.getByPlaceholder('Catatan untuk kriteria "Implementasi Kode" (opsional)');
    await expect(noteInput1).toBeVisible();
    await expect(noteInput2).toBeVisible();

    // Isi skor
    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.nth(0).fill('85');
    await noteInput1.fill('Kesesuaian tema sangat relevan dengan industri');

    await scoreInputs.nth(1).fill('90');
    await noteInput2.fill('Clean architecture dan modularitas terstruktur rapi');

    // Isi general feedback
    await page.getByPlaceholder('Notes').fill('Performa tim sangat memuaskan, siap lanjut ke tahap berikutnya.');

    // Submit nilai
    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    // Konfirmasi modal
    const confirmBtn = page.getByRole('button', { name: 'Ya, Submit' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Verifikasi payload memuat field note per kriteria
    await expect.poll(() => submittedPayload).not.toBeNull();
    const payload = submittedPayload!;
    expect(payload.scores).toHaveLength(2);
    expect(payload.scores[0].note).toBe('Kesesuaian tema sangat relevan dengan industri');
    expect(payload.scores[1].note).toBe('Clean architecture dan modularitas terstruktur rapi');
    expect(payload.feedback).toContain('Performa tim sangat memuaskan');
  });

  test('3. Peserta Dashboard: Displays evaluation table with 3 judges, individual notes, and average score', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserPeserta);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserPeserta }),
      });
    });

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserPeserta }),
      });
    });

    await page.route('**/api/teams/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'team-1',
            teamName: 'Tim Alpha Nusantara',
            teamCode: 'ALPHA01',
            status: 'APPROVE',
            competition: { name: 'Software Development', slug: 'software-development', maxMember: 3 },
            members: [{ role: 'LEADER', user: { fullName: 'Ahmad Peserta' } }],
          },
        }),
      });
    });

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
              members: [{ userId: 'user-peserta-id', fullName: 'Ahmad Peserta', role: 'LEADER', allDocumentsApproved: true }],
            },
          },
        }),
      });
    });

    await page.route('**/api/submissions/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'sub-1',
            projectTitle: 'AI Platform',
            status: 'SUBMITTED',
            submittedAt: '2026-11-09T08:00:00Z',
          },
        }),
      });
    });

    await page.route('**/api/user/documents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route('**/api/timelines/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route('**/api/news?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { news: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 1 } } }),
      });
    });

    // Mock response getMyAnnouncement lengkap dengan evaluation 3 juri (endpoint /api/announcements/me)
    await page.route('**/api/announcements/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            team: { id: 'team-1', teamName: 'Tim Alpha Nusantara', teamCode: 'ALPHA01' },
            announcements: [
              {
                id: 'ann-1',
                competitionId: 'comp-softdev',
                teamId: 'team-1',
                isFinalist: true,
                rank: null,
                round: 'PENYISIHAN',
                publishedAt: '2026-11-09T10:00:00Z',
                evaluation: {
                  finalScore: 90.0,
                  isFullyScored: true,
                  submittedAt: '2026-11-08T14:10:00.000Z',
                  tieBreaker: {
                    status: 'WON',
                    rank: 5,
                    comparedRank: 6,
                    score: 90.0,
                    submittedAt: '2026-11-08T14:10:00.000Z',
                    comparedSubmittedAt: '2026-11-08T15:30:00.000Z',
                  },
                  judgeBreakdown: [
                    {
                      judgeId: 'juri-1',
                      judgeName: 'Pak Amru',
                      criteriaCount: 2,
                      averageScore: 88.0,
                      feedback: 'Pak Amru: Desain arsitektur sangat solid dan clean.',
                      criteriaScores: [
                        { criteriaId: 'c1', criteriaName: 'Kesesuaian Tema', score: 90, maxScore: 100, weight: 50, note: 'Relevan sekali' },
                        { criteriaId: 'c2', criteriaName: 'Implementasi Kode', score: 86, maxScore: 100, weight: 50, note: 'Struktur kode rapi' },
                      ],
                    },
                    {
                      judgeId: 'juri-2',
                      judgeName: 'Pak Yudha',
                      criteriaCount: 2,
                      averageScore: 90.0,
                      feedback: 'Pak Yudha: Solusi inovatif dan tepat sasaran.',
                      criteriaScores: [
                        { criteriaId: 'c1', criteriaName: 'Kesesuaian Tema', score: 90, maxScore: 100, weight: 50, note: 'Solusi tepat' },
                        { criteriaId: 'c2', criteriaName: 'Implementasi Kode', score: 90, maxScore: 100, weight: 50, note: 'Testing lengkap' },
                      ],
                    },
                    {
                      judgeId: 'juri-3',
                      judgeName: 'Pak Faisal',
                      criteriaCount: 2,
                      averageScore: 92.0,
                      feedback: 'Pak Faisal: Sangat layak diadopsi di skala industri.',
                      criteriaScores: [
                        { criteriaId: 'c1', criteriaName: 'Kesesuaian Tema', score: 92, maxScore: 100, weight: 50, note: 'Diferensiasi kuat' },
                        { criteriaId: 'c2', criteriaName: 'Implementasi Kode', score: 92, maxScore: 100, weight: 50, note: 'Performa cepat' },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        }),
      });
    });

    await page.goto('/peserta/dashboard');

    // 1. Verifikasi Badge lolos
    await expect(page.getByText('LOLOS FINALIS').first()).toBeVisible();

    // 2. Verifikasi Banner Hasil Penilaian Tim & Rata-rata Nilai Akhir
    await expect(page.getByText('Hasil Penilaian Tim')).toBeVisible();
    await expect(page.getByText(/90\.00/).first()).toBeVisible();
    await expect(page.getByText(/Nilai akhir dihitung dari rata-rata penilaian 3 orang juri/i)).toBeVisible();

    // 3. Verifikasi Tabel memuat nama ketiga juri
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Pak Amru/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Pak Yudha/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Pak Faisal/i })).toBeVisible();

    // 4. Verifikasi Catatan & Masukan Tiap Juri
    await expect(page.getByText('Catatan & Masukan Tiap Juri')).toBeVisible();
    await expect(page.getByText('Pak Amru: Desain arsitektur sangat solid dan clean.')).toBeVisible();
    await expect(page.getByText('Pak Yudha: Solusi inovatif dan tepat sasaran.')).toBeVisible();
    await expect(page.getByText('Pak Faisal: Sangat layak diadopsi di skala industri.')).toBeVisible();

    // 5. Verifikasi Catatan per Kriteria muncul (tampil baik di sel tabel maupun di kartu detail)
    await expect(page.getByText(/Relevan sekali/i).first()).toBeVisible();
    await expect(page.getByText(/Testing lengkap/i).first()).toBeVisible();
    await expect(page.getByText(/Diferensiasi kuat/i).first()).toBeVisible();

    // 6. Verifikasi Keterangan Nilai Seri (WON) tampil pada dashboard finalis
    await expect(page.getByText(/Keterangan Nilai Seri \(Peringkat #5\)/i)).toBeVisible();
    await expect(page.getByText(/21\.10 WIB/).first()).toBeVisible();
    await expect(page.getByText(/22\.30 WIB/).first()).toBeVisible();
  });

  test('5. Juri Already-Submitted: Status badge and table columns do not wrap awkwardly', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/judge/submissions', async (route) => {
      // Buat 12 dummy item untuk menguji paginasi 10 item per halaman
      const items = Array.from({ length: 12 }, (_, i) => ({
        id: `sub-${i + 1}`,
        teamId: `team-${i + 1}`,
        projectTitle: i === 0 ? 'CloudForge — Multi-Cloud CI/CD Pipeline Orchestrator with GitOps' : `Karya Inovatif ${i + 1}`,
        description: 'Multi-cloud pipeline orchestrator',
        submittedAt: '2026-11-09T14:30:00Z',
        updatedAt: '2026-11-09T14:30:00Z',
        team: {
          id: `team-${i + 1}`,
          teamName: i === 0 ? 'DevForge' : `Team ${i + 1}`,
          teamCode: `SDC${String(i + 1).padStart(3, '0')}`,
          competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
          members: [
            {
              role: 'LEADER',
              user: { id: `u${i + 1}`, fullName: i === 0 ? 'Rizky Fauzan' : `Leader ${i + 1}`, email: `leader${i + 1}@test.com`, institution: 'ITB' },
            },
          ],
        },
        scores: [],
        evaluationStatus: { isEvaluated: false, isLocked: false, totalScore: 0 },
      }));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: items,
        }),
      });
    });

    await page.goto('/juri/already-submitted');

    // 1. Verifikasi judul halaman dan baris tabel
    await expect(page.getByText('List of Participant')).toBeVisible();
    await expect(page.getByText('DevForge')).toBeVisible();
    await expect(page.getByText('CloudForge — Multi-Cloud CI/CD Pipeline Orchestrator with GitOps')).toBeVisible();
    await expect(page.getByText('Rizky Fauzan')).toBeVisible();

    // 2. Verifikasi Status Badge "In Review" ada dan memiliki class whitespace-nowrap & inline-flex (dan tanpa shadow slop)
    const statusBadge = page.locator('span:text("In Review")').first();
    await expect(statusBadge).toBeVisible();
    const className = await statusBadge.getAttribute('class');
    expect(className).toContain('whitespace-nowrap');
    expect(className).toContain('inline-flex');
    expect(className).not.toContain('shadow-[');

    // 3. Verifikasi bounding box - tinggi badge harus single-line (< 38px), bukan patah 2 baris
    const box = await statusBadge.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeLessThan(38);
    }

    // 4. Verifikasi Paginasi berfungsi
    // Halaman 1 dari 2 (12 item total, pageSize 10)
    await expect(page.getByText('Showing 1 - 10 data out of 12')).toBeVisible();
    await expect(page.getByText('1 / 2')).toBeVisible();

    // Tombol Previous harus disabled di halaman 1
    const prevBtn = page.getByTitle('Previous page');
    const nextBtn = page.getByTitle('Next page');
    await expect(prevBtn).toBeDisabled();
    await expect(nextBtn).toBeEnabled();

    // Pindah ke halaman 2
    await nextBtn.click();
    await expect(page.getByText('Showing 11 - 12 data out of 12')).toBeVisible();
    await expect(page.getByText('2 / 2')).toBeVisible();
    await expect(prevBtn).toBeEnabled();
    await expect(nextBtn).toBeDisabled();

    // Kembali ke halaman 1
    await prevBtn.click();
    await expect(page.getByText('Showing 1 - 10 data out of 12')).toBeVisible();
    await expect(page.getByText('1 / 2')).toBeVisible();
  });

  test('6. Juri Judged Detail: Displays per-criteria notes and team notes, and does not show legacy Go to Finalist button', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/judge/submissions/sub-evaluated-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            submission: {
              id: 'sub-evaluated-1',
              projectTitle: 'Smart Harbor IoT Dashboard',
              description: 'Realtime port telemetry monitor',
              team: {
                id: 'team-harbor',
                teamName: 'HarborTech',
                competition: { name: 'Software Development', slug: 'software-development' },
                members: [{ role: 'LEADER', user: { fullName: 'Budi Leader' } }],
              },
              scores: [],
            },
            criteriaList: [
              { id: 'c1', name: 'Kesesuaian Tema', maxScore: 100, weight: 50 },
              { id: 'c2', name: 'Implementasi Kode', maxScore: 100, weight: 50 },
            ],
            existingScores: [
              {
                id: 's1',
                criteriaId: 'c1',
                score: 92,
                note: 'Solusi sangat relevan dengan industri pelabuhan maritim',
                isLocked: true,
              },
              {
                id: 's2',
                criteriaId: 'c2',
                score: 88,
                note: 'Modularitas arsitektur backend sangat clean',
                isLocked: true,
              },
            ],
            evaluation: {
              id: 'ev-1',
              feedback: 'Performa tim sangat solid secara keseluruhan.',
              recommendation: null,
            },
            evaluationStatus: { isEvaluated: true, isLocked: true, totalScore: 90 },
            round: 'PENYISIHAN',
            rubric: { totalWeight: 100, isValid: true, criteriaCount: 2 },
          },
        }),
      });
    });

    await page.goto('/juri/judged/sub-evaluated-1');

    // 1. Verifikasi judul dan detail karya
    await expect(page.getByText('Judgement Preliminary')).toBeVisible();
    await expect(page.getByText('HarborTech')).toBeVisible();

    // 2. Verifikasi tabel memuat kolom Kriteria, Bobot, Nilai, dan Catatan Kriteria
    await expect(page.getByRole('columnheader', { name: 'Kriteria', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Bobot' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Nilai' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Catatan Kriteria' })).toBeVisible();

    // 3. Verifikasi catatan per kriteria tampil di dalam tabel
    await expect(page.getByText('Solusi sangat relevan dengan industri pelabuhan maritim')).toBeVisible();
    await expect(page.getByText('Modularitas arsitektur backend sangat clean')).toBeVisible();

    // 4. Verifikasi Catatan Umum Tim tampil
    await expect(page.getByText('Notes For The Team')).toBeVisible();
    await expect(page.getByText('Performa tim sangat solid secara keseluruhan.')).toBeVisible();

    // 5. Verifikasi tombol manual "Go to Finalist" TIDAK ADA
    await expect(page.getByRole('button', { name: /Go to Finalist/i })).not.toBeVisible();
  });

  test('7. Juri Judged List: Displays Rank (#1, #2), Score column, and calculates ranking with tie-breaker', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockUserJuri }),
      });
    });

    const judgedSubmissions = [
      {
        id: 'sub-judged-1',
        projectTitle: 'Alpha App',
        description: 'First submission',
        submittedAt: '2026-11-08T08:00:00.000Z',
        team: {
          id: 'team-alpha',
          teamName: 'Alpha Team',
          competition: { name: 'Software Development', slug: 'software-development' },
          members: [{ role: 'LEADER', user: { fullName: 'Alpha Leader' } }],
        },
        scores: [
          {
            score: 90,
            judge: { id: mockUserJuri.id, name: mockUserJuri.fullName },
            criteria: { weight: 100 },
          },
        ],
        evaluationStatus: { isEvaluated: true, isLocked: true, totalScore: 90 },
      },
      {
        id: 'sub-judged-2',
        projectTitle: 'Beta App',
        description: 'Second submission (tied score, submitted later)',
        submittedAt: '2026-11-08T10:00:00.000Z',
        team: {
          id: 'team-beta',
          teamName: 'Beta Team',
          competition: { name: 'Software Development', slug: 'software-development' },
          members: [{ role: 'LEADER', user: { fullName: 'Beta Leader' } }],
        },
        scores: [
          {
            score: 90,
            judge: { id: mockUserJuri.id, name: mockUserJuri.fullName },
            criteria: { weight: 100 },
          },
        ],
        evaluationStatus: { isEvaluated: true, isLocked: true, totalScore: 90 },
      },
      {
        id: 'sub-judged-3',
        projectTitle: 'Gamma App',
        description: 'Third submission (lower score)',
        submittedAt: '2026-11-08T07:00:00.000Z',
        team: {
          id: 'team-gamma',
          teamName: 'Gamma Team',
          competition: { name: 'Software Development', slug: 'software-development' },
          members: [{ role: 'LEADER', user: { fullName: 'Gamma Leader' } }],
        },
        scores: [
          {
            score: 82,
            judge: { id: mockUserJuri.id, name: mockUserJuri.fullName },
            criteria: { weight: 100 },
          },
        ],
        evaluationStatus: { isEvaluated: true, isLocked: true, totalScore: 82 },
      },
    ];

    await page.route('**/api/judge/submissions*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: judgedSubmissions,
        }),
      });
    });

    await page.route('**/api/judge/rankings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
            round: 'PENYISIHAN',
            isCalculated: false,
            expectedJudgeCount: 3,
            rankings: [
              {
                rank: 1,
                teamId: 'team-alpha',
                submissionId: 'sub-judged-1',
                teamName: 'Alpha Team',
                finalScore: 93.0,
                isFullyScored: true,
                judgeBreakdown: [
                  { judgeId: 'j1', judgeName: 'Pak Amru', averageScore: 90 },
                  { judgeId: 'j2', judgeName: 'Pak Yudha', averageScore: 95 },
                  { judgeId: 'j3', judgeName: 'Pak Faisal', averageScore: 94 },
                ],
              },
              {
                rank: 2,
                teamId: 'team-beta',
                submissionId: 'sub-judged-2',
                teamName: 'Beta Team',
                finalScore: 93.0,
                isFullyScored: false,
                judgeBreakdown: [{ judgeId: 'j1', judgeName: 'Pak Amru', averageScore: 90 }],
              },
              {
                rank: 3,
                teamId: 'team-gamma',
                submissionId: 'sub-judged-3',
                teamName: 'Gamma Team',
                finalScore: 82.0,
                isFullyScored: true,
                judgeBreakdown: [
                  { judgeId: 'j1', judgeName: 'Pak Amru', averageScore: 82 },
                  { judgeId: 'j2', judgeName: 'Pak Yudha', averageScore: 82 },
                  { judgeId: 'j3', judgeName: 'Pak Faisal', averageScore: 82 },
                ],
              },
            ],
          },
        }),
      });
    });

    await page.goto('/juri/judged');

    // 1. Verifikasi judul halaman
    await expect(page.getByRole('heading', { name: 'Judged', level: 1 })).toBeVisible();

    // 2. Verifikasi kolom Team, Product, Your Score, Final Score, Action ada & tidak ada Rank
    await expect(page.getByRole('columnheader', { name: /team/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /product/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Your Score/i })).toBeVisible();
    await expect(page.getByText('Nilai Anda (0–100)')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Final Score/i })).toBeVisible();
    await expect(page.getByText('Rata-rata semua juri')).toBeVisible();
    // Peringkat podium (#1, #2) tidak dipasang di halaman arsip juri
    await expect(page.getByRole('columnheader', { name: /rank/i })).not.toBeVisible();

    // 3. Verifikasi pengurutan Final Score tertinggi dengan tie-breaker submit tercepat
    const rows = page.locator('tbody tr');
    await expect(rows.nth(0)).toContainText('Alpha Team');
    await expect(rows.nth(1)).toContainText('Beta Team');
    await expect(rows.nth(2)).toContainText('Gamma Team');

    // 4. Verifikasi nilai pribadi (Your Score) & nilai akhir lintas juri (Final Score + status kelengkapan)
    await expect(page.getByText('90.00').first()).toBeVisible();
    await expect(page.getByText('93.00').first()).toBeVisible();
    await expect(page.getByText('3/3 juri • Lengkap').first()).toBeVisible();
    await expect(page.getByText('1/3 juri • Belum lengkap')).toBeVisible();
    await expect(page.getByText('82.00').first()).toBeVisible();
  });

  test('8. Peserta Non-Finalist: Shows TIDAK LOLOS FINALIS badge and judge evaluation table', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserPeserta);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserPeserta }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserPeserta }) });
    });
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
              timelineActive: true,
              members: [],
              allMembersDocumentsApproved: true,
            },
          },
        }),
      });
    });
    await page.route('**/api/teams/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'team-nonfinal',
            teamName: 'Beta Squad',
            teamCode: 'SDC099',
            status: 'APPROVE',
            paymentStatus: 'APPROVE',
            competition: { id: 'c1', name: 'Software Development', slug: 'software-development', category: 'TEAM' },
            members: [
              { id: 'm1', userId: mockUserPeserta.id, role: 'LEADER', user: mockUserPeserta },
            ],
          },
        }),
      });
    });
    await page.route('**/api/submissions/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 'sub-nonfinal', projectTitle: 'Beta Project', submittedAt: '2026-11-08T10:00:00.000Z' },
        }),
      });
    });
    await page.route('**/api/user/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/competitions/*/timeline', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/news*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/announcements/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            team: {
              id: 'team-nonfinal',
              teamName: 'Beta Squad',
              teamCode: 'SDC099',
              competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
            },
            announcements: [
              {
                id: 'ann-nonfinal',
                competitionId: 'c1',
                teamId: 'team-nonfinal',
                isFinalist: false,
                rank: null,
                round: 'PENYISIHAN',
                publishedAt: '2026-11-10T10:00:00.000Z',
                createdAt: '2026-11-10T09:00:00.000Z',
                competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
                team: { id: 'team-nonfinal', teamName: 'Beta Squad', teamCode: 'SDC099' },
                evaluation: {
                  finalScore: 78.5,
                  isFullyScored: true,
                  submittedAt: '2026-11-08T15:30:00.000Z',
                  tieBreaker: {
                    status: 'LOST',
                    rank: 6,
                    comparedRank: 5,
                    score: 78.5,
                    submittedAt: '2026-11-08T15:30:00.000Z',
                    comparedSubmittedAt: '2026-11-08T14:10:00.000Z',
                  },
                  judgeBreakdown: [
                    {
                      judgeId: 'j1',
                      judgeName: 'Pak Amru',
                      criteriaCount: 1,
                      averageScore: 78.5,
                      feedback: 'Perkuat validasi arsitektur pada versi berikutnya.',
                      criteriaScores: [
                        {
                          criteriaId: 'cr1',
                          criteriaName: 'Problem Solving & Impact',
                          score: 78.5,
                          maxScore: 100,
                          weight: 100,
                          note: 'Implementasi inti sudah berjalan.',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        }),
      });
    });

    await page.goto('/peserta/dashboard');

    await expect(page.getByText('TIDAK LOLOS').first()).toBeVisible();
    await expect(page.getByText(/SEVENT X tahun depan/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Tim Beta Squad Belum Lolos ke Babak Final/i })).toBeVisible();
    await expect(page.getByText(/Hasil Penilaian Tim/i)).toBeVisible();
    await expect(page.getByText('78.50').first()).toBeVisible();
    await expect(page.getByText('Implementasi inti sudah berjalan.').first()).toBeVisible();
    await expect(page.getByText(/Keterangan Nilai Seri \(Peringkat #6\)/i)).toBeVisible();
    await expect(page.getByText(/22\.30 WIB/).first()).toBeVisible();
    await expect(page.getByText(/21\.10 WIB/).first()).toBeVisible();
  });

  test('9. Juri List Finalists (/juri/team): Displays Rank and Final Score for published finalists only', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserJuri }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserJuri }) });
    });
    await page.route('**/api/judge/rankings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
            round: 'PENYISIHAN',
            isCalculated: true,
            rankings: [
              {
                rank: 1,
                teamId: 'team-1',
                submissionId: 'sub-1',
                teamName: 'EcoLoop Studio',
                teamCode: 'SDC001',
                leaderName: 'Fajar Pratama',
                submittedAt: '2026-11-08T08:00:00.000Z',
                projectTitle: 'EcoLoop Waste Tracker',
                finalScore: 92.5,
                isFullyScored: true,
                isFinalist: true,
                recommendationTally: { FINALIST: 3, WAITLIST: 0 },
                judgeBreakdown: [],
              },
              {
                rank: 2,
                teamId: 'team-2',
                submissionId: 'sub-2',
                teamName: 'FinSphere',
                teamCode: 'SDC002',
                leaderName: 'Aditya Nugraha',
                submittedAt: '2026-11-08T09:00:00.000Z',
                projectTitle: 'FinSphere Wallet',
                finalScore: 88.75,
                isFullyScored: true,
                isFinalist: true,
                recommendationTally: { FINALIST: 2, WAITLIST: 1 },
                judgeBreakdown: [],
              },
              {
                rank: 6,
                teamId: 'team-6',
                submissionId: 'sub-6',
                teamName: 'Eliminated Team',
                teamCode: 'SDC006',
                leaderName: 'Budi',
                submittedAt: '2026-11-08T10:00:00.000Z',
                projectTitle: 'Non Finalist App',
                finalScore: 79.0,
                isFullyScored: true,
                isFinalist: false,
                recommendationTally: { FINALIST: 0, WAITLIST: 3 },
                judgeBreakdown: [],
              },
            ],
          },
        }),
      });
    });

    await page.goto('/juri/team');

    await expect(page.getByRole('columnheader', { name: 'Rank' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Final Score' })).toBeVisible();
    await expect(page.getByText('#1')).toBeVisible();
    await expect(page.getByText('#2')).toBeVisible();
    await expect(page.getByText('92.50')).toBeVisible();
    await expect(page.getByText('88.75')).toBeVisible();
    await expect(page.getByText('EcoLoop Studio')).toBeVisible();
    await expect(page.getByText('Eliminated Team')).toHaveCount(0);
  });

  test('10. Juri Judged Detail: Shows Final Score header summary, Your Score label, and hides legacy recommendation', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserJuri }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserJuri }) });
    });
    await page.route('**/api/judge/submissions', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/judge/submissions/sub-evaluated-2', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            submission: {
              id: 'sub-evaluated-2',
              projectTitle: 'EcoLoop Studio Tracker',
              description: 'Reverse vending tracker',
              team: {
                id: 'team-ecoloop',
                teamName: 'EcoLoop Studio',
                competition: { name: 'Software Development', slug: 'software-development' },
                members: [{ role: 'LEADER', user: { fullName: 'Fajar Nugraha' } }],
              },
              scores: [],
            },
            criteriaList: [
              { id: 'c1', name: 'Kesesuaian Tema', maxScore: 100, weight: 50 },
              { id: 'c2', name: 'Implementasi Kode', maxScore: 100, weight: 50 },
            ],
            existingScores: [
              { id: 's1', criteriaId: 'c1', score: 92, note: 'Tema kuat', isLocked: true },
              { id: 's2', criteriaId: 'c2', score: 88, note: 'Implementasi rapi', isLocked: true },
            ],
            evaluation: { id: 'ev-2', feedback: 'Karya solid.', recommendation: 'FINALIST' },
            evaluationStatus: { isEvaluated: true, isLocked: true, totalScore: 90 },
            round: 'PENYISIHAN',
            rubric: { totalWeight: 100, isValid: true, criteriaCount: 2 },
          },
        }),
      });
    });
    await page.route('**/api/judge/rankings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
            round: 'PENYISIHAN',
            isCalculated: false,
            expectedJudgeCount: 3,
            rankings: [
              {
                rank: 1,
                teamId: 'team-ecoloop',
                submissionId: 'sub-evaluated-2',
                teamName: 'EcoLoop Studio',
                finalScore: 86.25,
                isFullyScored: false,
                judgeBreakdown: [
                  { judgeId: 'j1', judgeName: 'Pak Amru', criteriaCount: 2, averageScore: 90 },
                  { judgeId: 'j2', judgeName: 'Pak Yudha', criteriaCount: 2, averageScore: 82.5 },
                ],
              },
            ],
          },
        }),
      });
    });

    await page.goto('/juri/judged/sub-evaluated-2');

    await expect(page.getByText('Final Score').first()).toBeVisible();
    await expect(page.getByText('86.25').first()).toBeVisible();
    await expect(page.getByText('Your Score')).toBeVisible();
    await expect(page.getByText('Belum lengkap (2/3 juri)')).toBeVisible();
    await expect(page.getByText(/Rekomendasi juri/i)).toHaveCount(0);
  });

  test('11. Admin Results: Blocks publish when judge scoring is incomplete and allows once complete', async ({ page }) => {
    const mockAdmin = { ...mockUserJuri, id: 'admin-1', email: 'admin@seventx.zetech', fullName: 'Admin SeventX', role: 'ADMIN' };
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockAdmin);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAdmin }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAdmin }) });
    });
    await page.route('**/api/admin/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/competitions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 'c1', name: 'Software Development', slug: 'software-development' }],
        }),
      });
    });

    let allJudgesComplete = false;
    await page.route('**/api/admin/announcements/calculate', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              rank: 1,
              teamId: 't1',
              teamName: 'SecuraMesh',
              projectTitle: 'Zero-Trust Health',
              category: 'Software Development',
              finalScore: 92.6,
              isFinalist: true,
              hasSubmission: true,
              isFullyScored: allJudgesComplete,
              scoredJudgeCount: allJudgesComplete ? 3 : 2,
              expectedJudgeCount: 3,
              submittedAt: '2026-11-08T10:00:00.000Z',
              tieBreaker: null,
            },
            {
              rank: 5,
              teamId: 't5',
              teamName: 'EduNova Labs',
              projectTitle: 'Adaptive Learning Hub',
              category: 'Software Development',
              finalScore: 82.0,
              isFinalist: true,
              hasSubmission: true,
              isFullyScored: true,
              scoredJudgeCount: 3,
              expectedJudgeCount: 3,
              submittedAt: '2026-11-08T14:10:00.000Z',
              tieBreaker: {
                status: 'WON',
                rank: 5,
                comparedRank: 6,
                score: 82.0,
                submittedAt: '2026-11-08T14:10:00.000Z',
                comparedSubmittedAt: '2026-11-08T15:30:00.000Z',
              },
            },
            {
              rank: 6,
              teamId: 't6',
              teamName: 'LogixFlow',
              projectTitle: 'Supply Chain Optimizer',
              category: 'Software Development',
              finalScore: 82.0,
              isFinalist: false,
              hasSubmission: true,
              isFullyScored: true,
              scoredJudgeCount: 3,
              expectedJudgeCount: 3,
              submittedAt: '2026-11-08T15:30:00.000Z',
              tieBreaker: {
                status: 'LOST',
                rank: 6,
                comparedRank: 5,
                score: 82.0,
                submittedAt: '2026-11-08T15:30:00.000Z',
                comparedSubmittedAt: '2026-11-08T14:10:00.000Z',
              },
            },
          ],
        }),
      });
    });

    let publishPayload: Record<string, unknown> | null = null;
    await page.route('**/api/admin/announcements/publish', async (route) => {
      publishPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { totalAnnouncementsPublished: 1 } }),
      });
    });

    await page.goto('/admin/results');
    await page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i }).click();

    await expect(page.getByText(/Penilaian Juri Belum Lengkap/i)).toBeVisible();
    await expect(page.getByText(/Belum dinilai penuh \(2\/3 juri\)/i)).toBeVisible();
    const publishBtn = page.getByRole('button', { name: /Publikasikan (Pemenang Resmi|Hasil)/i });
    await expect(publishBtn).toBeDisabled();

    // Setelah seluruh juri melengkapi penilaian, kalkulasi ulang membuka tombol publish
    allJudgesComplete = true;
    await page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i }).click();

    await expect(page.getByText(/Penilaian Juri Belum Lengkap/i)).not.toBeVisible();
    await expect(page.getByText(/Seri • Unggul submit/i)).toBeVisible();
    await expect(page.getByText(/Seri • Kalah submit/i)).toBeVisible();
    await expect(publishBtn).toBeEnabled();
    await publishBtn.click();

    await expect.poll(() => publishPayload).toEqual({
      competitionSlug: 'software-development',
      round: 'PENYISIHAN',
    });
    await expect(page.getByRole('button', { name: /Sudah Dipublikasikan/i })).toBeVisible();
  });

  test('12. Peserta Competition & Dashboard: Weighted scoring matrix with criteria notes, sticky External Links, and SEVENT X theme', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserPeserta);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserPeserta }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUserPeserta }) });
    });
    await page.route('**/api/competitions/software-development', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { id: 'c1', name: 'Software Development', slug: 'software-development', category: 'TEAM', maxMember: 5 },
        }),
      });
    });
    await page.route('**/api/competitions/*/timeline', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/user/documents', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/news*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
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
              timelineActive: true,
              members: [],
              allMembersDocumentsApproved: true,
            },
          },
        }),
      });
    });
    await page.route('**/api/teams/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'team-edunova',
            teamName: 'EduNova Labs',
            teamCode: 'SDC555',
            status: 'APPROVE',
            paymentStatus: 'APPROVE',
            paymentProof: { id: 'pay-1', status: 'APPROVE' },
            competition: { id: 'c1', name: 'Software Development', slug: 'software-development', category: 'TEAM' },
            members: [
              { id: 'm1', userId: mockUserPeserta.id, role: 'LEADER', user: mockUserPeserta },
            ],
          },
        }),
      });
    });

    const mockedSubmission = {
      id: 'sub-edunova',
      teamId: 'team-edunova',
      projectTitle: 'EduNova Adaptif',
      description: 'Platform belajar adaptif berbasis kompetensi.',
      githubUrl: 'https://github.com/edunova/app',
      demoVideoUrl: 'https://youtu.be/edunova',
      status: 'SUBMITTED',
      submittedAt: '2026-11-08T14:10:00.000Z',
      scores: [
        {
          id: 's1',
          score: 80,
          note: 'Tema pendidikan sangat relevan',
          isLocked: true,
          criteria: { id: 'crit-1', name: 'Kesesuaian Tema', maxScore: 100, weight: 40, order: 1, round: 'PENYISIHAN' },
          judge: { id: 'j1', user: { fullName: 'Pak Faisal' } },
        },
        {
          id: 's2',
          score: 85,
          note: 'Arsitektur bersih',
          isLocked: true,
          criteria: { id: 'crit-2', name: 'Implementasi Kode', maxScore: 100, weight: 60, order: 2, round: 'PENYISIHAN' },
          judge: { id: 'j1', user: { fullName: 'Pak Faisal' } },
        },
        {
          id: 's3',
          score: 90,
          note: 'Eksekusi tema solid',
          isLocked: true,
          criteria: { id: 'crit-1', name: 'Kesesuaian Tema', maxScore: 100, weight: 40, order: 1, round: 'PENYISIHAN' },
          judge: { id: 'j2', user: { fullName: 'Pak Amru' } },
        },
        {
          id: 's4',
          score: 95,
          note: 'Integrasi lengkap',
          isLocked: true,
          criteria: { id: 'crit-2', name: 'Implementasi Kode', maxScore: 100, weight: 60, order: 2, round: 'PENYISIHAN' },
          judge: { id: 'j2', user: { fullName: 'Pak Amru' } },
        },
      ],
      judgeEvaluations: [
        { id: 'ev1', judgeId: 'j1', feedback: 'Performa API sudah stabil.', round: 'PENYISIHAN', judge: { id: 'j1', user: { fullName: 'Pak Faisal' } } },
        { id: 'ev2', judgeId: 'j2', feedback: 'Alur evaluasi sangat jelas.', round: 'PENYISIHAN', judge: { id: 'j2', user: { fullName: 'Pak Amru' } } },
      ],
    };

    await page.route('**/api/submissions/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockedSubmission }) });
    });

    await page.route('**/api/announcements/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            team: {
              id: 'team-edunova',
              teamName: 'EduNova Labs',
              teamCode: 'SDC555',
              competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
            },
            announcements: [
              {
                id: 'ann-edunova',
                competitionId: 'c1',
                teamId: 'team-edunova',
                isFinalist: true,
                rank: 5,
                round: 'PENYISIHAN',
                publishedAt: '2026-11-11T05:00:00.000Z',
                createdAt: '2026-11-11T04:00:00.000Z',
                competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
                team: { id: 'team-edunova', teamName: 'EduNova Labs', teamCode: 'SDC555' },
                evaluation: {
                  finalScore: 88,
                  isFullyScored: true,
                  submittedAt: '2026-11-08T14:10:00.000Z',
                  tieBreaker: {
                    status: 'WON',
                    rank: 5,
                    comparedRank: 6,
                    score: 88,
                    submittedAt: '2026-11-08T14:10:00.000Z',
                    comparedSubmittedAt: '2026-11-08T15:30:00.000Z',
                  },
                  judgeBreakdown: [
                    {
                      judgeId: 'j1',
                      judgeName: 'Pak Faisal',
                      criteriaCount: 2,
                      averageScore: 83,
                      feedback: 'Performa API sudah stabil.',
                      criteriaScores: [
                        { criteriaId: 'crit-1', criteriaName: 'Kesesuaian Tema', score: 80, maxScore: 100, weight: 40, note: 'Tema pendidikan sangat relevan' },
                        { criteriaId: 'crit-2', criteriaName: 'Implementasi Kode', score: 85, maxScore: 100, weight: 60, note: 'Arsitektur bersih' },
                      ],
                    },
                    {
                      judgeId: 'j2',
                      judgeName: 'Pak Amru',
                      criteriaCount: 2,
                      averageScore: 93,
                      feedback: 'Alur evaluasi sangat jelas.',
                      criteriaScores: [
                        { criteriaId: 'crit-1', criteriaName: 'Kesesuaian Tema', score: 90, maxScore: 100, weight: 40, note: 'Eksekusi tema solid' },
                        { criteriaId: 'crit-2', criteriaName: 'Implementasi Kode', score: 95, maxScore: 100, weight: 60, note: 'Integrasi lengkap' },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        }),
      });
    });

    await page.goto('/peserta/competition/software-development');
    await expect(page.getByRole('heading', { name: 'Hasil Penilaian Juri' })).toBeVisible();
    await expect(page.getByText('40%')).toBeVisible();
    await expect(page.getByText('60%')).toBeVisible();
    // Tabel Rincian Nilai per Kriteria bersih (khusus angka), catatan ada di section Catatan & Masukan Tiap Juri
    await expect(page.locator('table')).not.toContainText('Tema pendidikan sangat relevan');
    await expect(page.getByText('Tema pendidikan sangat relevan')).toBeVisible();
    await expect(page.getByText('Integrasi lengkap')).toBeVisible();
    await expect(page.getByText('88.00').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText('📝');

    const externalStickyWrapper = page.getByRole('heading', { name: 'External Links' }).locator('..').locator('..');
    await expect(externalStickyWrapper).toHaveCSS('position', 'sticky');
    const mainOverflowX = await page.locator('main').evaluate((el) => getComputedStyle(el).overflowX);
    expect(mainOverflowX).not.toBe('hidden');

    // Hasil Penilaian Juri harus full width di bawah Action Button & External Links (bukan di kolom kiri yang sempit)
    const actionBox = await page.getByRole('heading', { name: 'Action Button' }).locator('..').boundingBox();
    const evalBox = await page.getByRole('heading', { name: 'Hasil Penilaian Juri' }).locator('..').boundingBox();
    expect(actionBox).not.toBeNull();
    expect(evalBox).not.toBeNull();
    expect(evalBox!.width).toBeGreaterThan(actionBox!.width + 100);
    expect(evalBox!.y).toBeGreaterThan(actionBox!.y + actionBox!.height - 1);
    await expect(page.getByRole('heading', { name: 'Hasil Penilaian Juri' }).locator('..').locator('svg')).toHaveCount(0);

    // Pastikan tabel Hasil Penilaian Juri juga berubah jadi card layout di mobile tanpa horizontal overflow
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('tbody tr').first()).toHaveCSS('display', 'block');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/peserta/dashboard');
    const announcementHeading = page.getByRole('heading', { name: /Selamat! Tim EduNova Labs Lolos ke Babak Final/i });
    await expect(announcementHeading).toBeVisible();
    await expect(announcementHeading.locator('..').locator('..').locator('svg')).toHaveCount(0);
    await expect(page.getByText('LOLOS FINALIS').first().locator('span')).toHaveCount(0);
    await expect(page.getByText(/Keterangan Nilai Seri \(Peringkat #5\):/i)).toBeVisible();
    await expect(page.locator('table')).not.toContainText('Tema pendidikan sangat relevan');
    await expect(page.getByText('Tema pendidikan sangat relevan')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('📝');
  });

  test('13. Admin Teams: Pagination controls work and table transforms into card layout on mobile', async ({ page }) => {
    const mockAdmin = { ...mockUserJuri, id: 'admin-1', email: 'admin@seventx.zetech', fullName: 'Admin SeventX', role: 'ADMIN' };
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockAdmin);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAdmin }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAdmin }) });
    });
    await page.route('**/api/competitions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ id: 'c1', name: 'Software Development', slug: 'software-development' }],
        }),
      });
    });

    const teams = Array.from({ length: 12 }, (_, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const hour = String(20 - idx).padStart(2, '0');
      return {
        id: `team-${num}`,
        teamName: `Tim Alpha ${num}`,
        teamCode: `ALP${num}`,
        documentStatus: 'PENDING',
        status: 'PENDING',
        paymentProof: { id: `pay-${num}`, status: 'PENDING' },
        createdAt: `2026-11-10T${hour}:00:00.000Z`,
        competition: { id: 'c1', name: 'Software Development', slug: 'software-development' },
        members: [
          { id: `m-${num}`, role: 'LEADER', user: { fullName: `Leader ${num}` } },
        ],
      };
    });

    await page.route('**/api/teams**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: teams }) });
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/teams');

    await expect(page.getByText('Tim Alpha 01')).toBeVisible();
    await expect(page.getByText('Tim Alpha 11')).toHaveCount(0);
    await expect(page.getByText(/Showing 1 - 10 data out of 12/i)).toBeVisible();

    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText('Tim Alpha 11')).toBeVisible();
    await expect(page.getByText('Tim Alpha 12')).toBeVisible();
    await expect(page.getByText(/Showing 11 - 12 data out of 12/i)).toBeVisible();

    await page.getByLabel('Jumlah data per halaman').selectOption('5');
    await expect(page.getByText('Tim Alpha 01')).toBeVisible();
    await expect(page.getByText('Tim Alpha 05')).toBeVisible();
    await expect(page.getByText('Tim Alpha 06')).toHaveCount(0);
    await expect(page.getByText(/Showing 1 - 5 data out of 12/i)).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toHaveCSS('display', 'block');
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('14. Admin Verified Team mobile/tablet cards and Admin Results competition switch persistence', async ({ page }) => {
    const mockAdmin = { ...mockUserJuri, id: 'admin-1', email: 'admin@seventx.zetech', fullName: 'Admin SeventX', role: 'ADMIN' };
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockAdmin);

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAdmin }) });
    });
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockAdmin }) });
    });
    await page.route('**/api/admin/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/competitions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'c1', name: 'Software Development', slug: 'software-development' },
            { id: 'c2', name: 'UI/UX Design', slug: 'ui-ux' },
          ],
        }),
      });
    });

    const verifiedTeams = [
      {
        id: 'vt-1',
        teamName: 'SecuraMesh Enterprise Security Platform Team',
        teamCode: 'VER001',
        documentStatus: 'APPROVE',
        status: 'APPROVE',
        paymentProof: { id: 'p-1', status: 'APPROVE' },
        createdAt: '2026-11-08T10:00:00.000Z',
        competition: { id: 'c2', name: 'UI/UX Design', slug: 'ui-ux' },
        members: [{ id: 'm-1', role: 'LEADER', user: { fullName: 'Kevin Alamsyah Panjang Sekali' } }],
      },
    ];
    await page.route('**/api/teams**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: verifiedTeams }) });
    });

    // Verifikasi halaman Verified Team (/admin/documents) tampil sebagai card di mobile 375px & tablet 768px tanpa horizontal overflow
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/admin/documents');
    await expect(page.getByText('SecuraMesh Enterprise Security Platform Team')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toHaveCSS('display', 'block');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('tbody tr').first()).toHaveCSS('display', 'block');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)).toBe(false);

    // Verifikasi /admin/results menyimpan hasil kalkulasi tiap kompetisi saat pindah kompetisi & kembali lagi
    let calculateCount = 0;
    await page.route('**/api/admin/announcements/calculate', async (route) => {
      calculateCount++;
      const body = route.request().postDataJSON() as { competitionSlug: string };
      const rows = body.competitionSlug === 'ui-ux'
        ? [{ rank: 1, teamId: 'u1', teamName: 'MindEase Design', projectTitle: 'Mental App', category: 'UI/UX Design', finalScore: 91, isFinalist: true, hasSubmission: true, isFullyScored: true }]
        : [{ rank: 1, teamId: 's1', teamName: 'SecuraMesh', projectTitle: 'Zero Trust', category: 'Software Development', finalScore: 94, isFinalist: true, hasSubmission: true, isFullyScored: true }];
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: rows }) });
    });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/results');
    await page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i }).click();
    await expect(page.getByText('SecuraMesh')).toBeVisible();
    expect(calculateCount).toBe(1);

    const compSelect = page.locator('select').first();
    await compSelect.selectOption('ui-ux');
    await expect(page.getByText('SecuraMesh')).toHaveCount(0);
    await page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i }).click();
    await expect(page.getByText('MindEase Design')).toBeVisible();
    expect(calculateCount).toBe(2);

    // Pindah kembali ke software-development -> hasil langsung tampil dari cache tanpa perlu klik kalkulasi lagi
    await compSelect.selectOption('software-development');
    await expect(page.getByText('SecuraMesh')).toBeVisible();
    expect(calculateCount).toBe(2);
  });

  test('15. Admin active round switch & Juri Finalist preliminary round query work cleanly', async ({ page }) => {
    const mockAdmin = { ...mockUserJuri, id: 'admin-1', email: 'admin@seventx.zetech', fullName: 'Admin SeventX', role: 'ADMIN' };
    await page.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockAdmin);

    let currentRound: 'PENYISIHAN' | 'FINAL' = 'PENYISIHAN';
    let lastPutBody: { activeRound?: string } | null = null;
    await page.route('**/api/competitions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'c1', name: 'Software Development', slug: 'software-development', description: 'SD', maxMember: 5, isActive: true, activeRound: currentRound, createdAt: '', updatedAt: '' },
          ],
        }),
      });
    });

    await page.route('**/api/competitions/software-development', async (route) => {
      if (route.request().method() === 'PUT') {
        lastPutBody = route.request().postDataJSON() as { activeRound?: string };
        if (lastPutBody.activeRound === 'FINAL' || lastPutBody.activeRound === 'PENYISIHAN') {
          currentRound = lastPutBody.activeRound;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'c1', name: 'Software Development', slug: 'software-development', activeRound: currentRound },
          }),
        });
      }
    });

    await page.goto('/admin/results');
    await expect(page.getByText('Babak Aktif Penilaian Juri:')).toBeVisible();
    await expect(page.getByText('Babak Penyisihan')).toBeVisible();
    await page.getByRole('button', { name: 'Final', exact: true }).click();
    await page.getByRole('button', { name: /Ya, Aktifkan Babak Final/i }).click();
    await expect.poll(() => lastPutBody?.activeRound).toBe('FINAL');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Babak Final')).toBeVisible();

    const juriContext = await page.context().browser()!.newContext();
    const juriPage = await juriContext.newPage();
    await juriPage.route('**/api/auth/refresh-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { accessToken: 'mock-valid-token' } }),
      });
    });
    await juriPage.addInitScript((user) => {
      localStorage.setItem('seventx-auth-user', JSON.stringify({
        state: { user, accessToken: 'mock-token' },
        version: 0,
      }));
    }, mockUserJuri);

    let requestedRound: string | null = null;
    await juriPage.route('**/api/judge/submissions/sub-fin-1**', async (route) => {
      const url = new URL(route.request().url());
      requestedRound = url.searchParams.get('round');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            submission: {
              id: 'sub-fin-1',
              teamId: 't1',
              projectTitle: 'Zero Trust Mesh',
              description: 'SecuraMesh app',
              team: { id: 't1', teamName: 'SecuraMesh', teamCode: 'SD01', members: [] },
            },
            criteriaList: [],
            existingScores: [],
            evaluation: { id: 'ev-1', feedback: 'Lolos dengan catatan baik.', recommendation: 'FINALIST' },
            evaluationStatus: { isEvaluated: true, isLocked: true, totalScore: 88 },
            round: 'PENYISIHAN',
            rubric: { totalWeight: 100, isValid: true },
          },
        }),
      });
    });

    await juriPage.route('**/api/judge/submissions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'sub-fin-1',
              teamId: 't1',
              projectTitle: 'Zero Trust Mesh',
              team: {
                id: 't1',
                teamName: 'SecuraMesh',
                teamCode: 'SD01',
                competition: { id: 'c1', name: 'Software Development', slug: 'software-development', activeRound: 'FINAL' },
                members: [],
              },
              scores: [],
              evaluationStatus: { isEvaluated: false, isLocked: false, totalScore: 0 },
            },
          ],
        }),
      });
    });

    await juriPage.route('**/api/judge/rankings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            competition: { id: 'c1', name: 'Software Development', slug: 'software-development', activeRound: 'FINAL' },
            expectedJudgeCount: 3,
            rankings: [],
          },
        }),
      });
    });

    await juriPage.goto(`${new URL(page.url()).origin}/juri/team/sub-fin-1`);
    await expect.poll(() => requestedRound).toBe('PENYISIHAN');
    await expect(juriPage.locator('aside').getByText('FINAL JUDGEMENT')).toBeVisible();
    await expect(juriPage.getByRole('button', { name: /Judgement Preliminary/i })).toBeVisible();
    await expect(juriPage.getByRole('link', { name: 'Isi Nilai Final' })).toBeVisible();
    await juriContext.close();
  });
});
