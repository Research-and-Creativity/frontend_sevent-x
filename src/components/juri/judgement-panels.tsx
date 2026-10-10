"use client";

import type { JudgeSubmissionScore } from "@/hooks/use-juri";

type Criteria = Array<{
  id: string;
  name: string;
  maxScore: number;
  order: number;
}>;

interface ScoreSummaryProps {
  criteriaList: Criteria;
  scores: JudgeSubmissionScore[];
  totalLabel?: string;
  emptyText?: string;
}

/**
 * Rekap nilai read-only: nilai per kriteria + total dari juri yang sedang
 * membuka halaman. Dipakai di halaman judged, winner, dan list finalis.
 */
export function ScoreSummary({
  criteriaList,
  scores,
  totalLabel = "Final Score",
  emptyText = "Belum ada nilai yang tersimpan untuk karya ini.",
}: ScoreSummaryProps) {
  if (scores.length === 0) {
    return <p className="text-sm text-white/60">{emptyText}</p>;
  }

  const byCriteria = new Map(scores.map((s) => [s.criteriaId, s.score]));
  const total = scores.reduce((acc, s) => acc + s.score, 0);
  const columns = `repeat(${Math.max(criteriaList.length, 1) + 1}, minmax(0, 1fr))`;

  return (
    <div className="w-full mb-6">
      <div
        className="grid gap-4 border-b border-white/10 pb-4 mb-4 text-sm font-medium text-white/60 text-center"
        style={{ gridTemplateColumns: columns }}
      >
        {criteriaList.map((c) => (
          <div key={c.id}>{c.name}</div>
        ))}
        <div className="text-white">{totalLabel}</div>
      </div>
      <div
        className="grid gap-4 text-center text-white pb-6 border-b border-white/10"
        style={{ gridTemplateColumns: columns }}
      >
        {criteriaList.map((c) => (
          <div key={c.id}>{byCriteria.get(c.id) ?? "-"}</div>
        ))}
        <div className="font-bold text-[#7D8CFF]">{total}</div>
      </div>
    </div>
  );
}

interface JudgeBreakdownPanelProps {
  finalScore: number;
  isFullyScored: boolean;
  breakdown: Array<{
    judgeId: string;
    judgeName: string;
    criteriaCount: number;
    averageScore: number;
  }>;
}

/** Rincian skor akhir lintas juri + rata-rata tiap juri (hitungan panitia). */
export function JudgeBreakdownPanel({
  finalScore,
  isFullyScored,
  breakdown,
}: JudgeBreakdownPanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        <span className="text-sm text-white/60">Final Score</span>
        <span className="font-display text-3xl font-bold text-white">
          {finalScore}
        </span>
        {!isFullyScored && (
          <span className="text-xs text-amber-400">
            (belum dinilai lengkap oleh semua juri)
          </span>
        )}
      </div>

      {breakdown.length === 0 ? (
        <p className="text-sm text-white/60">
          Belum ada nilai juri untuk karya ini.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.015]">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-white uppercase bg-white/[0.04] border-b border-white/10">
              <tr>
                <th scope="col" className="px-4 py-3">Judge</th>
                <th scope="col" className="px-4 py-3 text-center">Kriteria</th>
                <th scope="col" className="px-4 py-3 text-center">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((j) => (
                <tr
                  key={j.judgeId}
                  className="border-b border-white/5 last:border-b-0"
                >
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                    {j.judgeName}
                  </td>
                  <td className="px-4 py-3 text-center">{j.criteriaCount}</td>
                  <td className="px-4 py-3 text-center text-white">
                    {j.averageScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
