"use client";

"use client";

import { SubmissionList } from "@/components/juri/submission-list";
import { useJudgeSubmissions } from "@/hooks/use-juri";

export default function JudgedPage() {
  const { data: submissions } = useJudgeSubmissions();
  const isFinal = submissions?.[0]?.team?.competition?.activeRound === "FINAL";

  return (
    <SubmissionList
      scope="judged"
      title="Judged"
      subtitle={
        isFinal
          ? "Babak Final sedang aktif. Daftar finalis yang sudah Anda nilai pada babak final."
          : "This is all participant that has been judged by you."
      }
      basePath="/juri/judged"
    />
  );
}
