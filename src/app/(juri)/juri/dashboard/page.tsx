"use client";

import Link from "next/link";
import { Users, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { useJudgeSubmissions } from "@/hooks/use-juri";
import { useCompetitionTimeline } from "@/hooks/use-peserta";
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

const glassSelect =
  "bg-white/[0.03] border border-white/15 rounded-lg px-2 py-1 backdrop-blur-md";

const glassButton =
  "bg-white/[0.03] border border-white/15 rounded-lg p-1.5 backdrop-blur-md hover:bg-white/10 transition-colors";

export default function JuriDashboardPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe } = useUserMe();
  const { data: submissions = [] } = useJudgeSubmissions();

  const currentUser = userMe || storeUser;
  const name = currentUser?.fullName || "Juri";

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
          <h1 className="relative font-display text-3xl font-bold">
            Good Morning, {name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className={`${glass} p-6`}>
            <div className="relative flex items-center justify-between mb-6">
              <span className="text-xs tracking-widest text-white/60">
                ALREADY SUBMITTED
              </span>
              <Users className="w-5 h-5 text-white/70" />
            </div>
            <p className="relative font-display text-4xl font-bold">
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
            <p className="relative font-display text-4xl font-bold">
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
            <p className="relative font-display text-4xl font-bold">
              {deadline ? formatCountdown(deadline) : "--"}
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
          <table className="relative w-full text-left text-sm">
            <thead>
              <tr className="text-left text-white/70 border-b border-white/10">
                <th className="pb-3 font-semibold">Team</th>
                <th className="pb-3 font-semibold">Product Name</th>
                <th className="pb-3 font-semibold">Team Leader Name</th>
                <th className="pb-3 font-semibold">Submitted Date</th>
                <th className="pb-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topScores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-white/60">
                    Belum ada karya yang dinilai.
                  </td>
                </tr>
              ) : (
                topScores.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-5 pr-4">{t.team?.teamName ?? "-"}</td>
                    <td className="py-5 pr-4">{t.projectTitle ?? "-"}</td>
                    <td className="py-5 pr-4">{leaderName(t)}</td>
                    <td className="py-5 pr-4">
                      {formatSubmittedDate(t.submittedAt)}
                    </td>
                    <td className="py-5">
                      <Link
                        href={`/juri/judged/${t.id}`}
                        className="text-white/60 hover:text-white"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="relative flex items-center justify-between pt-5 text-xs text-white/50">
            <span>
              Showing {topScores.length} data out of {judgedCount}
            </span>
            <div className="flex items-center gap-3">
              <span>Show</span>
              <select className={glassSelect}>
                <option className="bg-[#15161A]">10</option>
              </select>
              <span>data per page</span>
              <button className={glassButton}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className={glassButton}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
