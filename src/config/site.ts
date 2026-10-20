// Waktu disimpan sebagai ISO 8601 + offset WIB (bukan string tampilan),
// supaya tidak ambigu dan label bisa dibentuk otomatis.
export type TimelineEvent = {
  start: string;
  end: string;
  title: string;
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    start: "2026-10-01T00:00:00+07:00",
    end: "2026-11-30T23:59:59+07:00",
    title: "Pendaftaran & Submission Lomba",
  },
  {
    start: "2026-12-01T00:00:00+07:00",
    end: "2026-12-04T23:59:59+07:00",
    title: "Penilaian Lomba",
  },
  {
    start: "2026-12-05T00:00:00+07:00",
    end: "2026-12-05T23:59:59+07:00",
    title: "Pengumuman Finalis & TM Final",
  },
  {
    start: "2026-12-10T00:00:00+07:00",
    end: "2026-12-10T23:59:59+07:00",
    title: "Final Lomba & awarding lomba",
  },
];

// Deadline countdown = akhir fase registrasi (satu sumber dengan label timeline),
// supaya ubah jadwal di TIMELINE_EVENTS langsung mengubah countdown juga.
export const REGISTRATION_DEADLINE = TIMELINE_EVENTS[0].end;
