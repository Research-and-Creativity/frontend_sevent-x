import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import path from 'node:path';

const BACKEND_DIR = path.resolve(process.cwd(), '../backend-seventx');
const BASE_URL = 'http://localhost:3000';

let currentStage = 'MEMULAI';

// Helper update HUD banner di layar browser
async function updateHUD(page, stageText, actionText) {
  currentStage = stageText;
  try {
    await page.evaluate(({ stage, action }) => {
      const badge = document.getElementById('hud-badge');
      const act = document.getElementById('hud-action');
      if (badge && stage) badge.textContent = stage;
      if (act && action) act.textContent = action;
    }, { stage: stageText, action: actionText });
  } catch (err) {
    // Abaikan jika halaman sedang reload/navigasi
  }
}

// Helper smooth mouse move & click dengan efek glowing pointer
async function smoothClick(page, locator, actionDesc) {
  await locator.scrollIntoViewIfNeeded();
  if (actionDesc) await updateHUD(page, currentStage, actionDesc);

  try {
    const handle = await locator.elementHandle();
    if (handle) {
      await handle.evaluate((el) => el.classList.add('seventx-highlight-target')).catch(() => {});
    }

    const box = await locator.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await page.mouse.move(targetX, targetY, { steps: 22 });
    }
    await page.waitForTimeout(400);
    await page.mouse.down();
    await page.waitForTimeout(140);
    await page.mouse.up();

    if (handle) {
      await handle.evaluate((el) => el.classList.remove('seventx-highlight-target')).catch(() => {});
    }
  } catch (err) {
    // Abaikan jika element handle terhancurkan karena perpindahan URL/navigasi
  }
  await page.waitForTimeout(700);
}

// Helper human typing dengan kursor bergerak ke input
async function humanType(page, locator, text, fieldDesc) {
  await locator.scrollIntoViewIfNeeded();
  if (fieldDesc) await updateHUD(page, currentStage, `Mengisi ${fieldDesc}...`);

  try {
    const handle = await locator.elementHandle();
    if (handle) {
      await handle.evaluate((el) => el.classList.add('seventx-highlight-target')).catch(() => {});
    }

    const box = await locator.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await page.mouse.move(targetX, targetY, { steps: 20 });
    }
    await page.waitForTimeout(250);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.up();

    await locator.fill('');
    await locator.pressSequentially(text, { delay: 40 });

    if (handle) {
      await handle.evaluate((el) => el.classList.remove('seventx-highlight-target')).catch(() => {});
    }
  } catch (err) {
    // Abaikan jika context terhancurkan
  }
  await page.waitForTimeout(400);
}

async function runDemo() {
  console.log('🔄 [1/8] Menyiapkan database & data demo lengkap (10 Tim + Tie Breaker + All POVs)...');
  execSync('node node_modules/tsx/dist/cli.mjs scripts/setup-live-demo-data.ts', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
  });

  console.log('🚀 [2/8] Membuka Google Chrome visual untuk monitoring...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    viewport: null, // Mengikuti ukuran jendela maksimal layar pengguna
  });

  // Inject Custom Cursor & Floating HUD pada setiap halaman yang dibuka
  await context.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('seventx-live-cursor')) return;

      const style = document.createElement('style');
      style.innerHTML = `
        #seventx-live-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.95);
          box-shadow: 0 0 16px 4px rgba(239, 68, 68, 0.75), inset 0 0 6px rgba(255, 255, 255, 0.8);
          pointer-events: none;
          z-index: 2147483647;
          transform: translate(-50%, -50%);
          transition: transform 0.08s ease, box-shadow 0.15s ease;
        }
        #seventx-live-cursor.clicking {
          transform: translate(-50%, -50%) scale(0.65);
          background: rgba(16, 185, 129, 0.95);
          box-shadow: 0 0 24px 8px rgba(16, 185, 129, 0.9), inset 0 0 8px #fff;
        }
        #seventx-live-hud {
          position: fixed;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2147483646;
          background: rgba(11, 15, 25, 0.94);
          border: 1px solid rgba(16, 185, 129, 0.6);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85), 0 0 20px rgba(16, 185, 129, 0.25);
          border-radius: 9999px;
          padding: 8px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f1f5f9;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 14px;
          font-weight: 500;
          backdrop-filter: blur(12px);
          pointer-events: none;
          transition: all 0.3s ease;
        }
        #seventx-live-hud .badge {
          background: #10b981;
          color: #022c22;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 9999px;
          letter-spacing: 0.05em;
        }
        #seventx-live-hud .action-text {
          color: #cbd5e1;
          font-size: 13px;
        }
        .seventx-highlight-target {
          outline: 2px solid #10b981 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 16px 3px rgba(16, 185, 129, 0.6) !important;
          transition: outline 0.15s, box-shadow 0.15s !important;
        }
      `;
      document.head.appendChild(style);

      const cursor = document.createElement('div');
      cursor.id = 'seventx-live-cursor';
      document.body.appendChild(cursor);

      const hud = document.createElement('div');
      hud.id = 'seventx-live-hud';
      hud.innerHTML = `
        <span class="badge" id="hud-badge">LIVE DEMO</span>
        <span id="hud-title" style="font-weight: 600; color: #fff;">SEVENT X Live Testing</span>
        <span style="color: #475569;">|</span>
        <span class="action-text" id="hud-action">Memulai pengujian...</span>
      `;
      document.body.appendChild(hud);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      window.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
      });

      window.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
      });
    });
  });

  const page = await context.newPage();

  // =========================================================================
  // TAHAP 1: LOGIN JURI 3 & PENILAIAN BABAK PENYISIHAN (3 TIM SATU PER SATU)
  // Termasuk AstraCode (85) & EduNova Labs (85) yang memperebutkan Posisi 5!
  // =========================================================================
  console.log('--- TAHAP 1: Juri 3 Penilaian Penyisihan Satu per Satu ---');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(1200);
  await updateHUD(page, 'TAHAP 1: JURI PENYISIHAN', 'Login sebagai Dewan Juri 3...');

  await humanType(page, page.locator('input[type="email"]'), 'juri.softdev.3@seventx.zetech', 'Email Juri 3');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password Juri 3');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login');

  await page.waitForURL('**/juri/dashboard', { timeout: 15000 });
  await page.waitForTimeout(1500);

  const prelimTeamsToScore = [
    {
      name: 'FinSphere',
      scores: ['95', '95', '95', '95', '95'],
      note: 'Arsitektur cloud native dan keamanan transaksi FinTech sangat matang.',
      feedback: 'Solusi platform inklusi finansial dengan UX yang sangat intuitif dan performa tinggi.',
    },
    {
      name: 'AstraCode',
      scores: ['85', '85', '85', '85', '85'],
      note: 'Solusi microservices rapi, performa throughput stabil.',
      feedback: 'Implementasi backend efisien dan terstruktur dengan baik.',
    },
    {
      name: 'EduNova Labs',
      scores: ['85', '85', '85', '85', '85'],
      note: 'Platform edukasi adaptif dengan UI responsif.',
      feedback: 'Inovasi pembelajaran interaktif yang potensial.',
    },
  ];

  for (let idx = 0; idx < prelimTeamsToScore.length; idx++) {
    const item = prelimTeamsToScore[idx];
    const stepLabel = `PENYISIHAN [${idx + 1}/3]`;

    await updateHUD(page, stepLabel, `Membuka antrean karya (Already Submitted)...`);
    await page.goto(`${BASE_URL}/juri/already-submitted`);
    await page.waitForTimeout(1800);

    await page.getByText(item.name).waitFor({ timeout: 15000 });
    const row = page.locator('tbody tr').filter({ hasText: item.name }).first();
    const detailLink = row.locator('a[href*="/already-submitted/"]').first();
    await smoothClick(page, detailLink, `Buka form penilaian Tim ${item.name}`);

    await page.waitForURL('**/juri/already-submitted/**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.first().waitFor({ timeout: 10000 });
    const count = await scoreInputs.count();

    for (let i = 0; i < count; i++) {
      const val = item.scores[i % item.scores.length];
      await humanType(page, scoreInputs.nth(i), val, `Kriteria #${i + 1} (${val})`);
    }

    const noteInputs = page.locator('input[placeholder*="Catatan untuk kriteria"], textarea[placeholder*="Catatan untuk kriteria"]');
    const noteCount = await noteInputs.count();
    for (let i = 0; i < noteCount; i++) {
      await humanType(page, noteInputs.nth(i), item.note, `Catatan Kriteria #${i + 1}`);
    }

    const feedbackBox = page.locator('textarea[placeholder*="Notes"]').first();
    if (await feedbackBox.isVisible()) {
      await humanType(page, feedbackBox, item.feedback, `Feedback Tim ${item.name}`);
    }

    const submitBtn = page.getByRole('button', { name: 'Submit', exact: true });
    await smoothClick(page, submitBtn, `Submit penilaian Tim ${item.name}`);

    const confirmSubmitBtn = page.getByRole('button', { name: 'Ya, Submit' });
    await confirmSubmitBtn.waitFor({ timeout: 10000 });
    await smoothClick(page, confirmSubmitBtn, `Konfirmasi Nilai ${item.name}`);

    await page.waitForURL('**/juri/already-submitted**', { timeout: 15000 });
    await page.waitForTimeout(1200);
    console.log(`✔ [Penyisihan] Tim ${item.name} berhasil dinilai dan dikunci!`);
  }

  await updateHUD(page, 'TAHAP 1: JURI PENYISIHAN', 'Melihat seluruh karya yang telah dinilai di menu Judged...');
  await page.goto(`${BASE_URL}/juri/judged`);
  await page.waitForTimeout(2500);
  console.log('✔ Seluruh karya penyisihan berhasil dinilai dan tampil di menu Judged!');

  await updateHUD(page, 'TAHAP 1: JURI PENYISIHAN', 'Logout akun Juri 3...');
  const logoutBtn = page.locator('button:has-text("Log out")').filter({ visible: true }).first();
  await smoothClick(page, logoutBtn, 'Klik tombol Log out');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(1200);

  // =========================================================================
  // TAHAP 2: ADMIN ACCUMULATION & TIE BREAKER POSISI 5 (10 TIM PENYISIHAN)
  // =========================================================================
  console.log('--- TAHAP 2: Admin Akumulasi & Tie-Breaker Posisi 5 ---');
  await updateHUD(page, 'TAHAP 2: ADMIN REKAPITULASI', 'Login sebagai Administrator...');
  await humanType(page, page.locator('input[type="email"]'), 'admin@seventx.zetech', 'Email Admin');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password Admin');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login Admin');

  await page.waitForURL('**/admin/**', { timeout: 15000 });
  await page.waitForTimeout(1200);

  await updateHUD(page, 'TAHAP 2: ADMIN REKAPITULASI', 'Membuka menu Results babak Penyisihan (10 Tim)...');
  await page.goto(`${BASE_URL}/admin/results`);
  await page.waitForTimeout(1800);

  const compSelect = page.locator('select').first();
  await compSelect.selectOption({ label: 'Software Development' });
  await page.waitForTimeout(1000);

  const roundSelect = page.locator('select').nth(1);
  await roundSelect.selectOption('PENYISIHAN');
  await page.waitForTimeout(1000);

  const calcBtn = page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i });
  await smoothClick(page, calcBtn, 'Hitung Akumulasi Skor 10 Tim Penyisihan');
  await page.waitForTimeout(3000);

  await page.getByText(/Hasil Ranking Skor Akumulasi/i).waitFor({ timeout: 15000 });

  // Tampilkan keterangan tie breaker posisi 5 & 6
  await updateHUD(
    page,
    'TAHAP 2: TIE-BREAKER POSISI 5',
    'Posisi 5: AstraCode (85.00) vs Posisi 6: EduNova Labs (85.00) -> AstraCode Unggul Waktu Submit!'
  );
  console.log('✔ Tabel peringkat memuat tie-breaker posisi 5: AstraCode vs EduNova Labs');
  await page.waitForTimeout(4000);

  const publishPrelimBtn = page.getByRole('button', { name: /Publikasikan Hasil Penyisihan/i });
  await smoothClick(page, publishPrelimBtn, 'Publikasikan Pengumuman 5 Finalis');
  await page.waitForTimeout(2500);
  await page.getByText(/Sudah Dipublikasikan/i).first().waitFor({ timeout: 15000 });
  console.log('✔ Pengumuman finalis resmi dipublikasikan ke peserta!');

  await updateHUD(page, 'TAHAP 2: ADMIN REKAPITULASI', 'Mengaktifkan Babak Final untuk kompetisi...');
  const switchFinalBtn = page.getByRole('button', { name: 'Final', exact: true }).first();
  await smoothClick(page, switchFinalBtn, 'Klik tab Babak Final');

  const confirmRoundModal = page.getByRole('button', { name: /Ya, Aktifkan Babak Final/i });
  await confirmRoundModal.waitFor({ timeout: 10000 });
  await smoothClick(page, confirmRoundModal, 'Konfirmasi Aktifkan Babak Final');
  await page.waitForTimeout(2500);
  await page.getByText(/Babak Final/i).first().waitFor({ timeout: 15000 });
  console.log('✔ Babak aktif kompetisi resmi diubah ke Babak Final!');

  await updateHUD(page, 'TAHAP 2: ADMIN REKAPITULASI', 'Logout Administrator...');
  const adminLogoutBtn = page.locator('button:has-text("Log out")').filter({ visible: true }).first();
  await smoothClick(page, adminLogoutBtn, 'Klik tombol Log out');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(1200);

  // =========================================================================
  // TAHAP 3: POV PESERTA LOLOS FINALIS VIA TIE-BREAKER (AstraCode - Rank 5)
  // =========================================================================
  console.log('--- TAHAP 3: POV Peserta Lolos Finalis (AstraCode - Dennis) ---');
  await updateHUD(page, 'POV PESERTA: LOLOS FINALIS (RANK 5)', 'Login sebagai Leader Tim AstraCode...');
  await humanType(page, page.locator('input[type="email"]'), 'dennis.astracode@seventx.test', 'Email AstraCode');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password AstraCode');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login Peserta');

  await page.waitForURL('**/peserta/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.getByRole('heading', { name: /Selamat! Tim AstraCode Lolos ke Babak Final/i }).waitFor({ timeout: 15000 });
  await updateHUD(page, 'POV PESERTA: LOLOS FINALIS', 'Melihat pesan kelolosan & keterangan tie-breaker: Unggul waktu submit (14:00 WIB)!');
  console.log('✔ Dashboard AstraCode menampilkan status Lolos Finalis & keterangan tie-breaker!');

  // Jeda 8 detik agar pengguna dapat membaca pesan lolos finalis dan keterangan tie breaker
  await page.waitForTimeout(8000);

  await updateHUD(page, 'POV PESERTA: LOLOS FINALIS', 'Logout AstraCode...');
  const astraLogoutBtn = page.locator('button:has-text("Log out")').filter({ visible: true }).first();
  await smoothClick(page, astraLogoutBtn, 'Klik tombol Log out');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(1200);

  // =========================================================================
  // TAHAP 4: POV PESERTA TIDAK LOLOS FINALIS VIA TIE-BREAKER (EduNova Labs - Rank 6)
  // =========================================================================
  console.log('--- TAHAP 4: POV Peserta Tidak Lolos Finalis (EduNova Labs - Fajar) ---');
  await updateHUD(page, 'POV PESERTA: TIDAK LOLOS (RANK 6)', 'Login sebagai Leader Tim EduNova Labs...');
  await humanType(page, page.locator('input[type="email"]'), 'fajar.edunova@seventx.test', 'Email EduNova Labs');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password EduNova Labs');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login Peserta');

  await page.waitForURL('**/peserta/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.getByRole('heading', { name: /Tim EduNova Labs Belum Lolos ke Babak Final/i }).waitFor({ timeout: 15000 });
  await updateHUD(page, 'POV PESERTA: TIDAK LOLOS', 'Melihat pesan belum lolos & keterangan tie-breaker: Kalah waktu submit (16:30 WIB)!');
  console.log('✔ Dashboard EduNova Labs menampilkan status Belum Lolos & keterangan tie-breaker!');

  // Jeda 8 detik agar pengguna dapat membaca pesan belum lolos dan keterangan tie breaker
  await page.waitForTimeout(8000);

  await updateHUD(page, 'POV PESERTA: TIDAK LOLOS', 'Logout EduNova Labs...');
  const edunovaLogoutBtn = page.locator('button:has-text("Log out")').filter({ visible: true }).first();
  await smoothClick(page, edunovaLogoutBtn, 'Klik tombol Log out');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(1200);

  // =========================================================================
  // TAHAP 5: LOGIN JURI 1 & PENILAIAN BABAK FINAL (FINALIS SATU PER SATU)
  // =========================================================================
  console.log('--- TAHAP 5: Juri 1 Penilaian Babak Final Satu per Satu ---');
  await updateHUD(page, 'TAHAP 5: JURI BABAK FINAL', 'Login sebagai Dewan Juri 1 babak final...');
  await humanType(page, page.locator('input[type="email"]'), 'juri.softdev.1@seventx.zetech', 'Email Juri 1');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password Juri 1');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login Juri 1');

  await page.waitForURL('**/juri/**', { timeout: 15000 });
  await page.waitForTimeout(1200);

  const finalTeamsToScore = [
    {
      name: 'FinSphere',
      scores: ['97', '97', '97', '97'],
      feedback: 'Presentasi babak final memukau dewan juri. Live demo berjalan tanpa celah dan kesiapan komersialisasi produk sangat matang.',
    },
    {
      name: 'AstraCode',
      scores: ['85', '85', '85', '85'],
      feedback: 'Presentasi dan simulasi prototipe microservices berjalan stabil di babak final.',
    },
  ];

  for (let idx = 0; idx < finalTeamsToScore.length; idx++) {
    const item = finalTeamsToScore[idx];
    const stepLabel = `FINAL [${idx + 1}/2]`;

    await updateHUD(page, stepLabel, `Membuka daftar 5 finalis resmi (/juri/team)...`);
    await page.goto(`${BASE_URL}/juri/team`);
    await page.waitForTimeout(2000);

    await page.getByText(item.name).waitFor({ timeout: 15000 });
    const row = page.locator('tbody tr').filter({ hasText: item.name }).first();
    const nilaiFinalBtn = row.getByRole('link', { name: /Nilai Final/i }).first();
    await smoothClick(page, nilaiFinalBtn, `Nilai Final Tim ${item.name}`);

    await page.waitForURL('**/juri/already-submitted/**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    const finalScoreInputs = page.locator('input[type="number"]');
    await finalScoreInputs.first().waitFor({ timeout: 10000 });
    const count = await finalScoreInputs.count();

    for (let i = 0; i < count; i++) {
      const val = item.scores[i % item.scores.length];
      await humanType(page, finalScoreInputs.nth(i), val, `Kriteria Final #${i + 1} (${val})`);
    }

    const finalFeedbackBox = page.locator('textarea[placeholder*="Notes"]').first();
    if (await finalFeedbackBox.isVisible()) {
      await humanType(page, finalFeedbackBox, item.feedback, `Feedback Final Tim ${item.name}`);
    }

    const submitFinalBtn = page.getByRole('button', { name: 'Submit', exact: true });
    await smoothClick(page, submitFinalBtn, `Submit Nilai Final Tim ${item.name}`);

    const confirmFinalSubmitBtn = page.getByRole('button', { name: 'Ya, Submit' });
    await confirmFinalSubmitBtn.waitFor({ timeout: 10000 });
    await smoothClick(page, confirmFinalSubmitBtn, `Konfirmasi Nilai Final ${item.name}`);

    await page.waitForURL('**/juri/already-submitted**', { timeout: 15000 });
    await page.waitForTimeout(1200);
    console.log(`✔ [Final] Tim ${item.name} berhasil dinilai dan dikunci!`);
  }

  await updateHUD(page, 'TAHAP 5: JURI BABAK FINAL', 'Melihat rekapitulasi penilaian final di menu Winner...');
  await page.goto(`${BASE_URL}/juri/winner`);
  await page.waitForTimeout(2500);
  console.log('✔ Seluruh finalis berhasil dinilai oleh dewan juri babak final!');

  await updateHUD(page, 'TAHAP 5: JURI BABAK FINAL', 'Logout Juri 1...');
  const juri1LogoutBtn = page.locator('button:has-text("Log out")').filter({ visible: true }).first();
  await smoothClick(page, juri1LogoutBtn, 'Klik tombol Log out');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(1200);

  // =========================================================================
  // TAHAP 6: ADMIN KALKULASI & PUBLIKASI JUARA (WINNER)
  // =========================================================================
  console.log('--- TAHAP 6: Admin Akumulasi & Publikasi Juara ---');
  await updateHUD(page, 'TAHAP 6: PUBLIKASI JUARA', 'Login Administrator untuk penentuan juara...');
  await humanType(page, page.locator('input[type="email"]'), 'admin@seventx.zetech', 'Email Admin');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password Admin');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login Admin');

  await page.waitForURL('**/admin/**', { timeout: 15000 });
  await page.waitForTimeout(1200);

  await updateHUD(page, 'TAHAP 6: PUBLIKASI JUARA', 'Membuka menu Results babak Final...');
  await page.goto(`${BASE_URL}/admin/results`);
  await page.waitForTimeout(1800);

  const compSelect2 = page.locator('select').first();
  await compSelect2.selectOption({ label: 'Software Development' });
  await page.waitForTimeout(1000);

  const roundSelect2 = page.locator('select').nth(1);
  await roundSelect2.selectOption('FINAL');
  await page.waitForTimeout(1000);

  const calcFinalBtn = page.getByRole('button', { name: /Hitung Akumulasi Skor Juri/i });
  await smoothClick(page, calcFinalBtn, 'Hitung Akumulasi Skor Peringkat Juara');
  await page.waitForTimeout(3000);

  await page.getByText(/Juara 1 \(Pemenang\)/i).first().waitFor({ timeout: 15000 });
  await page.getByText(/Juara 2 \(Pemenang\)/i).first().waitFor({ timeout: 15000 });
  await page.getByText(/Juara 3 \(Pemenang\)/i).first().waitFor({ timeout: 15000 });
  await updateHUD(page, 'TAHAP 6: PUBLIKASI JUARA', 'Podium: Juara 1 (FinSphere), Juara 2 (Cortex AI), & Juara 3 (AgroTech Nusantara)!');
  console.log('✔ Peringkat Juara 1, Juara 2, dan Juara 3 berhasil terhitung dengan badge emerald pemenang!');
  await page.waitForTimeout(3000);

  const publishFinalBtn = page.getByRole('button', { name: /Publikasikan Hasil Final/i });
  await smoothClick(page, publishFinalBtn, 'Publikasikan Pengumuman Juara Resmi SEVENT X');
  await page.waitForTimeout(2500);
  await page.getByText(/Sudah Dipublikasikan/i).first().waitFor({ timeout: 15000 });
  console.log('✔ Pengumuman Juara Resmi SEVENT X Berhasil Dipublikasikan!');

  await updateHUD(page, 'TAHAP 6: PUBLIKASI JUARA', 'Logout Administrator...');
  const adminLogoutBtn2 = page.locator('button:has-text("Log out")').filter({ visible: true }).first();
  await smoothClick(page, adminLogoutBtn2, 'Klik tombol Log out');
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.waitForTimeout(1200);

  // =========================================================================
  // TAHAP 7: POV PESERTA JUARA 1 (FinSphere - Rizky)
  // =========================================================================
  console.log('--- TAHAP 7: POV Peserta Juara 1 (FinSphere - Rizky) ---');
  await updateHUD(page, 'TAHAP 7: DASHBOARD PEMENANG', 'Login sebagai Leader Tim FinSphere (Juara 1)...');
  await humanType(page, page.locator('input[type="email"]'), 'rizky.finsphere@seventx.test', 'Email Leader FinSphere');
  await humanType(page, page.locator('input[type="password"]'), 'rahasia123', 'Password Leader FinSphere');
  await smoothClick(page, page.locator('button[type="submit"]'), 'Klik tombol Login Peserta');

  await page.waitForURL('**/peserta/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2500);

  await page.getByRole('heading', { name: /Selamat! Tim FinSphere Meraih Juara 1/i }).waitFor({ timeout: 15000 });
  await page.getByText('FinSphere').first().waitFor({ timeout: 15000 });
  console.log('✔ Dashboard Peserta FinSphere berhasil memuat status Juara 1 & rincian evaluasi juri!');

  await updateHUD(page, '🏆 DEMO SELESAI', 'Tim FinSphere Berhasil Meraih Juara 1 Software Development!');
  console.log('🎉 Menampilkan dashboard pemenang selama 60 detik agar dapat dimonitoring...');

  // Jeda 60 detik agar pengguna dapat puas memonitoring tampilan akhir dashboard juara
  await page.waitForTimeout(60000);

  console.log('🏁 Demonstrasi visual lengkap (All POVs) selesai dengan sempurna!');
  await browser.close();
}

runDemo().catch((err) => {
  console.error('❌ Error dalam demo visual:', err);
  process.exit(1);
});
