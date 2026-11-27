"use client";

import type { JudgeSubmissionScore } from "@/hooks/use-juri";

type Criteria = Array<{
  id: string;
  name: string;
  maxScore: number;
  order: number;
  weight?: number;
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
  totalLabel = "Your Score",
  emptyText = "Belum ada nilai yang tersimpan untuk karya ini.",
}: ScoreSummaryProps) {
  if (scores.length === 0) {
    return <p className="text-sm text-white/60">{emptyText}</p>;
  }

  const scoreMap = new Map(scores.map((s) => [s.criteriaId, s]));
  const criteriaById = new Map(criteriaList.map((c) => [c.id, c]));
  const total = scores.reduce((acc, s) => {
    const c = criteriaById.get(s.criteriaId);
    const maxScore = c?.maxScore ?? 1;
    const weight = c?.weight ?? 0;
    return acc + (s.score / maxScore) * weight;
  }, 0);

  return (
    <div className="w-full mb-6">
      <div className="lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.015]">
        <table className="block w-full text-sm text-left text-text-secondary lg:table">
          <thead className="hidden text-xs text-white uppercase bg-white/[0.04] border-b border-white/10 lg:table-header-group">
            <tr>
              <th scope="col" className="px-5 py-3 whitespace-nowrap">Kriteria</th>
              <th scope="col" className="px-5 py-3 text-center whitespace-nowrap">Bobot</th>
              <th scope="col" className="px-5 py-3 text-center whitespace-nowrap">Nilai</th>
              <th scope="col" className="px-5 py-3 min-w-[200px]">Catatan Kriteria</th>
            </tr>
          </thead>
          <tbody className="block space-y-3 lg:table-row-group lg:space-y-0">
            {criteriaList.map((c) => {
              const scoreObj = scoreMap.get(c.id);
              const scoreVal = scoreObj?.score !== undefined ? scoreObj.score : "-";
              const noteVal = scoreObj?.note?.trim();
              return (
                <tr
                  key={c.id}
                  className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-white/5 lg:bg-transparent lg:p-0 lg:space-y-0 lg:last:border-b-0 lg:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="block pb-1.5 border-b border-white/10 font-medium text-white lg:border-b-0 lg:table-cell lg:px-5 lg:py-4 lg:whitespace-nowrap">
                    {c.name}
                  </td>
                  <td className="flex items-center justify-between gap-3 py-0.5 text-white/70 lg:table-cell lg:px-5 lg:py-4 lg:text-center lg:whitespace-nowrap">
                    <span className="text-xs text-white/50 lg:hidden">Bobot</span>
                    <span>{c.weight !== undefined ? `${c.weight}%` : "-"}</span>
                  </td>
                  <td className="flex items-center justify-between gap-3 py-0.5 font-semibold text-white lg:table-cell lg:px-5 lg:py-4 lg:text-center lg:whitespace-nowrap">
                    <span className="text-xs font-normal text-white/50 lg:hidden">Nilai</span>
                    <span>
                      {scoreVal} <span className="text-xs text-white/40 font-normal">/ {c.maxScore}</span>
                    </span>
                  </td>
                  <td className="block py-0.5 text-white/80 text-xs sm:text-sm lg:table-cell lg:px-5 lg:py-4">
                    <span className="text-xs text-white/50 block mb-0.5 lg:hidden">Catatan</span>
                    {noteVal ? (
                      <span className="whitespace-pre-line text-white/90">
                        {noteVal}
                      </span>
                    ) : (
                      <span className="text-white/30">Tidak ada catatan</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="block mt-3 lg:table-footer-group lg:mt-0 border-t border-white/10 lg:bg-white/[0.02] text-sm">
            <tr className="block rounded-xl border border-[#7D8CFF]/25 bg-[#7D8CFF]/[0.06] p-4 space-y-1.5 lg:table-row lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:space-y-0">
              <td colSpan={2} className="block font-semibold text-white lg:table-cell lg:px-5 lg:py-3.5">
                {totalLabel}
              </td>
              <td className="flex items-center justify-between gap-3 font-bold text-base text-[#7D8CFF] lg:table-cell lg:px-5 lg:py-3.5 lg:text-center lg:whitespace-nowrap">
                <span className="text-xs font-normal text-white/60 lg:hidden">Skor Berbobot</span>
                <span>{parseFloat(total.toFixed(2))}</span>
              </td>
              <td className="block text-xs text-white/50 lg:table-cell lg:px-5 lg:py-3.5">
                Total skor berbobot (skala 0–100)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface JudgeBreakdownPanelProps {
  finalScore: number;
  isFullyScored: boolean;
  expectedJudgeCount?: number;
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
  expectedJudgeCount,
  breakdown,
}: JudgeBreakdownPanelProps) {
  const judgeProgressLabel = expectedJudgeCount
    ? `${breakdown.length}/${expectedJudgeCount} juri`
    : `${breakdown.length} juri`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-white/60">Final Score</span>
        <span className="font-display text-3xl font-bold text-[#7D8CFF] tabular-nums">
          {finalScore.toFixed(2)}
        </span>
        {isFullyScored ? (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-emerald-400">
            Lengkap ({judgeProgressLabel})
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/70">
            Belum lengkap ({judgeProgressLabel})
          </span>
        )}
      </div>

      {breakdown.length === 0 ? (
        <p className="text-sm text-white/60">
          Belum ada nilai juri untuk karya ini.
        </p>
      ) : (
        <div className="lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.015]">
          <table className="block w-full text-sm text-left text-text-secondary lg:table">
            <thead className="hidden text-xs text-white uppercase bg-white/[0.04] border-b border-white/10 lg:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3">Judge</th>
                <th scope="col" className="px-4 py-3 text-center">Kriteria</th>
                <th scope="col" className="px-4 py-3 text-center">Rata-rata</th>
              </tr>
            </thead>
            <tbody className="block space-y-3 lg:table-row-group lg:space-y-0">
              {breakdown.map((j) => (
                <tr
                  key={j.judgeId}
                  className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-white/5 lg:bg-transparent lg:p-0 lg:space-y-0 lg:last:border-b-0"
                >
                  <td className="flex items-start justify-between gap-3 py-0.5 font-medium text-white lg:table-cell lg:px-4 lg:py-3 lg:whitespace-nowrap">
                    <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Judge</span>
                    <span className="min-w-0 text-right lg:text-left break-words">{j.judgeName}</span>
                  </td>
                  <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:px-4 lg:py-3 lg:text-center">
                    <span className="text-xs text-white/50 shrink-0 lg:hidden">Kriteria Dinilai</span>
                    <span>{j.criteriaCount}</span>
                  </td>
                  <td className="flex items-center justify-between gap-3 py-0.5 font-semibold text-white tabular-nums lg:table-cell lg:px-4 lg:py-3 lg:text-center">
                    <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Rata-rata</span>
                    <span>{j.averageScore.toFixed(2)}</span>
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
