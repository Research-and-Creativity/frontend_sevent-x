# SEVENT X 2026 - National Tech Competition Platform (Frontend)

Platform web frontend resmi kompetisi nasional **SEVENT X 2026**, dikembangkan menggunakan **Next.js 16 (App Router)**, **Tailwind CSS v4**, **TypeScript**, dan **Space Grotesk** Typography.

---

## 🚀 Fitur Utama System Architecture

1. **Portal Peserta (`/peserta/*`)**:
   - **Overview Dashboard**: Status kompetisi, ringkasan tim, dan timeline tahapan lomba.
   - **Team Management**: Buat tim baru, gabung tim via kode invite, upload bukti pembayaran, dan kelola dokumen anggota.
   - **Submission Console**: Form upload berkas proposal (PDF), repository GitHub, video demo, dan tautan karya.
   - **Announcements**: List berita resmi dengan filter kategori (*Important*, *Info*, *Update*).
   - **Account Settings & FAQ**: Edit profil, ganti password, verifikasi KTM/KTP, dan accordion FAQ.

2. **Portal Juri (`/juri/*`)**:
   - **Judge Dashboard Overview**: Stat cards kelengkapan review, assigned submissions table, dan jadwal penjurian.
   - **Participant Directory**: Pencarian & filter status karya peserta (*Scored* / *Pending*).
   - **Evaluation Console**: Panel penilaian real-time dengan slider 4 kriteria, kalkulasi otomatis *Live Mathematical Average Total Score*, catatan umpan balik, dan penguncian skor setelah dikirim.

3. **Portal Admin Control Panel (`/admin/*`)**:
   - **Teams & Payment Verification**: Approve/Reject pembayaran tim.
   - **User Documents Verification**: Verifikasi dokumen administrasi KTM, KTP, dan Twibbon.
   - **Competitions & Timeline**: Kelola cabang lomba & milestone deadline.
   - **News & Announcement Publisher**: Konsolidasi skor juri & pengumuman pemenang resmi.

---

## 🌐 Environment Variables (Vercel Deployment)

Saat melakukan deployment ke **Vercel Dashboard**, pastikan menambahkan Environment Variable berikut:

| Variable | Description | Example (Production) |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL Backend Production REST API | `https://api.seventx.id` |

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Jalankan Dev Server
npm run dev

# 3. Test Production Build
npm run build
```
