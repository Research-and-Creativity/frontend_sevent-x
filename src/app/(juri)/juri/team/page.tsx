"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJudgeRankings, useJudgeSubmissions } from "@/hooks/use-juri";
import { formatSubmittedDate } from "@/lib/juri-submission";
import { TablePagination, paginateItems } from "@/components/shared/table-pagination";

// Style glass yang sama dengan halaman juri lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Kaca untuk elemen kecil (input, tombol, select trigger)
const glassControl =
  "bg-white/[0.03] border-white/15 backdrop-blur-md " +
  "hover:bg-white/10 text-white/70 hover:text-white transition-colors";

export default function JuriTeamDirectoryPage() {
  const { data, isLoading, isError, refetch } = useJudgeRankings();
  const { data: submissions = [] } = useJudgeSubmissions();

  const isFinalRound =
    data?.competition?.activeRound === "FINAL" ||
    submissions[0]?.team?.competition?.activeRound === "FINAL";
  const pendingSubmissionIds = new Set(
    submissions
      .filter((s) => !s.evaluationStatus?.isEvaluated)
      .map((s) => s.id)
  );

  const rankings = data?.rankings ?? [];
  // Finalis ditentukan panitia lewat perhitungan otomatis; null = belum dihitung.
  const finalists = rankings.filter((r) => r.isFinalist === true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { pageItems: paginatedFinalists } = paginateItems(
    finalists,
    currentPage,
    pageSize
  );

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Header */}
      <div className={`${glass} p-6 lg:p-8 flex flex-col justify-center`}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">
          List Finalists
        </h1>
        <p className="text-text-secondary text-sm">
          {data?.competition?.name
            ? `Tim yang lolos ke finalis pada ${data.competition.name}, ditentukan panitia dari skor akhir.`
            : "This is all finalist that pass the final round."}
        </p>
      </div>

      <div className={`${glass} p-6 lg:p-8`}>
        <div className="flex items-center gap-2 justify-between mb-6">
          <h2 className="relative font-display text-2xl font-bold tracking-tight text-white">
            List of Finalists
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className={`${glassControl} text-xs`}
          >
            Muat Ulang
          </Button>
        </div>

        {/* Tabel (Desktop) / Cards (Mobile) */}
        <div className="relative lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.015]">
          <table className="block w-full text-sm text-left text-text-secondary lg:table">
            <thead className="hidden text-xs text-white uppercase bg-white/[0.04] border-b border-white/10 lg:table-header-group">
              <tr>
                <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Rank</th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Team</th>
                <th scope="col" className="px-6 py-3 min-w-[200px]">Product Name</th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Team Leader Name</th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Submitted Date</th>
                <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Final Score</th>
                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="block space-y-3 lg:table-row-group lg:space-y-0">
              {isLoading ? (
                <tr className="block lg:table-row">
                  <td colSpan={7} className="block px-6 py-12 text-center lg:table-cell">
                    <Loader2 className="w-5 h-5 text-white/60 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-white/70">Memuat daftar finalis...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="block lg:table-row">
                  <td colSpan={7} className="block px-6 py-12 text-center lg:table-cell">
                    <p className="text-sm font-semibold text-rose-400">
                      Gagal memuat daftar finalis
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className={`${glassControl} mt-3 text-xs`}
                    >
                      Coba Lagi
                    </Button>
                  </td>
                </tr>
              ) : finalists.length === 0 ? (
                <tr className="block lg:table-row">
                  <td colSpan={7} className="block px-6 py-12 text-center lg:table-cell">
                    <Users className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">
                      Belum ada finalis
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {data?.isCalculated === false
                        ? "Finalis belum dihitung panitia. Daftar muncul setelah perhitungan final di menu admin."
                        : "Belum ada tim yang lolos ke finalis."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedFinalists.map((participant) => {
                  const rankTextClass =
                    participant.rank <= 3
                      ? "font-semibold text-[#7D8CFF]"
                      : "font-medium text-white/60";

                  return (
                    <tr
                      key={participant.teamId}
                      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-white/5 lg:bg-transparent lg:p-0 lg:space-y-0 lg:last:border-b-0 lg:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:px-4 lg:py-4 lg:text-center lg:whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden">Rank</span>
                        <span className={`text-sm tabular-nums ${rankTextClass}`}>
                          #{participant.rank}
                        </span>
                      </td>
                      <td className="flex items-start justify-between gap-3 py-0.5 font-medium text-white lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                        <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Team</span>
                        <span className="min-w-0 text-right lg:text-left break-words">{participant.teamName}</span>
                      </td>
                      <td className="block py-0.5 text-white/90 lg:table-cell lg:px-6 lg:py-4 lg:min-w-[200px] lg:max-w-[360px]">
                        <span className="text-xs text-white/50 block mb-0.5 lg:hidden">Product</span>
                        <span className="break-words">{participant.projectTitle || "-"}</span>
                      </td>
                      <td className="flex items-start justify-between gap-3 py-0.5 text-white/80 lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden">Leader</span>
                        <span className="min-w-0 text-right lg:text-left break-words">{participant.leaderName ?? "-"}</span>
                      </td>
                      <td className="flex items-center justify-between gap-3 py-0.5 text-white/70 lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden">Submitted</span>
                        <span>
                          {participant.submittedAt
                            ? formatSubmittedDate(participant.submittedAt)
                            : "-"}
                        </span>
                      </td>
                      <td className="flex items-start justify-between gap-3 py-0.5 font-mono font-semibold text-white lg:table-cell lg:px-6 lg:py-4 lg:text-right lg:whitespace-nowrap">
                        <span className="font-sans text-xs font-normal text-white/50 shrink-0 lg:hidden">Final Score</span>
                        <div className="text-right">
                          <span>
                            {typeof participant.finalScore === "number"
                              ? participant.finalScore.toFixed(2)
                              : "-"}
                          </span>
                          {participant.isFullyScored === false && (
                            <span className="block font-sans font-normal text-xs text-white/50 mt-0.5">
                              Belum lengkap ({participant.judgeBreakdown?.length ?? 0}
                              {data?.expectedJudgeCount ? `/${data.expectedJudgeCount}` : ""} juri)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 lg:border-t-0 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                        <span className="text-xs text-white/50 lg:hidden">Action</span>
                        {participant.submissionId ? (
                          <div className="inline-flex items-center gap-2">
                            {isFinalRound && pendingSubmissionIds.has(participant.submissionId) && (
                              <Link
                                href={`/juri/already-submitted/${participant.submissionId}`}
                                className="inline-flex items-center justify-center rounded-full border border-[#7D8CFF]/50 bg-[#7D8CFF]/15 px-3 py-1 text-xs font-semibold text-[#A9B7FF] hover:bg-[#7D8CFF]/25 transition-colors"
                              >
                                Nilai Final
                              </Link>
                            )}
                            <Link
                              href={`/juri/team/${participant.submissionId}`}
                              className="inline-flex items-center justify-center gap-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-xs font-medium lg:hidden">Detail</span>
                            </Link>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          totalItems={finalists.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="mt-6 px-4 py-3 pt-3 rounded-xl border border-white/10 bg-white/[0.02]"
        />
      </div>
    </div>
  );
}
