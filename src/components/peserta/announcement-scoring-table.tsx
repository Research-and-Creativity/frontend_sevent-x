"use client";

import { useMemo } from "react";
import type { TeamAnnouncementEvaluation } from "@/types/api";

interface AnnouncementScoringTableProps {
  evaluation: TeamAnnouncementEvaluation;
  compact?: boolean;
}

export function AnnouncementScoringTable({
  evaluation,
  compact = false,
}: AnnouncementScoringTableProps) {
  const { finalScore, judgeBreakdown = [] } = evaluation;

  // Kumpulkan daftar kriteria unik sesuai urutan dari judgeBreakdown
  const criteriaList = useMemo(() => {
    const map = new Map<
      string,
      { criteriaId: string; criteriaName: string; maxScore: number; weight: number }
    >();
    for (const judge of judgeBreakdown) {
      for (const cs of judge.criteriaScores || []) {
        if (!map.has(cs.criteriaId)) {
          map.set(cs.criteriaId, {
            criteriaId: cs.criteriaId,
            criteriaName: cs.criteriaName,
            maxScore: cs.maxScore,
            weight: cs.weight,
          });
        }
      }
    }
    return Array.from(map.values());
  }, [judgeBreakdown]);

  if (judgeBreakdown.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-6 pt-6 border-t border-white/10">
      {/* Ringkasan Nilai Akhir */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white">
            Hasil Penilaian Tim
          </h3>
          <p className="text-xs text-text-secondary">
            Nilai akhir dihitung dari rata-rata penilaian {judgeBreakdown.length} orang juri
            kompetisi.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="block text-xs text-text-secondary">
            Rata-rata Nilai Akhir
          </span>
          <span className="font-display text-2xl sm:text-3xl font-bold text-[#7D8CFF] tabular-nums">
            {finalScore.toFixed(2)}
            <span className="text-sm font-normal text-text-secondary"> / 100</span>
          </span>
        </div>
      </div>

      {/* Tabel Penilaian (Desktop Table -> Mobile Cards) */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">
          Rincian Nilai per Kriteria
        </h4>

        <div className="lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.015]">
          <table className="block w-full text-left text-xs lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/60">
                <th className="py-3 px-4 font-semibold">Kriteria Penilaian</th>
                <th className="py-3 px-3 text-center font-semibold">Bobot</th>
                <th className="py-3 px-3 text-center font-semibold">Max</th>
                {judgeBreakdown.map((judge) => (
                  <th
                    key={judge.judgeId}
                    className="py-3 px-3 text-center font-semibold text-white whitespace-nowrap"
                  >
                    {judge.judgeName}
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-semibold text-[#A9B7FF]">
                  Rata-rata
                </th>
              </tr>
            </thead>
            <tbody className="block space-y-3 lg:table-row-group lg:space-y-0 lg:divide-y lg:divide-white/5 text-white/90">
              {criteriaList.map((crit) => {
                let scoreSum = 0;
                let judgeCount = 0;
                const judgeScores = judgeBreakdown.map((j) => {
                  const found = j.criteriaScores?.find(
                    (cs) => cs.criteriaId === crit.criteriaId
                  );
                  if (found) {
                    scoreSum += found.score;
                    judgeCount += 1;
                  }
                  return found;
                });
                const critAverage =
                  judgeCount > 0 ? (scoreSum / judgeCount).toFixed(1) : "-";

                return (
                  <tr
                    key={crit.criteriaId}
                    className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 lg:table-row lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:space-y-0 lg:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="block pb-2 border-b border-white/10 font-medium text-white lg:border-b-0 lg:table-cell lg:py-3 lg:px-4 lg:max-w-xs">
                      <span className="text-sm lg:text-xs font-semibold lg:font-medium block">
                        {crit.criteriaName}
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 py-0.5 text-text-secondary tabular-nums lg:table-cell lg:py-3 lg:px-3 lg:text-center">
                      <span className="text-[11px] text-white/50 lg:hidden">Bobot</span>
                      <span>{crit.weight > 0 ? `${crit.weight}%` : "-"}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 py-0.5 text-text-secondary tabular-nums lg:table-cell lg:py-3 lg:px-3 lg:text-center">
                      <span className="text-[11px] text-white/50 lg:hidden">Skor Maksimal</span>
                      <span>{crit.maxScore}</span>
                    </td>
                    {judgeScores.map((js, idx) => (
                      <td
                        key={judgeBreakdown[idx].judgeId}
                        className="flex items-center justify-between gap-3 py-0.5 font-semibold lg:table-cell lg:py-3 lg:px-3 lg:text-center"
                      >
                        <span className="text-[11px] font-medium text-white/60 lg:hidden shrink-0">
                          {judgeBreakdown[idx].judgeName}
                        </span>
                        {js !== undefined ? (
                          <span className="text-white tabular-nums">{js.score}</span>
                        ) : (
                          <span className="text-white/30">-</span>
                        )}
                      </td>
                    ))}
                    <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 font-semibold text-[#A9B7FF] lg:border-t-0 lg:table-cell lg:py-3 lg:px-4 lg:text-center">
                      <span className="text-[11px] font-medium text-white/70 lg:hidden">
                        Rata-rata Kriteria
                      </span>
                      <span className="tabular-nums">{critAverage}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="block mt-3 lg:table-footer-group lg:mt-0">
              <tr className="block rounded-xl border border-white/15 bg-white/[0.03] p-4 space-y-2 lg:table-row lg:rounded-none lg:border-0 lg:border-t lg:border-white/10 lg:bg-white/[0.025] lg:p-0 lg:space-y-0 font-semibold text-white">
                <td className="block pb-2 border-b border-white/10 lg:border-b-0 lg:table-cell lg:py-3 lg:px-4">
                  Total / Rata-rata Nilai
                </td>
                <td className="hidden lg:table-cell py-3 px-3 text-center text-text-secondary tabular-nums">
                  100%
                </td>
                <td className="hidden lg:table-cell py-3 px-3 text-center text-text-secondary">
                  -
                </td>
                {judgeBreakdown.map((judge) => (
                  <td
                    key={judge.judgeId}
                    className="flex items-center justify-between gap-3 py-0.5 text-xs lg:text-sm text-white lg:table-cell lg:py-3 lg:px-3 lg:text-center"
                  >
                    <span className="text-[11px] font-normal text-white/60 lg:hidden">
                      {judge.judgeName}
                    </span>
                    <span className="tabular-nums">{judge.averageScore.toFixed(2)}</span>
                  </td>
                ))}
                <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 text-sm lg:text-base font-bold text-[#7D8CFF] lg:border-t-0 lg:table-cell lg:py-3 lg:px-4 lg:text-center">
                  <span className="text-xs font-medium text-white/80 lg:hidden">Nilai Akhir</span>
                  <span className="tabular-nums">{finalScore.toFixed(2)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Catatan / Feedback Tiap Juri */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">
          Catatan &amp; Masukan Tiap Juri
        </h4>

        <div
          className={`grid grid-cols-1 gap-4 ${
            compact ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {judgeBreakdown.map((judge) => {
            const hasCriteriaNotes = (judge.criteriaScores || []).some(
              (cs) => cs.note && cs.note.trim().length > 0
            );

            return (
              <div
                key={judge.judgeId}
                className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
              >
                <div className="flex items-baseline justify-between gap-2 pb-2.5 border-b border-white/10">
                  <span className="font-semibold text-sm text-[#7D8CFF] truncate">
                    {judge.judgeName}
                  </span>
                  <span className="text-xs font-medium text-text-secondary shrink-0 tabular-nums">
                    Skor: {judge.averageScore.toFixed(2)}
                  </span>
                </div>

                {/* General Feedback */}
                <div className="space-y-1">
                  <span className="block text-xs font-medium text-white/55">
                    Catatan Umum
                  </span>
                  {judge.feedback ? (
                    <p className="text-xs text-white/85 leading-relaxed whitespace-pre-line">
                      {judge.feedback}
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary">
                      Tidak ada catatan umum dari juri ini.
                    </p>
                  )}
                </div>

                {/* Notes per Criteria */}
                {hasCriteriaNotes && (
                  <div className="space-y-2 pt-2.5 border-t border-white/10">
                    <span className="block text-xs font-medium text-white/55">
                      Catatan per Kriteria
                    </span>
                    <div className="space-y-2">
                      {judge.criteriaScores
                        ?.filter((cs) => cs.note && cs.note.trim().length > 0)
                        .map((cs) => (
                          <div key={cs.criteriaId} className="space-y-0.5 text-xs">
                            <span className="font-medium text-white/90 block">
                              {cs.criteriaName}
                            </span>
                            <span className="text-white/70 block leading-relaxed">
                              {cs.note}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
