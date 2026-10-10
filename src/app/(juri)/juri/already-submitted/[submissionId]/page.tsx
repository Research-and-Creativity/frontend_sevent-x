"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import { toast } from "sonner";

import { SubmissionAccordion } from "@/components/juri/submission-accordion";
import {
  useJudgeSubmissionDetail,
  useSubmitJudgeScore,
} from "@/hooks/use-juri";
import type {
  JudgeSubmissionDetailResponse,
  JudgeSubmissionScore,
} from "@/hooks/use-juri";
import {
  competitionName,
  externalLinks,
  memberNames,
  proposalFile,
} from "@/lib/juri-submission";
import { getErrorMessage } from "@/lib/errors";

const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

const glassInput =
  "h-14 rounded-full px-6 bg-white/[0.03] border border-white/30 backdrop-blur-md " +
  "text-white placeholder:text-white/40 focus-visible:border-[#7D8CFF]/70 " +
  "focus-visible:ring-0 disabled:opacity-60";

type Criteria = JudgeSubmissionDetailResponse["criteriaList"];

interface ScoringFormProps {
  submissionId: string;
  teamName: string;
  criteriaList: Criteria;
  existingScores: JudgeSubmissionScore[];
  feedback: string | null;
  isLocked: boolean;
}

// Dipisah dari halaman agar state form bisa diinisialisasi sekali dari data
// yang sudah dimuat, tanpa efek setelah render.
function ScoringForm({
  submissionId,
  teamName,
  criteriaList,
  existingScores,
  feedback,
  isLocked,
}: ScoringFormProps) {
  const router = useRouter();
  const submitScore = useSubmitJudgeScore(submissionId);

  const [scores, setScores] = useState<Record<string, string>>(() => {
    const seeded: Record<string, string> = {};
    for (const s of existingScores) seeded[s.criteriaId] = String(s.score);
    return seeded;
  });
  const [notes, setNotes] = useState(() => feedback ?? "");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const missing = useMemo(
    () =>
      criteriaList.filter((c) => {
        const raw = scores[c.id];
        return raw === undefined || raw === "" || Number.isNaN(Number(raw));
      }),
    [criteriaList, scores]
  );

  const outOfRange = useMemo(
    () =>
      criteriaList.filter((c) => {
        const raw = scores[c.id];
        if (raw === undefined || raw === "") return false;
        const n = Number(raw);
        return n < 0 || n > c.maxScore;
      }),
    [criteriaList, scores]
  );

  const canSubmit =
    criteriaList.length > 0 && missing.length === 0 && outOfRange.length === 0;

  const handleConfirmSubmit = async () => {
    if (!canSubmit) return;

    try {
      await submitScore.mutateAsync({
        scores: criteriaList.map((c) => ({
          criteriaId: c.id,
          score: Number(scores[c.id]),
        })),
        feedback: notes.trim(),
        isDraft: false,
      });
      setIsConfirmOpen(false);
      toast.success(`Penilaian untuk "${teamName}" berhasil dikirim!`);
      router.push("/juri/already-submitted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengirim penilaian."));
    }
  };

  return (
    <>
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-6">
          Judgement Preliminary
        </h2>

        {criteriaList.length === 0 ? (
          <p className="text-sm text-white/60">
            Kriteria penilaian belum disiapkan panitia.
          </p>
        ) : (
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {criteriaList.map((c) => {
              const invalid =
                scores[c.id] !== undefined &&
                scores[c.id] !== "" &&
                (Number(scores[c.id]) < 0 || Number(scores[c.id]) > c.maxScore);
              return (
                <div key={c.id} className="space-y-2">
                  <label htmlFor={c.id} className="block text-sm text-white/60">
                    {c.name} <span className="text-white/40">(0-{c.maxScore})</span>
                  </label>
                  <Input
                    id={c.id}
                    type="number"
                    min={0}
                    max={c.maxScore}
                    disabled={isLocked || submitScore.isPending}
                    value={scores[c.id] ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    placeholder="0"
                    className={`${glassInput} ${invalid ? "border-rose-400/70" : ""}`}
                  />
                  {invalid && (
                    <p className="text-xs text-rose-400">
                      Nilai maksimal {c.maxScore}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="relative mt-5 space-y-2">
          <label htmlFor="notes" className="block text-sm text-white/60">
            Notes for the Team
          </label>
          <Textarea
            id="notes"
            rows={4}
            disabled={isLocked || submitScore.isPending}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="min-h-32 rounded-2xl px-6 py-4 bg-white/[0.03] border border-white/30 backdrop-blur-md text-white placeholder:text-white/40 focus-visible:border-[#7D8CFF]/70 focus-visible:ring-0 resize-none disabled:opacity-60"
          />
        </div>

        {isLocked ? (
          <p className="relative mt-6 text-sm text-amber-400">
            Penilaian ini sudah dikunci dan tidak dapat diubah.
          </p>
        ) : (
          <>
            {missing.length > 0 && criteriaList.length > 0 && (
              <p className="relative mt-4 text-xs text-white/60">
                Isi semua kriteria sebelum mengirim penilaian.
              </p>
            )}
            <div className="relative mt-6 flex justify-end">
              <button
                type="button"
                disabled={!canSubmit || submitScore.isPending}
                onClick={() => setIsConfirmOpen(true)}
                className="cursor-pointer px-10 py-3 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitScore.isPending ? "Mengirim..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Konfirmasi Submit"
        description={`Apakah Anda yakin ingin mengirimkan penilaian untuk "${teamName}"? Penilaian yang sudah dikirim tidak dapat diubah kembali.`}
        confirmText="Ya, Submit"
        cancelText="Batal"
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
}

export default function AlreadySubmittedDetailPage() {
  const params = useParams<{ submissionId: string }>();
  const submissionId = params.submissionId;

  const { data, isLoading, isError, refetch } =
    useJudgeSubmissionDetail(submissionId);

  const submission = data?.submission;
  const criteriaList = data?.criteriaList ?? [];
  const existingScores = data?.existingScores ?? [];
  const feedback = data?.evaluation?.feedback ?? null;
  const isLocked = data?.evaluationStatus?.isLocked ?? false;
  const teamName = submission?.team?.teamName ?? "-";

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
        <p className="text-xs text-white/60">
          Pastikan karya ini memang dinilai oleh Anda.
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
          href="/juri/already-submitted"
          className="text-sm text-text-secondary hover:text-white transition-colors"
        >
          ← Back to Already Submitted
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
      />

      {/* key memaksa form dibangun ulang bila juri/data berganti, sehingga
          nilai draft lama tidak terbawa ke submission berikutnya. */}
      <ScoringForm
        key={submissionId}
        submissionId={submissionId}
        teamName={teamName}
        criteriaList={criteriaList}
        existingScores={existingScores}
        feedback={feedback}
        isLocked={isLocked}
      />
    </div>
  );
}
