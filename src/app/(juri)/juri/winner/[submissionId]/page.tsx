"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionAccordion } from "@/components/juri/submission-accordion";
import {
  JudgeBreakdownPanel,
  ScoreSummary,
} from "@/components/juri/judgement-panels";
import { useJudgeRankings, useJudgeSubmissionDetail } from "@/hooks/use-juri";
import {
  competitionName,
  externalLinks,
  memberNames,
  podiumLabel,
  proposalFile,
} from "@/lib/juri-submission";

// Style glass yang sama dengan halaman juri lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Bar collapsible
const glassBar =
  "flex w-full items-center justify-between px-6 py-4 lg:px-8 text-left cursor-pointer " +
  "hover:bg-white/[0.04] transition-colors";

export default function WinnerDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const submissionId = params.submissionId;

  const { data, isLoading, isError, refetch } =
    useJudgeSubmissionDetail(submissionId);
  const { data: rankingData } = useJudgeRankings();

  const [isPreliminaryOpen, setIsPreliminaryOpen] = useState(false);
  const [isFinalOpen, setIsFinalOpen] = useState(true);

  const submission = data?.submission;
  const criteriaList = data?.criteriaList ?? [];
  const existingScores = data?.existingScores ?? [];
  const teamName = submission?.team?.teamName ?? "-";
  const notes = data?.evaluation?.feedback ?? "";

  // Baris ranking untuk tim ini (dikirim endpoint ranking, bukan dari daftar).
  const ranking =
    rankingData?.rankings.find((r) => r.submissionId === submissionId) ??
    rankingData?.rankings.find((r) => r.teamId === submission?.teamId);

  if (isLoading) {
    return (
      <div className={`${glass} p-10 flex items-center justify-center gap-3 text-white/70`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Memuat detail karya...</span>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className={`${glass} p-10 text-center space-y-4`}>
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-sm font-semibold text-white">Gagal memuat detail karya</p>
        <Button
          size="sm"
          onClick={() => refetch()}
          className="bg-primary text-white text-xs h-8 rounded-lg"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Back link */}
      <Link
        href="/juri/winner"
        className="inline-block text-sm text-text-secondary hover:text-white transition-colors"
      >
        ← Back to Winner
      </Link>

      {/* Header: Competition */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Competition
          <span className="mx-3 text-white/70">•</span>
          {competitionName(submission)}
          {ranking && (
            <>
              <span className="mx-3 text-white/70">•</span>
              {podiumLabel(ranking.rank)}
            </>
          )}
        </h1>
      </div>

      {/* Bar Submission (collapsible, default tertutup) */}
      <SubmissionAccordion
        team={{ name: teamName, members: memberNames(submission) }}
        product={{
          title: submission.projectTitle ?? "-",
          description: submission.description ?? "-",
        }}
        externalLinks={externalLinks(submission)}
        proposal={proposalFile(submission)}
        defaultOpen={false}
      />

      {/* Bar Judgement Preliminary (collapsible) */}
      <button
        type="button"
        onClick={() => setIsPreliminaryOpen((prev) => !prev)}
        className={`${glass} ${glassBar}`}
        aria-expanded={isPreliminaryOpen}
      >
        <span className="relative font-display text-2xl font-bold tracking-tight text-white">
          Judgement Preliminary
        </span>
        <ChevronUp
          className={`relative w-5 h-5 fill-white text-white transition-transform duration-200 ${
            isPreliminaryOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {isPreliminaryOpen && (
        <div className={`${glass} p-6 lg:p-8`}>
          <ScoreSummary criteriaList={criteriaList} scores={existingScores} />

          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              Notes For The Team
            </h3>
            <p className="text-white text-sm whitespace-pre-line">{notes || "-"}</p>
          </div>
        </div>
      )}

      {/* Bar Judgement Final (collapsible, default terbuka) */}
      <button
        type="button"
        onClick={() => setIsFinalOpen((prev) => !prev)}
        className={`${glass} ${glassBar}`}
        aria-expanded={isFinalOpen}
      >
        <span className="relative font-display text-2xl font-bold tracking-tight text-white">
          Judgement Final
        </span>
        <ChevronUp
          className={`relative w-5 h-5 fill-white text-white transition-transform duration-200 ${
            isFinalOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {isFinalOpen && (
        <div className={`${glass} p-6 lg:p-8`}>
          {ranking ? (
            <JudgeBreakdownPanel
              finalScore={ranking.finalScore}
              isFullyScored={ranking.isFullyScored}
              breakdown={ranking.judgeBreakdown}
              recommendationTally={ranking.recommendationTally}
            />
          ) : (
            <p className="text-sm text-white/60">
              Skor akhir untuk karya ini belum tersedia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
