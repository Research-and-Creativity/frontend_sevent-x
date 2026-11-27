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

export function statusBadge(status: SubmissionStatus | string): string {
  return status === "In Review"
    ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
    : "border-white/15 bg-white/[0.05] text-[#A9B7FF]";
}

// Hanya tampilkan tautan yang benar-benar diisi peserta — kompetisi Software
// Development mengisi GitHub/Demo Video, UI/UX mengisi Figma/Prototype.
export function externalLinks(sub: JudgeSubmissionItem) {
  const links: { label: string; url: string }[] = [];
  if (sub.githubUrl) links.push({ label: "Github Repository", url: sub.githubUrl });
  if (sub.deploymentUrl)
    links.push({ label: "Live Deployment", url: sub.deploymentUrl });
  if (sub.demoVideoUrl)
    links.push({ label: "Demonstration Video", url: sub.demoVideoUrl });
  if (sub.figmaUrl) links.push({ label: "Figma Design", url: sub.figmaUrl });
  if (sub.prototypeUrl) links.push({ label: "Prototype", url: sub.prototypeUrl });
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

export function originalityFile(sub: JudgeSubmissionItem): {
  name: string;
  size: string;
  url: string;
} | null {
  if (!sub.originalityFileUrl) return null;
  const name = sub.originalityFileUrl.split("/").pop() || "Deliverable";
  return { name, size: "-", url: sub.originalityFileUrl };
}

export function competitionName(sub: JudgeSubmissionItem): string {
  return sub.team?.competition?.name || "Competition";
}

// Juara 1, 2, dan 3 mendapat gelar podium, sisanya urutan biasa.
export function podiumLabel(rank: number): string {
  if (rank === 1) return "Juara 1";
  if (rank === 2) return "Juara 2";
  if (rank === 3) return "Juara 3";
  return `Peringkat ${rank}`;
}

export function formatScore(score: number): string {
  return Number.isInteger(score)
    ? String(score)
    : String(score.toFixed(2));
}

// Urutkan dari skor tertinggi (dan waktu submit tercepat sebagai tie-breaker) untuk "Top 3 Highest Score".
export function byTotalScoreDesc(
  list: JudgeSubmissionItem[]
): JudgeSubmissionItem[] {
  return [...list].sort((a, b) => {
    const scoreDiff =
      (b.evaluationStatus?.totalScore ?? 0) -
      (a.evaluationStatus?.totalScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : Infinity;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : Infinity;
    return timeA - timeB;
  });
}

export function formatCountdown(target: Date, currentNow = 0): string {
  if (currentNow === 0) return "--";
  const diffMs = target.getTime() - currentNow;
  if (diffMs <= 0) return "Closed";
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
}
