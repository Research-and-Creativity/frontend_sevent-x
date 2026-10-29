// Waktu disimpan sebagai ISO 8601 + offset WIB (bukan string tampilan),
// supaya tidak ambigu dan label bisa dibentuk otomatis.
//
// ⚠️ TEMPAT MENGUBAH JADWAL LOMBA.
// File ini adalah sumber jadwal untuk timeline landing dan fallback countdown.
// Sinkronkan ke database lewat backend agar validasi server juga menggunakan jadwal ini:
//   cd ../backend-seventx && npm run timeline:sync
// Fase REGISTRATION & UPLOAD_KARYA sengaja berbagi rentang tanggal yang sama:
// landing menggabungkannya jadi satu kartu "Pendaftaran & Submission Lomba".

export type TimelinePhase =
  | "REGISTRATION"
  | "UPLOAD_KARYA"
  | "PENJURIAN"
  | "FINAL";

export type TimelineEvent = {
  /** Dipakai backend saat sync ke tabel Timeline (enum TimelinePhase). */
  phase: TimelinePhase;
  start: string;
  end: string;
  /** Judul kartu di landing / nama tahap di dashboard peserta. */
  title: string;
  /** Deskripsi singkat yang tampil di dashboard peserta. */
  description: string;
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    phase: "REGISTRATION",
    start: "2026-10-01T00:00:00+07:00",
    end: "2026-11-30T23:59:59+07:00",
    title: "Pendaftaran & Submission Lomba",
    description: "Pendaftaran tim & submission karya (1 November - 30 November)",
  },
  {
    phase: "UPLOAD_KARYA",
    start: "2026-11-01T00:00:00+07:00",
    end: "2026-11-30T23:59:59+07:00",
    title: "Submission Karya",
    description: "Pengumpulan karya (1 November - 30 November)",
  },
  {
    phase: "PENJURIAN",
    start: "2026-12-01T00:00:00+07:00",
    end: "2026-12-04T23:59:59+07:00",
    title: "Penilaian Lomba",
    description: "Penilaian Lomba (1-4 Desember)",
  },
  // Enum TimelinePhase tidak punya fase pengumuman, jadi memakai PENJURIAN.
  // Aman: isPhaseActive hanya dipanggil untuk REGISTRATION & UPLOAD_KARYA.
  {
    phase: "PENJURIAN",
    start: "2026-12-05T00:00:00+07:00",
    end: "2026-12-05T23:59:59+07:00",
    title: "Pengumuman Finalis & TM Final",
    description: "Pengumuman finalis & technical meeting final (5 Desember)",
  },
  {
    phase: "FINAL",
    start: "2026-12-10T00:00:00+07:00",
    end: "2026-12-10T23:59:59+07:00",
    title: "Final Lomba & awarding lomba",
    description: "Final Lomba & awarding lomba (10 Desember)",
  },
];

// Deadline countdown = akhir fase registrasi (satu sumber dengan label timeline),
// supaya ubah jadwal di TIMELINE_EVENTS langsung mengubah countdown juga.
export const REGISTRATION_DEADLINE =
  TIMELINE_EVENTS.find((e) => e.phase === "REGISTRATION")?.end ??
  TIMELINE_EVENTS[0].end;
