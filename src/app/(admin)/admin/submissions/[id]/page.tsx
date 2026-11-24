"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { useAdminSubmissionDetail } from "@/hooks/use-admin";
import { SubmissionAccordion } from "@/components/juri/submission-accordion";

export default function AdminSubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id || "";

  const { data: submission, isLoading, isError } = useAdminSubmissionDetail(submissionId);

  const formattedSubmittedDate = useMemo(() => {
    if (!submission?.submittedAt) return "-";
    const d = new Date(submission.submittedAt);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [submission?.submittedAt]);

  const externalLinks = useMemo(() => {
    if (!submission) return [];
    const links: { label: string; url: string }[] = [];
    if (submission.githubUrl) {
      links.push({ label: "GitHub Repository", url: submission.githubUrl });
    }
    if (submission.demoVideoUrl) {
      links.push({ label: "Demonstration Video", url: submission.demoVideoUrl });
    }
    if (submission.deploymentUrl) {
      links.push({ label: "Live Deployment", url: submission.deploymentUrl });
    }
    if (submission.figmaUrl) {
      links.push({ label: "Figma Design", url: submission.figmaUrl });
    }
    if (submission.prototypeUrl) {
      links.push({ label: "Interactive Prototype", url: submission.prototypeUrl });
    }
    return links;
  }, [submission]);

  const proposal = useMemo(() => {
    if (!submission?.fileUrl) return null;
    const name =
      submission.fileName || submission.fileUrl.split("/").pop() || "Proposal Karya";
    const size = submission.fileSize
      ? `${(submission.fileSize / 1024 / 1024).toFixed(2)} MB`
      : "-";
    return { name, size, url: submission.fileUrl };
  }, [submission?.fileUrl, submission?.fileName, submission?.fileSize]);

  const originalityProposal = useMemo(() => {
    if (!submission?.originalityFileUrl) return null;
    const name =
      submission.originalityFileName ||
      submission.originalityFileUrl.split("/").pop() ||
      "Proposal Orisinalitas";
    const size = submission.originalityFileSize
      ? `${(submission.originalityFileSize / 1024 / 1024).toFixed(2)} MB`
      : "-";
    return { name, size, url: submission.originalityFileUrl };
  }, [
    submission?.originalityFileUrl,
    submission?.originalityFileName,
    submission?.originalityFileSize,
  ]);

  // Group scores by judge
  const judgeScoresGrouped = useMemo(() => {
    if (!submission?.scores || submission.scores.length === 0) return [];
    const map = new Map<
      string,
      {
        judgeName: string;
        scores: NonNullable<typeof submission.scores>;
        totalScore: number;
        feedback?: string | null;
      }
    >();

    for (const scoreItem of submission.scores) {
      const jId = scoreItem.judgeId || scoreItem.id;
      const jName = scoreItem.judge?.user?.fullName || "Dewan Juri";
      if (!map.has(jId)) {
        const evalItem = submission.judgeEvaluations?.find((e) => e.judgeId === jId);
        map.set(jId, {
          judgeName: jName,
          scores: [],
          totalScore: 0,
          feedback: evalItem?.feedback,
        });
      }
      const entry = map.get(jId)!;
      entry.scores.push(scoreItem);
      entry.totalScore += Number(scoreItem.score) || 0;
    }

    return Array.from(map.values());
  }, [submission?.scores, submission?.judgeEvaluations]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-white/60">Memuat detail submission...</p>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Already Submitted
        </Link>
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-rose-400 font-semibold mb-2">Submission Tidak Ditemukan</p>
          <p className="text-sm text-white/50 mb-4">
            Data karya tidak ditemukan atau ID tidak valid.
          </p>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const teamMembers =
    submission.team?.members?.map((m) => {
      const roleLabel = m.role === "LEADER" ? "Ketua Tim" : "Anggota";
      const inst = m.user.institution ? ` (${m.user.institution})` : "";
      return `${m.user.fullName} - ${roleLabel}${inst}`;
    }) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Already Submitted</span>
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.03] text-white/80 border border-white/10">
                {submission.team?.competition?.name || "Kompetisi"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.03] text-white/60 border border-white/10">
                {submission.team?.teamCode}
              </span>
              {submission.team?.competition?.activeRound && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.03] text-white/60 border border-white/10">
                  Babak {submission.team.competition.activeRound === "FINAL" ? "Final" : "Penyisihan"}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-white">
              {submission.team?.teamName || "Tanpa Nama Tim"}
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              Waktu Submit:
            </span>
            <span className="text-white font-medium text-sm">
              {formattedSubmittedDate} WIB
            </span>
          </div>
        </div>
      </div>

      {/* Submission Accordion Component */}
      <SubmissionAccordion
        team={{
          name: submission.team?.teamName || "Tim Peserta",
          members: teamMembers,
        }}
        product={{
          title: submission.projectTitle || "Untitled Product",
          description: submission.description || "Tidak ada deskripsi produk.",
        }}
        externalLinks={externalLinks}
        proposal={proposal}
        originalityProposal={originalityProposal}
        defaultOpen={true}
      />

      {/* Rincian Penilaian Juri */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">
            Penilaian Dewan Juri
          </h2>
          <p className="text-xs text-white/40 mt-1">
            Rekap skor dan catatan evaluasi yang telah diberikan juri
          </p>
        </div>

        {judgeScoresGrouped.length === 0 ? (
          <div className="text-center py-8 border border-white/5 rounded-xl bg-white/[0.01]">
            <p className="text-sm text-white/50">
              Belum ada nilai atau evaluasi yang dimasukkan oleh dewan juri untuk karya ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {judgeScoresGrouped.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white text-sm">
                    {item.judgeName}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/10 text-white">
                    Total: {item.totalScore.toFixed(2)}
                  </span>
                </div>

                {/* Score breakdown per criteria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.scores.map((sc) => (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-white/70 truncate pr-2">
                        {sc.criteria?.name || "Kriteria"}
                      </span>
                      <span className="font-mono font-medium text-white shrink-0">
                        {sc.score} / {sc.criteria?.maxScore ?? 100}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                {item.feedback && (
                  <div className="text-xs text-white/70 p-3 rounded-lg bg-white/[0.02] border border-white/5 mt-2">
                    <span className="block font-medium text-white/50 mb-1">Catatan Evaluasi:</span>
                    <p className="whitespace-pre-wrap">{item.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
