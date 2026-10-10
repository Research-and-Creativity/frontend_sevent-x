"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SubmissionAccordion } from "@/components/juri/submission-accordion";
import { ScoreSummary } from "@/components/juri/judgement-panels";
import { RecommendationActions } from "@/components/juri/recommendation-actions";
import { useJudgeSubmissionDetail } from "@/hooks/use-juri";
import {
  competitionName,
  externalLinks,
  memberNames,
  proposalFile,
} from "@/lib/juri-submission";

const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

export default function JudgedDetailPage() {
  const params = useParams<{ submissionId: string }>();

  const { data, isLoading, isError, refetch } = useJudgeSubmissionDetail(
    params.submissionId
  );

  const submission = data?.submission;
  const criteriaList = data?.criteriaList ?? [];
  const existingScores = data?.existingScores ?? [];
  const teamName = submission?.team?.teamName ?? "-";

  const recommendation = data?.evaluation?.recommendation ?? null;

  // Catatan tim disimpan sekali per karya-juri (JudgeEvaluation.feedback).
  const notes = data?.evaluation?.feedback ?? "";

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
        <p className="text-sm font-semibold text-white">
          Gagal memuat detail karya
        </p>
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
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <Link
          href="/juri/judged"
          className="text-sm text-text-secondary hover:text-white transition-colors"
        >
          ← Back to Judged
        </Link>
      </div>

      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Competition
          <span className="mx-3 text-white/70">•</span>
          {competitionName(submission)}
        </h1>
      </div>

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

      {/* Judgement Preliminary (Read Only) */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-6">
          Judgement Preliminary
        </h2>

        <ScoreSummary criteriaList={criteriaList} scores={existingScores} />

        {/* Notes */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/80 mb-2">
            Notes For The Team
          </h3>
          <p className="text-white text-sm whitespace-pre-line">
            {notes || "-"}
          </p>
        </div>

        {/* Rekomendasi juri */}
        <RecommendationActions
          submissionId={params.submissionId}
          teamName={teamName}
          recommendation={recommendation}
        />
      </div>
    </div>
  );
}
