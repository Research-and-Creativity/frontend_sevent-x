"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Clock, Eye } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { getGreeting } from "@/lib/greeting";
import { useJudgeSubmissions } from "@/hooks/use-juri";
import { useCompetitionTimeline } from "@/hooks/use-peserta";
import { apiClient } from "@/lib/api-client";
import {
  byTotalScoreDesc,
  formatCountdown,
  formatSubmittedDate,
  leaderName,
} from "@/lib/juri-submission";

function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

// Style glass dipakai ulang di semua container
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

export default function JuriDashboardPage() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const id = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(id);
  }, []);

  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe } = useUserMe();
  const { data: submissions = [] } = useJudgeSubmissions();

  const currentUser = userMe || storeUser;
  const name = currentUser?.fullName || "Juri";
  const competitionName =
    userMe?.judgeProfile?.competition?.name ||
    submissions[0]?.team?.competition?.name;

  const judgedCount = submissions.filter(
    (s) => s.evaluationStatus?.isEvaluated
  ).length;
  const pendingCount = submissions.length - judgedCount;

  // Batas penilaian mengikuti tahap penjurian yang sedang berjalan.
  const competitionSlug = submissions[0]?.team?.competition?.slug;
  const { data: timeline = [] } = useCompetitionTimeline(competitionSlug);
  const activeStage = timeline.find((s) => s.isActive);
  const deadline = activeStage ? new Date(activeStage.endDate) : null;

  const topScores = byTotalScoreDesc(
    submissions.filter((s) => s.evaluationStatus?.isEvaluated)
  ).slice(0, 3);

  const exportScores = async (round: "PENYISIHAN" | "FINAL") => {
    try {
      const res = await apiClient.get("/api/export/scores", {
        params: { round },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nilai-${round.toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative isolate max-w-7xl mx-auto pb-10">
      {/* Blob warna di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      <div className="space-y-6">
        <div className={`${glass} p-6`}>
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                {getGreeting(name, "Juri")}
              </h1>
              {competitionName && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-[#7D8CFF]/30 bg-[#7D8CFF]/10 text-[#7D8CFF]">
                  {competitionName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportScores("PENYISIHAN")}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                Export CSV (Penyisihan)
              </button>
              <button
                type="button"
                onClick={() => exportScores("FINAL")}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                Export CSV (Final)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className={`${glass} p-6`}>
            <div className="relative flex items-center justify-between mb-6">
              <span className="text-xs tracking-widest text-white/60">
                ALREADY SUBMITTED
              </span>
              <Users className="w-5 h-5 text-white/70" />
            </div>
            <p className="relative font-display text-3xl sm:text-4xl font-bold">
              {pendingCount}{" "}
              <span className="text-lg text-white/40 font-normal">
                / {submissions.length}
              </span>
            </p>
            <div className="relative mt-4 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#7D8CFF] shadow-[0_0_8px_rgba(125,140,255,0.4)]"
                style={{ width: `${percent(pendingCount, submissions.length)}%` }}
              />
            </div>
          </div>

          <div className={`${glass} p-6`}>
            <div className="relative flex items-center justify-between mb-6">
              <span className="text-xs tracking-widest text-white/60">
                JUDGED
              </span>
              <Users className="w-5 h-5 text-white/70" />
            </div>
            <p className="relative font-display text-3xl sm:text-4xl font-bold">
              {judgedCount}{" "}
              <span className="text-lg text-white/40 font-normal">
                / {submissions.length}
              </span>
            </p>
            <div className="relative mt-4 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#7D8CFF] shadow-[0_0_8px_rgba(125,140,255,0.4)]"
                style={{ width: `${percent(judgedCount, submissions.length)}%` }}
              />
            </div>
          </div>

          <div className={`${glass} p-6`}>
            <div className="relative flex items-center justify-between mb-6">
              <span className="text-xs tracking-widest text-white/60">
                TIME REMAINING
              </span>
              <Clock className="w-5 h-5 text-white/70" />
            </div>
            <p className="relative font-display text-2xl sm:text-3xl font-bold tabular-nums">
              {deadline ? formatCountdown(deadline, now) : "--"}
            </p>
            <p className="relative text-xs text-white/50 mt-2">
              {activeStage
                ? `Until ${activeStage.stageName} ends`
                : "Until last judgement time"}
            </p>
          </div>
        </div>

        <div className={`${glass} p-6`}>
          <h2 className="relative font-display text-2xl font-bold mb-6">
            Top 3 Highest Score
          </h2>
          <div className="lg:overflow-x-auto">
            <table className="relative block w-full text-left text-sm lg:table">
              <thead className="hidden lg:table-header-group">
                <tr className="text-left text-white/70 border-b border-white/10">
                  <th className="pb-3 font-semibold whitespace-nowrap">Team</th>
                  <th className="pb-3 font-semibold min-w-[200px]">Product Name</th>
                  <th className="pb-3 font-semibold whitespace-nowrap">Team Leader Name</th>
                  <th className="pb-3 font-semibold whitespace-nowrap">Submitted Date</th>
                  <th className="pb-3 font-semibold text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="block space-y-3 lg:table-row-group lg:space-y-0 lg:divide-y lg:divide-white/5">
                {topScores.length === 0 ? (
                  <tr className="block lg:table-row">
                    <td colSpan={5} className="block py-10 text-center text-sm text-white/60 lg:table-cell">
                      Belum ada karya yang dinilai.
                    </td>
                  </tr>
                ) : (
                  topScores.map((t) => (
                    <tr
                      key={t.id}
                      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 lg:table-row lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:space-y-0 lg:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="flex items-start justify-between gap-3 py-0.5 lg:table-cell lg:py-5 lg:pr-4 lg:whitespace-nowrap font-medium text-white">
                        <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Team</span>
                        <span className="min-w-0 text-right lg:text-left break-words">{t.team?.teamName ?? "-"}</span>
                      </td>
                      <td className="block py-0.5 lg:table-cell lg:py-5 lg:pr-4 lg:min-w-[200px] lg:max-w-[360px] text-white/90">
                        <span className="text-xs text-white/50 block mb-0.5 lg:hidden">Product</span>
                        <span className="break-words">{t.projectTitle ?? "-"}</span>
                      </td>
                      <td className="flex items-start justify-between gap-3 py-0.5 lg:table-cell lg:py-5 lg:pr-4 lg:whitespace-nowrap text-white/80">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden">Leader</span>
                        <span className="min-w-0 text-right lg:text-left break-words">{leaderName(t)}</span>
                      </td>
                      <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:py-5 lg:pr-4 lg:whitespace-nowrap text-white/70">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden">Submitted</span>
                        <span>{formatSubmittedDate(t.submittedAt)}</span>
                      </td>
                      <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 lg:border-t-0 lg:table-cell lg:py-5 lg:text-center lg:whitespace-nowrap">
                        <span className="text-xs text-white/50 lg:hidden">Action</span>
                        <Link
                          href={`/juri/judged/${t.id}`}
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

          <div className="relative flex flex-wrap items-center justify-between gap-3 pt-5 text-xs text-white/50">
            <span>
              Menampilkan {topScores.length} peringkat teratas dari {judgedCount} karya dinilai
            </span>
            <Link
              href="/juri/judged"
              className="font-medium text-[#A9B7FF] hover:text-white transition-colors"
            >
              Lihat semua karya dinilai →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
