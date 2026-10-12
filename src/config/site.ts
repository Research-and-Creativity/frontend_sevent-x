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
];

// Deadline default mengikuti akhir fase registrasi supaya selalu sinkron
// dengan label timeline. Bisa dioverride lewat env bila perlu.
export const REGISTRATION_DEADLINE =
  process.env.NEXT_PUBLIC_REGISTRATION_DEADLINE ?? TIMELINE_EVENTS[0].end;
