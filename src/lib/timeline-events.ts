import type { Competition, Timeline } from "@/types/api";

export type LandingTimelineEvent = {
  start: string;
  end: string;
  title: string;
};

// Urutan fase saat beberapa fase berbagi rentang tanggal yang sama.
// REGISTRATION menang supaya kartu tampil sebagai "Pendaftaran & Submission Lomba"
// (fase REGISTRATION dan UPLOAD_KARYA memang dibuat satu rentang di backend).
const PHASE_PRIORITY: Record<string, number> = {
  REGISTRATION: 0,
  UPLOAD_KARYA: 1,
  PENJURIAN: 2,
  FINAL: 3,
};

/**
 * Susun daftar event timeline landing dari data API (GET /api/competitions,
 * field `timelines`). Sumber kebenaran jadwal = database, bukan site.ts.
 *
 * Mengembalikan [] bila belum ada data — pemanggil yang memutuskan fallback.
 */
export function buildLandingTimeline(
  competitions?: Competition[] | null
): LandingTimelineEvent[] {
  const rows: Timeline[] = (competitions ?? []).flatMap((c) => c.timelines ?? []);
  if (rows.length === 0) return [];

  // Fase dengan tanggal mulai/akhir identik ditampilkan sebagai satu kartu.
  const byRange = new Map<string, Timeline>();
  for (const row of rows) {
    const key = `${row.startDate}|${row.endDate}`;
    const current = byRange.get(key);
    const beats =
      !current ||
      (PHASE_PRIORITY[row.phase] ?? 99) < (PHASE_PRIORITY[current.phase] ?? 99);
    if (beats) byRange.set(key, row);
  }

  return Array.from(byRange.values())
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((row) => ({
      start: row.startDate,
      end: row.endDate,
      title: row.stageName?.trim() || row.phase,
    }));
}
