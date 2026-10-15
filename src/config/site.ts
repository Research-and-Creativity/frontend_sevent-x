// Waktu disimpan sebagai ISO 8601 + offset WIB (bukan string tampilan),
// supaya tidak ambigu dan label bisa dibentuk otomatis.
export type TimelineEvent = {
  start: string;
  end: string;
  title: string;
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    start: "2026-10-08T00:00:00+07:00",
    end: "2026-12-31T23:59:59+07:00",
    title: "Registration",
  },
  {
    start: "2026-10-08T00:00:00+07:00",
    end: "2026-10-10T23:59:59+07:00",
    title: "Submission",
  },
  // Dua stage di bawah masih dummy (contoh) — ganti dengan jadwal asli.
  {
    start: "2026-10-15T00:00:00+07:00",
    end: "2026-11-05T23:59:59+07:00",
    title: "Preliminary Round",
  },
  {
    start: "2026-11-10T00:00:00+07:00",
    end: "2026-11-20T23:59:59+07:00",
    title: "Final Presentation",
  },
];

// Deadline countdown = akhir fase registrasi (satu sumber dengan label timeline),
// supaya ubah jadwal di TIMELINE_EVENTS langsung mengubah countdown juga.
export const REGISTRATION_DEADLINE = TIMELINE_EVENTS[0].end;
