import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';

// Tidak memakai auth state awal agar mulai dari /login
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SEVENT X - Complete Live End-to-End Demo (10 Teams, Tie-Breaker & All POVs)', () => {
  // Reset database ke state awal sebelum pengujian agar test SELALU berhasil diulang kapanpun
  test.beforeAll(async () => {
    const backendDir = path.resolve(process.cwd(), '../backend-seventx');
    console.log('🔄 Menyiapkan database & data demo awal...');
    execSync('node node_modules/tsx/dist/cli.mjs scripts/setup-live-demo-data.ts', {
      cwd: backendDir,
      stdio: 'inherit',
    });
  });

  test('All POVs: Juri Penyisihan -> Admin Tie Breaker -> POV Lolos Finalis -> POV Tidak Lolos -> Juri Final -> Admin Winner -> POV Juara 1', async ({ page }) => {
    test.setTimeout(360000); // 6 menit untuk seluruh alur live demo lengkap

    // =========================================================================
    // TAHAP 1: LOGIN JURI 3 & PENILAIAN BABAK PENYISIHAN (FinSphere, AstraCode, EduNova)
    // =========================================================================
    console.log('--- TAHAP 1: Juri 3 Penilaian Penyisihan Satu per Satu ---');
    await page.goto('/login');
    await page.waitForTimeout(1000);

    await page.locator('input[type="email"]').fill('juri.softdev.3@seventx.zetech');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/juri/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const prelimTeams = [
      { name: 'FinSphere', scores: ['95', '95', '95', '95', '95'], note: 'Arsitektur cloud native dan keamanan transaksi FinTech sangat matang.', feedback: 'Solusi platform inklusi finansial dengan UX yang sangat intuitif dan performa tinggi.' },
      { name: 'AstraCode', scores: ['85', '85', '85', '85', '85'], note: 'Solusi microservices rapi, performa throughput stabil.', feedback: 'Implementasi backend efisien dan terstruktur dengan baik.' },
      { name: 'EduNova Labs', scores: ['85', '85', '85', '85', '85'], note: 'Platform edukasi adaptif dengan UI responsif.', feedback: 'Inovasi pembelajaran interaktif yang potensial.' },
    ];

    for (const team of prelimTeams) {
      await page.goto('/juri/already-submitted');
      await page.waitForTimeout(1500);

      await expect(page.getByText(team.name)).toBeVisible({ timeout: 15000 });
      const row = page.locator('tbody tr').filter({ hasText: team.name }).first();
      const detailLink = row.locator('a[href*="/already-submitted/"]').first();
      await expect(detailLink).toBeVisible({ timeout: 10000 });
      await detailLink.click();

      await page.waitForURL('**/juri/already-submitted/**', { timeout: 15000 });
      await page.waitForTimeout(1200);

      const scoreInputs = page.locator('input[type="number"]');
      await expect(scoreInputs.first()).toBeVisible({ timeout: 10000 });
      const inputCount = await scoreInputs.count();

      for (let i = 0; i < inputCount; i++) {
        await scoreInputs.nth(i).fill(team.scores[i % team.scores.length]);
        await page.waitForTimeout(200);
      }

      const noteInputs = page.locator('input[placeholder*="Catatan untuk kriteria"], textarea[placeholder*="Catatan untuk kriteria"]');
      const noteCount = await noteInputs.count();
      for (let i = 0; i < noteCount; i++) {
        await noteInputs.nth(i).fill(team.note);
        await page.waitForTimeout(150);
      }

      const feedbackBox = page.locator('textarea[placeholder*="Notes"]').first();
      if (await feedbackBox.isVisible()) {
        await feedbackBox.fill(team.feedback);
        await page.waitForTimeout(300);
      }

      const submitBtn = page.getByRole('button', { name: 'Submit', exact: true });
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();
      await page.waitForTimeout(500);

      const confirmSubmitBtn = page.getByRole('button', { name: 'Ya, Submit' });
      await expect(confirmSubmitBtn).toBeVisible({ timeout: 10000 });
      await confirmSubmitBtn.click();

      await page.waitForURL('**/juri/already-submitted**', { timeout: 15000 });
      await page.waitForTimeout(1000);
      console.log(`✔ [Penyisihan] Tim ${team.name} berhasil dinilai dan dikunci!`);
    }

    // Buka menu Judged
    await page.goto('/juri/judged');
    await page.waitForTimeout(2000);

    // Log out Juri 3
    await page.locator('button:has-text("Log out")').filter({ visible: true }).first().click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TAHAP 2: ADMIN ACCUMULATION & TIE-BREAKER POSISI 5 (10 TIM PENYISIHAN)
    // =========================================================================
    console.log('--- TAHAP 2: Admin Akumulasi & Tie-Breaker Posisi 5 ---');
    await page.locator('input[type="email"]').fill('admin@seventx.zetech');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/admin/**', { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.goto('/admin/results');
    await page.waitForTimeout(1500);

    const compSelect = page.locator('select').first();
    await compSelect.selectOption({ label: 'Software Development' });
    await page.waitForTimeout(800);

    const roundSelect = page.locator('select').nth(1);
    await roundSelect.selectOption('PENYISIHAN');
    await page.waitForTimeout(800);

    const calcBtn = page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i });
    await calcBtn.click();
    await page.waitForTimeout(2500);

    await expect(page.getByText(/Hasil Ranking Skor Akumulasi/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Lolos Finalis/i).first()).toBeVisible({ timeout: 15000 });

    // Verifikasi tie breaker di baris AstraCode dan EduNova Labs
    await expect(page.getByText(/Seri • Unggul submit/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Seri • Kalah submit/i).first()).toBeVisible({ timeout: 15000 });
    console.log('✔ Kalkulasi ranking & tie-breaker posisi 5 berhasil diverifikasi!');
    await page.waitForTimeout(2000);

    const publishPrelimBtn = page.getByRole('button', { name: /Publikasikan Hasil Penyisihan/i });
    await publishPrelimBtn.scrollIntoViewIfNeeded();
    await expect(publishPrelimBtn).toBeEnabled({ timeout: 15000 });
    await publishPrelimBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Sudah Dipublikasikan/i).first()).toBeVisible({ timeout: 15000 });
    console.log('✔ Pengumuman finalis resmi dipublikasikan!');

    // Ubah babak aktif juri ke babak FINAL
    const switchFinalBtn = page.getByRole('button', { name: 'Final', exact: true }).first();
    await switchFinalBtn.scrollIntoViewIfNeeded();
    await switchFinalBtn.click();
    await page.waitForTimeout(800);

    const confirmRoundModal = page.getByRole('button', { name: /Ya, Aktifkan Babak Final/i });
    await expect(confirmRoundModal).toBeVisible({ timeout: 10000 });
    await confirmRoundModal.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Babak Final/i).first()).toBeVisible({ timeout: 15000 });
    console.log('✔ Babak aktif kompetisi berhasil diubah ke Babak Final!');

    // Log out Admin
    await page.locator('button:has-text("Log out")').filter({ visible: true }).first().click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TAHAP 3: POV PESERTA LOLOS FINALIS VIA TIE-BREAKER (AstraCode - Rank 5)
    // =========================================================================
    console.log('--- TAHAP 3: POV Peserta Lolos Finalis (AstraCode - Dennis) ---');
    await page.locator('input[type="email"]').fill('dennis.astracode@seventx.test');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/peserta/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: /Selamat! Tim AstraCode Lolos ke Babak Final/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Keterangan Nilai Seri \(Peringkat #5\)/i)).toBeVisible({ timeout: 15000 });
    console.log('✔ Dashboard AstraCode menampilkan pesan Lolos Finalis & keterangan tie-breaker unggul submit!');
    await page.waitForTimeout(4000);

    await page.locator('button:has-text("Log out")').filter({ visible: true }).first().click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TAHAP 4: POV PESERTA TIDAK LOLOS FINALIS VIA TIE-BREAKER (EduNova Labs - Rank 6)
    // =========================================================================
    console.log('--- TAHAP 4: POV Peserta Tidak Lolos Finalis (EduNova Labs - Fajar) ---');
    await page.locator('input[type="email"]').fill('fajar.edunova@seventx.test');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/peserta/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: /Tim EduNova Labs Belum Lolos ke Babak Final/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Keterangan Nilai Seri \(Peringkat #6\)/i)).toBeVisible({ timeout: 15000 });
    console.log('✔ Dashboard EduNova Labs menampilkan pesan Belum Lolos & keterangan tie-breaker kalah submit!');
    await page.waitForTimeout(4000);

    await page.locator('button:has-text("Log out")').filter({ visible: true }).first().click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TAHAP 5: LOGIN JURI 1 & PENILAIAN BABAK FINAL (FINALIS SATU PER SATU)
    // =========================================================================
    console.log('--- TAHAP 5: Juri 1 Penilaian Babak Final Satu per Satu ---');
    await page.locator('input[type="email"]').fill('juri.softdev.1@seventx.zetech');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/juri/**', { timeout: 15000 });
    await page.waitForTimeout(1000);

    const finalTeams = [
      { name: 'FinSphere', scores: ['97', '97', '97', '97'], feedback: 'Presentasi babak final memukau dewan juri. Live demo berjalan tanpa celah dan kesiapan komersialisasi produk sangat matang.' },
      { name: 'AstraCode', scores: ['85', '85', '85', '85'], feedback: 'Presentasi dan simulasi prototipe microservices berjalan stabil di babak final.' },
    ];

    for (const team of finalTeams) {
      await page.goto('/juri/team');
      await page.waitForTimeout(1800);

      await expect(page.getByText(team.name)).toBeVisible({ timeout: 15000 });
      const row = page.locator('tbody tr').filter({ hasText: team.name }).first();
      const nilaiFinalBtn = row.getByRole('link', { name: /Nilai Final/i }).first();
      await expect(nilaiFinalBtn).toBeVisible({ timeout: 10000 });
      await nilaiFinalBtn.click();

      await page.waitForURL('**/juri/already-submitted/**', { timeout: 15000 });
      await page.waitForTimeout(1200);

      const finalScoreInputs = page.locator('input[type="number"]');
      await expect(finalScoreInputs.first()).toBeVisible({ timeout: 10000 });
      const count = await finalScoreInputs.count();

      for (let i = 0; i < count; i++) {
        await finalScoreInputs.nth(i).fill(team.scores[i % team.scores.length]);
        await page.waitForTimeout(200);
      }

      const finalFeedbackBox = page.locator('textarea[placeholder*="Notes"]').first();
      if (await finalFeedbackBox.isVisible()) {
        await finalFeedbackBox.fill(team.feedback);
        await page.waitForTimeout(300);
      }

      const submitFinalBtn = page.getByRole('button', { name: 'Submit', exact: true });
      await submitFinalBtn.scrollIntoViewIfNeeded();
      await submitFinalBtn.click();
      await page.waitForTimeout(500);

      const confirmFinalSubmitBtn = page.getByRole('button', { name: 'Ya, Submit' });
      await expect(confirmFinalSubmitBtn).toBeVisible({ timeout: 10000 });
      await confirmFinalSubmitBtn.click();

      await page.waitForURL('**/juri/already-submitted**', { timeout: 15000 });
      await page.waitForTimeout(1000);
      console.log(`✔ [Final] Tim ${team.name} berhasil dinilai dan dikunci!`);
    }

    // Buka menu Winner
    await page.goto('/juri/winner');
    await page.waitForTimeout(2000);

    // Log out Juri 1
    await page.locator('button:has-text("Log out")').filter({ visible: true }).first().click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TAHAP 6: ADMIN KALKULASI & PUBLIKASI JUARA (WINNER)
    // =========================================================================
    console.log('--- TAHAP 6: Admin Akumulasi & Publikasi Juara ---');
    await page.locator('input[type="email"]').fill('admin@seventx.zetech');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/admin/**', { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.goto('/admin/results');
    await page.waitForTimeout(1500);

    const compSelect2 = page.locator('select').first();
    await compSelect2.selectOption({ label: 'Software Development' });
    await page.waitForTimeout(800);

    const roundSelect2 = page.locator('select').nth(1);
    await roundSelect2.selectOption('FINAL');
    await page.waitForTimeout(800);

    const calcFinalBtn = page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i });
    await calcFinalBtn.click();
    await page.waitForTimeout(2500);

    await expect(page.getByText(/Juara 1 \(Pemenang\)/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Juara 2 \(Pemenang\)/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Juara 3 \(Pemenang\)/i).first()).toBeVisible({ timeout: 15000 });
    console.log('✔ Peringkat Juara 1, Juara 2, & Juara 3 berhasil terhitung dengan badge emerald pemenang!');
    await page.waitForTimeout(2000);

    const publishFinalBtn = page.getByRole('button', { name: /Publikasikan Hasil Final/i });
    await publishFinalBtn.scrollIntoViewIfNeeded();
    await expect(publishFinalBtn).toBeEnabled({ timeout: 15000 });
    await publishFinalBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Sudah Dipublikasikan/i).first()).toBeVisible({ timeout: 15000 });
    console.log('✔ Pengumuman Juara Resmi SEVENT X Berhasil Dipublikasikan!');

    // Log out Admin
    await page.locator('button:has-text("Log out")').filter({ visible: true }).first().click();
    await page.waitForURL('**/login', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // TAHAP 7: POV PESERTA JUARA 1 (FinSphere - Rizky)
    // =========================================================================
    console.log('--- TAHAP 7: POV Peserta Juara 1 (FinSphere - Rizky) ---');
    await page.locator('input[type="email"]').fill('rizky.finsphere@seventx.test');
    await page.locator('input[type="password"]').fill('rahasia123');
    await page.waitForTimeout(600);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/peserta/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(page.getByRole('heading', { name: /Selamat! Tim FinSphere Meraih Juara 1/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('FinSphere').first()).toBeVisible({ timeout: 15000 });
    console.log('✔ Dashboard Peserta FinSphere berhasil memuat status Juara 1 & rincian evaluasi juri!');

    await page.waitForTimeout(60000);
    console.log('🎉 SELURUH PENGUJIAN END-TO-END BERHASIL SELESAI DENGAN SEMPURNA!');
  });
});
