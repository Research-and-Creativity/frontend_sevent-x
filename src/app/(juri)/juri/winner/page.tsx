"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJudgeRankings, useJudgeAnnouncements } from "@/hooks/use-juri";
import { podiumLabel } from "@/lib/juri-submission";
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

export default function JuriWinnerPage() {
  const { data, isLoading, isError, refetch } = useJudgeRankings();
  const competitionSlug = data?.competition?.slug;
  const { data: announcements = [] } = useJudgeAnnouncements(competitionSlug);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rankings = data?.rankings ?? [];
  // Pemenang resmi: announcement published dengan rank 1/2/3 (babak final).
  const publishedWinners = announcements.filter(
    (a) => a.publishedAt && (a.rank === 1 || a.rank === 2 || a.rank === 3)
  );
  // Gabungkan dengan data ranking (skor, submissionId, dll.) untuk tampilan.
  const winners = publishedWinners
    .map((ann) => {
      const r = rankings.find((x) => x.teamId === ann.teamId);
      if (!r) return null;
      return { ...r, rank: ann.rank as number };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const { pageItems: pagedWinners } = paginateItems(winners, currentPage, pageSize);

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
          Winner
        </h1>
        <p className="text-text-secondary text-sm">
          {data?.competition?.name
            ? `Peringkat teratas ${data.competition.name} berdasarkan skor akhir seluruh juri.`
            : "This is all winner of the SEVENT X 2026 in Softdev competition."}
        </p>
      </div>

      <div className={`${glass} p-6 lg:p-8`}>
        <div className="flex items-center gap-2 justify-between mb-6">
          <h2 className="relative font-display text-2xl font-bold tracking-tight text-white">
            Winner
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

        {/* Winner Table (Desktop) / Cards (Mobile) */}
        <div className="relative lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.015]">
          <table className="block w-full text-sm text-left text-text-secondary lg:table">
            <thead className="hidden text-xs text-white uppercase bg-white/[0.04] border-b border-white/10 lg:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Team
                </th>
                <th scope="col" className="px-6 py-3 min-w-[200px]">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Team Leader Name
                </th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">
                  Final Score
                </th>
                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="block space-y-3 lg:table-row-group lg:space-y-0">
              {isLoading ? (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block px-6 py-12 text-center lg:table-cell">
                    <Loader2 className="w-5 h-5 text-white/60 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-white/70">Memuat peringkat...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block px-6 py-12 text-center lg:table-cell">
                    <p className="text-sm font-semibold text-rose-400">
                      Gagal memuat peringkat
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
              ) : winners.length === 0 ? (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block px-6 py-12 text-center lg:table-cell">
                    <Trophy className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">
                      Belum ada pemenang yang dipublikasikan
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {rankings.length === 0
                        ? "Belum ada karya yang masuk pada kompetisi ini."
                        : "Pemenang (Juara 1/2) muncul setelah babak final dihitung dan dipublikasikan oleh panitia."}
                    </p>
                  </td>
                </tr>
              ) : (
                pagedWinners.map((winner) => (
                  <tr
                    key={winner.teamId}
                    className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-white/5 lg:bg-transparent lg:p-0 lg:space-y-0 lg:last:border-b-0 lg:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="flex items-start justify-between gap-3 py-0.5 font-medium text-white lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                      <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Team</span>
                      <span className="min-w-0 text-right lg:text-left break-words">{winner.teamName}</span>
                    </td>
                    <td className="block py-0.5 text-white/90 lg:table-cell lg:px-6 lg:py-4 lg:min-w-[200px] lg:max-w-[360px]">
                      <span className="text-xs text-white/50 block mb-0.5 lg:hidden">Product</span>
                      <span className="break-words">{winner.projectTitle || "-"}</span>
                    </td>
                    <td className="flex items-start justify-between gap-3 py-0.5 text-white/80 lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                      <span className="text-xs text-white/50 shrink-0 lg:hidden">Leader</span>
                      <span className="min-w-0 text-right lg:text-left break-words">{winner.leaderName ?? "-"}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 py-0.5 text-white lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap font-semibold">
                      <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Final Score</span>
                      <div>
                        <span>{winner.finalScore}</span>
                        {!winner.isFullyScored && (
                          <span className="ml-2 text-xs text-white/50 font-normal">
                            belum lengkap
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                      <span className="text-xs text-white/50 shrink-0 lg:hidden">Status</span>
                      <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-medium border border-white/15 bg-white/[0.04] text-[#A9B7FF]">
                        {podiumLabel(winner.rank)}
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 lg:border-t-0 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                      <span className="text-xs text-white/50 lg:hidden">Action</span>
                      <Link
                        href={`/juri/winner/${winner.submissionId}`}
                        className="inline-flex items-center justify-center gap-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-medium lg:hidden">Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && !data.isCalculated && winners.length > 0 && (
          <p className="relative mt-4 text-xs text-white/60">
            Peringkat di atas dihitung langsung dari nilai juri. Status finalis
            resmi belum dihitung panitia.
          </p>
        )}

        <TablePagination
          totalItems={winners.length}
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
