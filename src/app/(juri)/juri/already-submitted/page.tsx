"use client";

"use client";

import { SubmissionList } from "@/components/juri/submission-list";
import { useJudgeSubmissions } from "@/hooks/use-juri";

export default function AlreadySubmittedPage() {
  const { data: submissions } = useJudgeSubmissions();
  const isFinal = submissions?.[0]?.team?.competition?.activeRound === "FINAL";

  return (
    <SubmissionList
      scope="pending"
      title="Already Submitted"
      subtitle={
        isFinal
          ? "Babak Final sedang aktif. Pilih salah satu finalis di bawah ini untuk mengisi penilaian babak final."
          : "This is all participant that already submitted and judge can start for judgement."
      }
      basePath="/juri/already-submitted"
    />
  );
}
