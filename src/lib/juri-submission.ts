import type { JudgeSubmissionItem } from "@/hooks/use-juri";

export type SubmissionStatus = "In Review" | "Judged";

export function leaderName(sub: JudgeSubmissionItem): string {
  return (
    sub.team?.members?.find((m) => m.role === "LEADER")?.user?.fullName || "-"
  );
}

export function memberNames(sub: JudgeSubmissionItem): string[] {
  return (sub.team?.members ?? []).map((m) => m.user.fullName);
}

export function submissionStatus(sub: JudgeSubmissionItem): SubmissionStatus {
  return sub.evaluationStatus?.isEvaluated ? "Judged" : "In Review";
}

export function formatSubmittedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function statusBadge(status: SubmissionStatus): string {
  return status === "In Review"
    ? "text-[#EAB308] border-[#EAB308]/60"
    : "text-[#3B5BFF] border-[#3B5BFF]/60";
}

// Hanya tampilkan tautan yang benar-benar diisi peserta.
export function externalLinks(sub: JudgeSubmissionItem) {
  const links: { label: string; url: string }[] = [];
  if (sub.githubUrl) links.push({ label: "Github Repository", url: sub.githubUrl });
  if (sub.deploymentUrl)
    links.push({ label: "Live Deployment", url: sub.deploymentUrl });
  if (sub.demoVideoUrl)
    links.push({ label: "Demonstration Video", url: sub.demoVideoUrl });
  return links;
}

export function proposalFile(sub: JudgeSubmissionItem): {
  name: string;
  size: string;
  url: string;
} | null {
  if (!sub.fileUrl) return null;
  const name = sub.fileUrl.split("/").pop() || "Deliverable";
  return { name, size: "-", url: sub.fileUrl };
}

export function competitionName(sub: JudgeSubmissionItem): string {
  return sub.team?.competition?.name || "Competition";
}

// 1-3 mendapat gelar podium, sisanya urutan biasa.
export function podiumLabel(rank: number): string {
  if (rank === 1) return "Winner";
  if (rank === 2) return "1st Runner Up";
  if (rank === 3) return "2nd Runner Up";
  return `Rank ${rank}`;
}

export function formatScore(score: number): string {
  return Number.isInteger(score)
    ? String(score)
    : String(score.toFixed(2));
}

// Urutkan dari skor tertinggi untuk "Top 3 Highest Score".
export function byTotalScoreDesc(
  list: JudgeSubmissionItem[]
): JudgeSubmissionItem[] {
  return [...list].sort(
    (a, b) =>
      (b.evaluationStatus?.totalScore ?? 0) -
      (a.evaluationStatus?.totalScore ?? 0)
  );
}

export function formatCountdown(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "Closed";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m`;
}
