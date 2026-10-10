"use client";

import Link from "next/link";
import { Eye, ChevronLeft, ChevronRight, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJudgeRankings } from "@/hooks/use-juri";
import { podiumLabel } from "@/lib/juri-submission";

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

// Hanya tiga peringkat teratas yang bergelar winner / runner up.
const PODIUM_SIZE = 3;

export default function JuriWinnerPage() {
  const { data, isLoading, isError, refetch } = useJudgeRankings();

  const rankings = data?.rankings ?? [];
  const winners = rankings
    .filter((r) => r.submissionId)
    .slice(0, PODIUM_SIZE);

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

        {/* Winner Table */}
        <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-white/[0.015]">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-white uppercase bg-white/[0.04] border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Team
                </th>
                <th scope="col" className="px-6 py-3">
                  Product Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Team Leader Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Final Score
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-5 h-5 text-white/60 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-white/70">Memuat peringkat...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Trophy className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">
                      Belum ada pemenang
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {rankings.length === 0
                        ? "Belum ada karya yang masuk pada kompetisi ini."
                        : "Pemenang muncul setelah juri menyelesaikan penilaian."}
                    </p>
                  </td>
                </tr>
              ) : (
                winners.map((winner) => (
                  <tr
                    key={winner.teamId}
                    className="bg-transparent border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {winner.teamName}
                    </td>
                    <td className="px-6 py-4">{winner.projectTitle || "-"}</td>
                    <td className="px-6 py-4">{winner.leaderName ?? "-"}</td>
                    <td className="px-6 py-4 text-white">
                      {winner.finalScore}
                      {!winner.isFullyScored && (
                        <span className="ml-2 text-xs text-amber-400">
                          belum lengkap
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white">{podiumLabel(winner.rank)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/juri/winner/${winner.submissionId}`}
                        className="inline-flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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

        {/* Pagination */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-4 sm:mb-0">
            Showing{" "}
            <span className="font-semibold text-white">{winners.length}</span>{" "}
            data out of{" "}
            <span className="font-semibold text-white">{rankings.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled
              className={`${glassControl} opacity-40`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled
              className={`${glassControl} opacity-40`}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
