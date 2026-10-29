export type LandingTimelineEvent = {
  start: string;
  end: string;
  title: string;
  phase: string;
};

// Urutan fase saat beberapa fase berbagi rentang tanggal yang sama.
// REGISTRATION menang supaya kartu tampil sebagai "Pendaftaran & Submission Lomba"
// (fase REGISTRATION dan UPLOAD_KARYA memang dibuat satu rentang di site.ts).
const PHASE_PRIORITY: Record<string, number> = {
  REGISTRATION: 0,
  UPLOAD_KARYA: 1,
  PENJURIAN: 2,
  FINAL: 3,
};

/**
 * Gabungkan fase dengan tanggal mulai/akhir identik menjadi satu kartu,
 * lalu urutkan berdasarkan tanggal. Dipakai untuk data API maupun fallback
 * statis dari site.ts, supaya landing selalu tampil seragam.
 */
export function mergeLandingEvents<T extends LandingTimelineEvent>(
  events: T[]
): T[] {
  const byRange = new Map<string, T>();
  for (const event of events) {
    const key = `${event.start}|${event.end}`;
    const current = byRange.get(key);
    const beats =
      !current ||
      (PHASE_PRIORITY[event.phase] ?? 99) < (PHASE_PRIORITY[current.phase] ?? 99);
    if (beats) byRange.set(key, event);
  }

  return Array.from(byRange.values()).sort((a, b) =>
    a.start.localeCompare(b.start)
  );
}
