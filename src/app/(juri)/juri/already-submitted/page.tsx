"use client";

import { SubmissionList } from "@/components/juri/submission-list";

export default function AlreadySubmittedPage() {
  return (
    <SubmissionList
      scope="pending"
      title="Already Submitted"
      subtitle="This is all participant that already submitted and judge can start for judgement."
      basePath="/juri/already-submitted"
    />
  );
}
