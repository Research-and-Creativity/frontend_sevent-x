# 🧪 Panduan Testing SEVENT X

Dokumen ini untuk uji manual seluruh fitur dari sisi **Peserta**, **Juri**, dan **Admin**.

- **Aplikasi (FE):** http://localhost:3000
- **API docs (Swagger):** http://localhost:5000/api/docs
- **Database:** PostgreSQL `sevent_x_db` @ `localhost:5432` (via Laragon)

---

## 0. Prasyarat

Pastikan tiga komponen berikut hidup:

| Komponen | Cara cek | Cara jalankan |
|---|---|---|
| PostgreSQL | port `5432` ada listener | Laragon → Start All |
| Backend (:5000) | `curl http://127.0.0.1:5000/api/health` → 200 | di `backend-seventx`: `npm run dev` |
| Frontend (:3000) | buka http://localhost:3000 | di `frontend-seventx`: `npm run dev` |

> Catatan: gunakan `127.0.0.1`, bukan `localhost` (resolusi `::1` kadang tidak nyambung).

---

## 1. Akun test

Password **semua** akun test: `rahasia123`

| Peran | Email | Status / Catatan |
|---|---|---|
| **Admin** | `admin@seventx.test` | (ada juga `admin@gmail.com`) |
| **Juri 1** | `juri@seventx.test` | Sudah nilai sebagian; sisa yang belum dinilai tersedia |
| **Juri 2** | `juri2@seventx.test` | Sudah menilai semua tim dummy |
| Peserta — Test Alpha | `leader@seventx.test` | Tim **REVIEW** → untuk tes verifikasi admin |
| Peserta — Test Beta | `beta@seventx.test` | Tim **REVIEW**, tanpa pembayaran & submission |
| Peserta — Test Delta | `delta@seventx.test` | APPROVE, finalis #2 |
| Peserta — Test Echo | `echo@seventx.test` | APPROVE, finalis #4 |
| Peserta — Test Foxtrot | `foxtrot@seventx.test` | APPROVE, finalis #1 |
| Peserta — Test Golf | `golf@seventx.test` | APPROVE, finalis #5 |
| Peserta — Test Hotel | `hotel@seventx.test` | APPROVE, finalis #3 |
| Peserta — Test India | `india@seventx.test` | APPROVE, **#6 — TIDAK lolos** |

Anggota tim pakai pola `nama.member@seventx.test` (cth: `delta.member@seventx.test`).

---

## 2. Alur utama end-to-end (dari nol)

Alur "satu karya dari daftar sampai menang". Ikuti berurutan, ganti login tiap tahap.

### 2.1 Peserta mendaftar & lengkapi profil
1. Buka `/register` → daftar akun baru (role otomatis **PESERTA**) → masuk `/peserta/dashboard`.
2. Buka **Profile** `/peserta/profile` → isi 5 field wajib: **institution, phone, birthDate, domicile, discordId** → **Save**.
   - ⚠️ Coba simpan kosong dulu → harus ditolak (profil belum lengkap).

### 2.2 Peserta buat/join tim
1. Buka **Competition** `/peserta/competition` → pilih lomba (**Software Development** atau **UI/UX Competition**) → **Create new Team** (atau **Join Team** pakai kode undangan).
2. Catat **invite code** di `/peserta/team`.
   - ⚠️ Kalau profil belum lengkap → tombol jadi **Complete Profile First** (ditolak).

> Ada 2 kompetisi: **Software Development** (`software-development`) dan **UI/UX Competition** (`ui-ux`). Data seed (tim & juri) berada di Software Development.

### 2.3 Peserta upload dokumen & pembayaran
1. `/peserta/profile` → **Verification Document**: upload 4 file (**Twibbon, Post Story, Student ID, Follow Instagram**). Ini upload file nyata ke Google Drive.
   - Belum punya twibbon? Di kartu **Twibbon** ada tautan **"Bikin di sini"** → halaman `/twibbon` (upload foto → sesuaikan → download PNG), lalu upload hasilnya.
2. `/peserta/team` → upload **Payment Proof**.
3. Boleh juga isi link Twibbon/Share Story lewat halaman Team.

### 2.4 Peserta submit karya
1. Buka `/peserta/competition/software-development` → isi **Product Information** (judul, deskripsi, GitHub, video demo, link deploy, file proposal) → **Submit All**.

### 2.5 Admin verifikasi → tim jadi APPROVE
1. Login **admin** → **Registered Team** `/admin/teams` → klik tim → `/admin/teams/{id}`.
2. Verifikasi tiap dokumen anggota (Approve/Reject) dan **Payment Proof**.
3. ⚠️ **Approve payment akan otomatis meng-APPROVE tim** → tim masuk antrean juri.
4. (Coba juga **Reject** satu dokumen → login peserta lagi → statusnya "perlu revisi".)

### 2.6 Juri menilai
1. Login **juri** → **Already Submitted** `/juri/already-submitted` → buka karya → isi nilai tiap kriteria + catatan → **Submit**.
2. Tim pindah ke **Judged** `/juri/judged` → buka → beri rekomendasi **Finalist/Waitlist**.

### 2.7 Admin hitung & publikasikan finalis
1. Login **admin** → **Results** `/admin/results` → pilih kompetisi → **Calculate** → **Publish**.
2. Ini mengisi tabel pengumuman: **top-5 = finalis**.

### 2.8 Peserta lihat pengumuman
1. Login peserta → **Announcements** `/peserta/announcements` → muncul banner hasil ("LOLOS SEBAGAI FINALIS" / tidak).

> 💡 **Jalan pintas:** tidak perlu mengulang dari nol. Test Alpha/Beta sudah REVIEW (untuk tes verifikasi admin), dan 6 tim dummy sudah APPROVE (untuk tes juri & finalis).

---

## 3. Checklist per peran

### 🟦 Peserta

| Halaman | URL | Yang dites |
|---|---|---|
| Landing | `/` | Navbar anchor + link Twibbon, hero, CTA daftar, FAQ accordion, countdown, **section Competition (ambil dari API)** |
| Twibbon | `/twibbon` | Upload foto → sesuaikan → download PNG + copy caption |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` | Login, daftar, lupa & reset password |
| Dashboard | `/peserta/dashboard` | Welcome, ringkasan profil/kompetisi/pengumuman, timeline |
| Profile | `/peserta/profile` | Edit data, ganti password, upload 4 dokumen |
| Competition | `/peserta/competition` | Pilih lomba, buat/join tim |
| Competition detail | `/peserta/competition/software-development` | Submission & payment |
| Team | `/peserta/team` | Anggota, invite code, transfer leader, kick, keluar/bubarkan |
| Announcements | `/peserta/announcements` | Filter All/Important/Info/Update + hasil lomba |

### 🟪 Juri

Sidebar: **PRELIMINARY ROUND** (Already Submitted, Judged) & **FINAL ROUND** (List Finalists, Winner).

| Halaman | URL | Yang dites |
|---|---|---|
| Dashboard | `/juri/dashboard` | Kartu submitted/judged/time, top-3 skor |
| Already Submitted | `/juri/already-submitted` | Daftar yang **belum** dinilai; cari/filter |
| Form penilaian | `/juri/already-submitted/{id}` | Isi nilai per kriteria + catatan → Submit |
| Judged | `/juri/judged` | Daftar yang **sudah** dinilai |
| Detail Judged | `/juri/judged/{id}` | Lihat skor + beri rekomendasi |
| List Finalists | `/juri/team` | Daftar finalis resmi (dari hasil hitung admin) |
| Winner | `/juri/winner` | Top-3 skor tertinggi |

> Gunakan `juri@seventx.test` untuk melihat tim yang **belum dinilai**; `juri2@seventx.test` untuk kondisi **semua sudah dinilai**.

### 🟧 Admin

Sidebar: **Overview** · **Registered Team** · **Verified Team** · **Web Information**.

| Halaman | URL | Yang dites |
|---|---|---|
| Dashboard | `/admin/dashboard` | Ringkasan (⚠️ masih data statis) |
| Registered Team | `/admin/teams` | Cari/filter/urut tim → klik detail |
| Detail tim | `/admin/teams/{id}` | Verifikasi dokumen & payment, approve/reject |
| Verified Team | `/admin/documents` | Daftar tim terverifikasi |
| Judges Management | `/admin/judges` | Cari user, tugaskan juri ke kompetisi, hapus |
| Results | `/admin/results` | **Calculate** & **Publish** finalis |
| Timeline | `/admin/timeline` | Tambah tahapan lomba |
| Competitions | `/admin/competitions` | Buat/edit kompetisi & track |
| News | `/admin/news` | Publikasi/hapus berita |
| Gallery | `/admin/gallery` (+`/add`, `/{id}`) | ⚠️ belum ada backend |
| Announcement | `/admin/announcement` (+`/create`) | ⚠️ belum ada backend |

---

## 4. Halaman yang belum tersambung backend

Supaya tidak bingung kenapa "tidak berfungsi":

- `/` (landing) — sebagian besar hardcoded, **kecuali section Competition** yang sudah ambil data dari `GET /api/competitions` (fallback ke data statis bila API kosong).
- `/admin/dashboard` — data dummy statis.
- `/admin/gallery`, `/admin/gallery/add`, `/admin/gallery/{id}` — tanpa API.
- `/admin/announcement`, `/admin/announcement/create` — tanpa API (fungsi pengumuman nyata ada di `/admin/results`).
- `/admin/news`, `/admin/competitions`, `/admin/judges` — punya API, tapi menampilkan data contoh saat kosong.

---

## 5. Uji negatif / edge case

- **Profil gate:** buat/join tim tanpa 5 field → ditolak.
- **Upload:** dokumen/payment > 5MB, submission > 10MB → error.
- **Timeline:** semua tanggal sudah lewat → checklist eligibilitas menampilkan *"timeline tidak aktif"* (wajar, bukan bug).
- **Role guard:** buka `/juri/...` sebagai peserta, atau `/admin/...` sebagai juri → ditendang ke `/login`.
- **Password salah:** login salah → "Email atau password salah".
- **Token kedaluwarsa:** auto refresh; kalau gagal → balik ke `/login`.
- **Preview dokumen dummy:** link dokumen tim seed memakai URL Drive palsu → saat diklik **404**. Untuk tes preview, pakai hasil upload asli (langkah 2.3).

---

## 6. Bukti alur API (sudah diverifikasi)

Alur verifikasi admin dijalankan lewat API nyata (bukan simulasi) terhadap **Test Alpha**:

```
1. (Sebelum) Test Alpha status=REVIEW, paymentProof=REVIEW
   Alpha Leader : KTM=APPROVE, TWIBBON=APPROVE, SHARE_STORY=APPROVE, INSTAGRAM_FOLLOW=REVIEW

2. Admin approve dokumen yang tersisa
   PATCH /api/admin/user-documents/{id}/status { "status": "APPROVE" }
   → Alpha Leader INSTAGRAM_FOLLOW : HTTP 200

3. Admin approve bukti pembayaran
   PATCH /api/teams/{id}/payment-proof/status { "status": "APPROVE" }
   → HTTP 200  (tim otomatis jadi APPROVE)

4. (Sesudah) Test Alpha status=APPROVE, paymentProof=APPROVE
   Semua anggota: 4/4 dokumen APPROVE

5. Tim muncul di antrean juri
   GET /api/judge/submissions  (sebagai juri@seventx.test)
   → Test Alpha ikut muncul di daftar

6. Checklist eligibilitas (peserta): semua true
   GET /api/teams/me/eligibility  (sebagai leader@seventx.test)
   → teamApproved=true, paymentApproved=true,
     semua dokumen anggota allDocumentsApproved=true
   → isEligible=false HANYA karena timelineActive=false (timeline kompetisi sudah lewat)
```

Anda bisa mengulang alur yang sama lewat UI: `/admin/teams/{id}` → approve dokumen & payment.

---

## 7. Reset data & tips

- **Reset semua data test** (kembali bersih): di folder `backend-seventx`:
  ```
  npm run seed:test-data
  ```
  Aman & idempotent (tidak menyentuh data produksi). Ini akan mengosongkan daftar finalis lagi.
- **Setelah reset**, untuk mengisi **List Finalists** lagi: `/admin/results` → **Calculate** → **Publish**.
- **Ganti peran:** klik **Log out** di sidebar lalu login akun lain.
- **Tes API langsung:** buka Swagger `http://localhost:5000/api/docs`.
- **Contoh hasil paling kontras:** `india@` (tidak lolos) vs `delta@` (finalis).
