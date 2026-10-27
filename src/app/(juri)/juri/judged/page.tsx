"use client";

import { SubmissionList } from "@/components/juri/submission-list";

export default function JudgedPage() {
  return (
    <SubmissionList
      scope="judged"
      title="Judged"
      subtitle="This is all participant that has been judged by you."
      basePath="/juri/judged"
    />
  );
}
