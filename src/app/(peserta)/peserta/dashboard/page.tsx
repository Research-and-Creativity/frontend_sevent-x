"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  RotateCcw,
  Clock,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { RULEBOOK_LINKS } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompetitionTimeline,
  useMyAnnouncements,
  useNewsFeed,
  useProfileComplete,
  PROFILE_REQUIRED_FIELDS,
  useSubmissionEligibility,
  useUserDocuments,
  useUserMe,
  useUserSubmission,
  useUserTeam,
} from "@/hooks/use-peserta";
import { useAnnouncementStore } from "@/store/announcement-store";
import { getTeamMemberLimits } from "@/lib/team-member-limits";
import { AnnouncementScoringTable } from "@/components/peserta/announcement-scoring-table";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Tombol pill putih sesuai desain
const pillButton =
  "cursor-pointer bg-white text-[#1B235E] hover:bg-white/90 rounded-full px-5 h-9 text-xs font-semibold shadow-sm";

const statCard =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5";

const documentLabels: Record<string, string> = {
  TWIBBON: "Twibbon",
  SHARE_STORY: "Post Story",
  KTM: "Student ID",
  INSTAGRAM_FOLLOW: "Follow Instagram Sevent.tup",
};

// Hitung mundur format "02d : 14h : 45m : 30s" dari tanggal target.
function formatCountdown(target: Date, currentNow = 0) {
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

function formatSubmitWib(iso: string | null | undefined) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const datePart = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const timePart = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });
  return `${datePart}, ${timePart} WIB`;
}

type AnnouncementBadgeTone = "winner" | "finalist" | "eliminated" | "neutral";

const ANNOUNCEMENT_BADGE_TONES: Record<AnnouncementBadgeTone, string> = {
  winner: "border-white/15 bg-white/[0.04] text-[#A9B7FF]",
  finalist: "border-white/10 bg-white/[0.03] text-emerald-400",
  eliminated: "border-white/10 bg-white/[0.03] text-rose-300",
  neutral: "border-white/10 bg-white/[0.03] text-white/70",
};

function resolveAnnouncementBadge(options: {
  isWinner: boolean;
  winnerRank?: number | null;
  isFinalist: boolean;
  round?: string;
  finalistLabel: string;
  fallbackNeutralLabel?: string;
}): { tone: AnnouncementBadgeTone; label: string } | null {
  if (options.isWinner) {
    return { tone: "winner", label: options.winnerRank ? `Juara ${options.winnerRank}` : "Pemenang" };
  }
  if (options.isFinalist) {
    return { tone: "finalist", label: options.finalistLabel };
  }
  if (options.round === "PENYISIHAN") {
    return { tone: "eliminated", label: "Tidak Lolos" };
  }
  if (options.fallbackNeutralLabel) {
    return { tone: "neutral", label: options.fallbackNeutralLabel };
  }
  return null;
}

function AnnouncementStatusBadge({
  tone,
  label,
}: {
  tone: AnnouncementBadgeTone;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium whitespace-nowrap ${ANNOUNCEMENT_BADGE_TONES[tone]}`}
    >
      {label}
    </span>
  );
}

export default function PesertaDashboardPage() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const id = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Reset badge "unread" di sidebar begitu overview dibuka. Dulu tugas ini
  // dipegang halaman Announcements yang kini sudah digabung ke sini.
  const markSeen = useAnnouncementStore((s) => s.markSeen);
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  const { data: user, isLoading: userLoading } = useUserMe();
  const { data: team } = useUserTeam();
  const { data: userDocuments = [] } = useUserDocuments();
  const { data: submission } = useUserSubmission();
  const { data: timeline = [] } = useCompetitionTimeline(team?.competition?.slug);
  const { isComplete: profileComplete, isLoading: profileLoading, missingFields } =
    useProfileComplete();

  // 1. Pengumuman hasil tim (lolos finalis / gugur) — bagian ini sebelumnya
  //    hanya ada di halaman announcements dan tidak pernah tampil di overview.
  const { data: myAnnouncementsData, isLoading: isAnnouncementsLoading } =
    useMyAnnouncements();

  // 2. Feed berita panitia lengkap: filter kategori + pagination.
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const {
    data: newsFeedData,
    isLoading: isNewsLoading,
    isPlaceholderData,
  } = useNewsFeed({ tag: activeFilter, page: currentPage, limit: pageSize });

  const newsList = newsFeedData?.news || [];
  const pagination = newsFeedData?.pagination || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Pengumuman hasil tim yang sudah dipublish.
  const publishedTeamAnnouncements = (
    myAnnouncementsData?.announcements || []
  ).filter((a) => a.publishedAt !== null);
  const teamInfo = myAnnouncementsData?.team;

  const hasJoined = Boolean(team);
  const rejectedDocuments = userDocuments.filter(
    (document) => document.status.toUpperCase() === "REJECT",
  );
  const paymentRejected =
    team?.paymentProof?.status?.toUpperCase() === "REJECT";

  // Status dokumen verifikasi per anggota. Selama ini data eligibility tidak
  // pernah ditampilkan di mana pun, padahal peserta baru tahu mereka harus
  // unggah Twibbon/KTM/dsb setelah membaca halaman kompetisi.
  const { data: eligibility } = useSubmissionEligibility();
  const teamMembers = eligibility?.requirements?.members ?? [];
  const docsAllApproved =
    eligibility?.requirements?.allMembersDocumentsApproved ?? false;

  const memberCount = team?.members?.length ?? 0;
  const memberLimits = getTeamMemberLimits(team?.competition?.slug);
  const maxMembers = team?.competition
    ? Math.min(team.competition.maxMember, memberLimits.max)
    : undefined;
  const memberProgress =
    maxMembers && maxMembers > 0
      ? Math.min(100, Math.round((memberCount / maxMembers) * 100))
      : 0;

  // Batas waktu mengikuti tahap timeline yang sedang berjalan. Tanpa tim,
  // tahapnya belum diketahui sehingga tidak ditampilkan.
  const activeStage = timeline.find((stage) => stage.isActive);
  const deadline = activeStage ? new Date(activeStage.endDate) : null;

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Welcome Banner */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
          {userLoading
            ? "Welcome back"
            : `Welcome back${user?.fullName ? `, ${user.fullName}` : ""}`}
        </h1>
      </div>

      {(rejectedDocuments.length > 0 || paymentRejected) && (
        <div className={`${glass} space-y-4 border-rose-500/30 p-6 lg:p-8`}>
          <h2 className="relative font-display text-lg font-bold tracking-tight text-white">
            Perlu Tindakan: Revisi dari Panitia
          </h2>
          {rejectedDocuments.map((document) => (
            <div
              key={document.id}
              className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Dokumen {documentLabels[document.type] ?? document.type} perlu direvisi
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {document.rejectionReason ||
                    "Panitia meminta Anda mengunggah ulang dokumen ini."}
                </p>
              </div>
              <Link href="/peserta/profile#verification-document" className="shrink-0">
                <Button className={pillButton}>Perbaiki Dokumen</Button>
              </Link>
            </div>
          ))}
          {paymentRejected && (
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Bukti pembayaran tim perlu direvisi
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {team.paymentProof?.rejectionReason ||
                    "Panitia meminta Anda mengunggah ulang bukti pembayaran yang valid."}
                </p>
              </div>
              <Link
                href={
                  team.competition?.slug
                    ? `/peserta/competition/${team.competition.slug}`
                    : "/peserta/competition"
                }
                className="shrink-0"
              >
                <Button className={pillButton}>Perbaiki Pembayaran</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Discord */}
      {!profileLoading && !profileComplete && (
        <div className={`${glass} flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8`}>
          <div className="relative flex items-start gap-3">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-white">
                Join the Sevent Discord server
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                All competition announcements are posted there, including your
                invitation link.
              </p>
            </div>
          </div>
          <Link href="/peserta/profile" className="shrink-0">
            <Button className={pillButton}>Add Discord Username</Button>
          </Link>
        </div>
      )}

      {/* Profile */}
      <div className={`${glass} p-6 lg:p-8`}>
        <div className="relative flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Profile
            </h2>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                !profileLoading && profileComplete
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/15 bg-white/[0.05] text-white/70"
              }`}
            >
              {PROFILE_REQUIRED_FIELDS.length - (missingFields?.length ?? 0)}/
              {PROFILE_REQUIRED_FIELDS.length} terisi
            </span>
          </div>
          {!profileLoading && !profileComplete && (
            <Link href="/peserta/profile">
              <Button className={pillButton}>Complete Profile</Button>
            </Link>
          )}
        </div>

        <p className="relative mb-4 text-sm text-text-secondary">
          {!profileLoading && profileComplete
            ? "Profil sudah lengkap dan terverifikasi."
            : "Lengkapi data identitas berikut untuk memenuhi syarat pendaftaran kompetisi."}
        </p>

        <ul className="relative grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_REQUIRED_FIELDS.map((field) => {
            const isFilled = Boolean(user?.[field.key]);
            return (
              <li
                key={field.key}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5"
              >
                {isFilled ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-white/30" />
                )}
                <span
                  className={
                    isFilled ? "text-sm text-white" : "text-sm text-text-secondary"
                  }
                >
                  {field.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sofdev Member Warning if < 3 */}
      {hasJoined && team?.competition?.slug === "software-development" && memberCount < 3 && (
        <div className={`${glass} border-white/10 bg-white/[0.025] p-6 lg:p-7 flex items-start gap-4`}>
          <AlertCircle className="h-5 w-5 text-white/60 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="font-display text-base font-bold text-white">
              Pemberitahuan: Anggota Tim Software Development Minimal 3 Orang
            </h3>
            <p className="text-white/80 mt-1 leading-relaxed">
              Tim Anda saat ini beranggotakan <span className="font-semibold text-white">{memberCount} orang</span>. Sesuai ketentuan, tim Software Development wajib memiliki minimal 3 anggota (termasuk ketua) sebelum dapat mengumpulkan karya.
            </p>
            {team?.teamCode && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/80">Kode Tim:</span>
                <span className="px-2.5 py-1 bg-white/10 rounded-md font-mono text-xs font-bold text-white tracking-widest border border-white/15">
                  {team.teamCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(team.teamCode);
                    toast.success("Kode tim berhasil disalin!");
                  }}
                  className="cursor-pointer text-xs font-sans px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors border border-white/15"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin Kode</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {hasJoined && (
        <div className={`${glass} px-6 py-5 lg:px-8`}>
          <div>
            <h2 className="relative font-display text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
              <span>Competition:</span>
              {team?.competition?.name && (
                <span>{team.competition.name}</span>
              )}
              {!isAnnouncementsLoading &&
                publishedTeamAnnouncements.length > 0 &&
                (() => {
                  const latestAnnouncement =
                    publishedTeamAnnouncements.find((a) => a.round === "FINAL") ??
                    publishedTeamAnnouncements[0];
                  const isFinalist = Boolean(latestAnnouncement.isFinalist);
                  const winnerRank = latestAnnouncement.rank;
                  const isWinner =
                    winnerRank === 1 || winnerRank === 2 || winnerRank === 3;

                  const badge = resolveAnnouncementBadge({
                    isWinner,
                    winnerRank,
                    isFinalist,
                    round: latestAnnouncement.round,
                    finalistLabel: "Lolos Finalis",
                  });
                  return badge ? <AnnouncementStatusBadge {...badge} /> : null;
                })()}
            </h2>
            {team?.competition?.slug && RULEBOOK_LINKS[team.competition.slug] && (
              <a
                href={RULEBOOK_LINKS[team.competition.slug].url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#7D8CFF]" />
                {RULEBOOK_LINKS[team.competition.slug].label}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Competition metrics — selalu tampil, meski belum bergabung tim */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Team Members */}
        <div className={`${glass} ${statCard}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
              Team Members
            </span>
            <Users className="h-4 w-4 text-text-secondary" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold leading-none text-white">
            {maxMembers ? (
              <>
                {memberCount}{" "}
                <span className="text-base font-normal text-text-secondary">
                  / {maxMembers}
                </span>
              </>
            ) : (
              "-"
            )}
          </div>
          <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#7D8CFF]"
              style={{ width: `${memberProgress}%` }}
            />
          </div>
          {team?.teamCode && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-text-secondary">
                Code: <span className="font-bold text-white tracking-wider">{team.teamCode}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(team.teamCode);
                  toast.success("Kode tim berhasil disalin!");
                }}
                className="cursor-pointer text-[11px] text-[#7D8CFF] hover:text-white flex items-center gap-1 transition-colors"
                title="Salin Kode Tim"
              >
                <Copy className="h-3 w-3" />
                <span>Salin</span>
              </button>
            </div>
          )}
        </div>

        {/* Submission Status */}
        <div className={`${glass} ${statCard} flex flex-col justify-between`}>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
                Submission Status
              </span>
              <RotateCcw className="h-4 w-4 text-text-secondary" />
            </div>
            <div
              className={`font-display text-xl sm:text-2xl font-bold ${
                hasJoined && !(eligibility?.requirements.paymentApproved)
                  ? "text-white/70"
                  : submission
                  ? "text-emerald-400"
                  : "text-rose-400"
              }`}
            >
              {hasJoined && !(eligibility?.requirements.paymentApproved)
                ? "Waiting for payment"
                : submission
                ? "Submitted"
                : "Not Submitted"}
            </div>
          </div>
          <div className="mt-4 pt-2">
            <Link
              href={
                team?.competition?.slug
                  ? `/peserta/competition/${team.competition.slug}`
                  : "/peserta/competition"
              }
              className="block"
            >
              <Button className="w-full text-xs font-semibold rounded-full bg-white text-[#1B235E] hover:bg-white/90 cursor-pointer shadow-sm">
                Submission Karya →
              </Button>
            </Link>
          </div>
        </div>

        {/* Time Remaining */}
        <div className={`${glass} ${statCard}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
              Time Remaining
            </span>
            <Clock className="h-4 w-4 text-text-secondary" />
          </div>
          <div className="font-display text-lg sm:text-xl font-bold tracking-wide text-white tabular-nums">
            {deadline ? formatCountdown(deadline, now) : "--"}
          </div>
          <p className="relative mt-2 text-[11px] text-text-secondary">
            Until submission deadline
          </p>
        </div>
      </div>

{!hasJoined && (
        <div className={`${glass} p-6 lg:p-8`}>
          <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-4">
            Competition
          </h2>
          <p className="relative text-sm text-text-secondary mb-6">
            You haven&apos;t registered in any competition or any team.
          </p>
          <Link href="/peserta/competition">
            <Button className={pillButton}>Join Now!</Button>
          </Link>
        </div>
      )}

      {/* Dokumen verifikasi — arahan singkat begitu tim terbentuk. Rincian
          per dokumen dan per anggota ada di halaman Competition. */}
      {hasJoined && teamMembers.length > 0 && (
        <div className={`${glass} p-6 lg:p-8`}>
          <h2 className="relative mb-1 font-display text-xl font-bold tracking-tight text-white">
            Dokumen Verifikasi
          </h2>
          <p className="relative text-sm text-text-secondary">
            {docsAllApproved
              ? "Semua dokumen anggota sudah disetujui. Kamu siap mengirim karya."
              : "Masih ada dokumen anggota yang belum disetujui. Lengkapi lewat halaman Profile."}
          </p>

          <ul className="relative mt-4 space-y-2">
            {teamMembers.map((member) => (
              <li
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <span className="text-sm text-white">
                  {member.fullName}
                  <span className="ml-2 text-xs font-normal text-text-secondary">
                    {member.role === "LEADER" ? "Leader" : "Anggota"}
                  </span>
                </span>
                <span
                  className={
                    member.allDocumentsApproved
                      ? "text-xs font-medium text-emerald-400"
                      : "text-xs font-medium text-white/50"
                  }
                >
                  {member.allDocumentsApproved
                    ? "Semua dokumen disetujui"
                    : "Menunggu kelengkapan"}
                </span>
              </li>
            ))}
          </ul>

          <div className="relative mt-5">
            <Link href="/peserta/competition">
              <Button className={pillButton}>Lihat Rincian Dokumen</Button>
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 1: PENGUMUMAN HASIL TIM — muncul hanya bila sudah dipublish */}
      {!isAnnouncementsLoading && publishedTeamAnnouncements.length > 0 && (
        <div className={`${glass} space-y-4 p-6 lg:p-8`}>
          {publishedTeamAnnouncements.map((announcement) => {
            const isFinalist = Boolean(announcement.isFinalist);
            const winnerRank = announcement.rank;
            const isWinner =
              winnerRank === 1 || winnerRank === 2 || winnerRank === 3;
            const competitionName =
              announcement.competition?.name ||
              teamInfo?.competition?.name ||
              "Kompetisi";
            const teamName = teamInfo?.teamName || "Tim Anda";
            const roundName = announcement.round || "PENYISIHAN";
            const roundLabel =
              announcement.round === "FINAL" ? "Babak Final" : "Babak Penyisihan";

            const publishedDate = announcement.publishedAt
              ? new Date(announcement.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={announcement.id}
                className={`relative overflow-hidden rounded-xl border p-5 transition-colors ${
                  isFinalist || isWinner
                    ? "border-white/15 bg-white/[0.025]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="relative z-10 space-y-3">
                  {/* Top Badge & Published Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const badge = resolveAnnouncementBadge({
                          isWinner,
                          winnerRank,
                          isFinalist,
                          round: announcement.round,
                          finalistLabel: "Lolos Finalis",
                          fallbackNeutralLabel: "Finalis Kompetisi",
                        });
                        return badge ? <AnnouncementStatusBadge {...badge} /> : null;
                      })()}

                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-xs font-medium text-white/70">
                        {roundName}
                      </span>
                    </div>

                    {publishedDate && (
                      <span className="text-xs text-text-secondary">
                        Diumumkan: {publishedDate}
                      </span>
                    )}
                  </div>

                  {/* Main Announcement Message */}
                  <div className="space-y-2">
                    <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white">
                      {isWinner
                        ? `Selamat! Tim ${teamName} Meraih Juara ${winnerRank}`
                        : isFinalist
                        ? `Selamat! Tim ${teamName} Lolos ke Babak Final`
                        : announcement.round === "FINAL"
                        ? "Pengumuman Hasil Babak Final"
                        : `Tim ${teamName} Belum Lolos ke Babak Final`}
                    </h2>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
                      {isWinner
                        ? `Selamat kepada tim ${teamName} (${competitionName})! Karya dan performa tim Anda berhasil meraih Juara ${winnerRank} pada ${roundLabel.toLowerCase()}. Terima kasih atas dedikasi dan kerja keras seluruh anggota tim.`
                        : isFinalist
                        ? `Selamat kepada tim ${teamName} (${competitionName})! Karya dan performa tim Anda berhasil masuk 5 besar pada ${roundLabel.toLowerCase()} dan dinyatakan lolos ke Babak Final. Persiapkan diri Anda untuk tahapan berikutnya sesuai jadwal yang ditentukan oleh panitia.`
                        : announcement.round === "FINAL"
                        ? `Terima kasih atas partisipasi dan dedikasi tim ${teamName} (${competitionName}) sebagai finalis pada ${roundLabel.toLowerCase()}. Tetap semangat dan terus berkarya!`
                        : `Terima kasih atas kerja keras dan karya yang telah tim ${teamName} (${competitionName}) kontribusikan pada ${roundLabel.toLowerCase()}. Meski kali ini belum berkesempatan melaju ke Babak Final, setiap proses dan masukan yang didapat tetap menjadi bekal berharga untuk karya berikutnya. Tetap semangat, terus berkarya, dan kami nantikan kembali keikutsertaan tim Anda di SEVENT X tahun depan. Anda tetap dapat meninjau rincian penilaian dan catatan juri di bawah ini.`}
                    </p>

                    {announcement.evaluation?.tieBreaker && (() => {
                      const tie = announcement.evaluation.tieBreaker;
                      const myTime = formatSubmitWib(tie.submittedAt);
                      const compTime = formatSubmitWib(tie.comparedSubmittedAt);
                      const targetLabel =
                        announcement.round === "FINAL"
                          ? `Juara ${tie.comparedRank}`
                          : `batas lolos peringkat #${tie.comparedRank}`;

                      return (
                        <p className="mt-3 max-w-2xl rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs sm:text-sm leading-relaxed text-text-secondary">
                          <span
                            className={`font-semibold ${
                              tie.status === "WON" ? "text-[#A9B7FF]" : "text-white"
                            }`}
                          >
                            Keterangan Nilai Seri (Peringkat #{tie.rank}):
                          </span>{" "}
                          {tie.status === "WON" ? (
                            tie.rule === "CRITERIA_SCORE" && tie.criteriaName ? (
                              <>
                                Skor akhir tim Anda ({tie.score.toFixed(2)}) sama dengan tim pada{" "}
                                {targetLabel}. Tim Anda unggul berdasarkan nilai kriteria utama{" "}
                                <strong className="text-white">&quot;{tie.criteriaName}&quot;</strong> (
                                <span className="text-white font-medium">
                                  {typeof tie.criteriaScore === "number" ? tie.criteriaScore.toFixed(2) : "-"}
                                </span>{" "}
                                dibanding{" "}
                                <span className="text-white font-medium">
                                  {typeof tie.comparedCriteriaScore === "number" ? tie.comparedCriteriaScore.toFixed(2) : "-"}
                                </span>
                                ).
                              </>
                            ) : (
                              <>
                                Skor akhir tim Anda ({tie.score.toFixed(2)}) sama dengan tim pada
                                peringkat #{tie.comparedRank}. Tim Anda unggul berdasarkan waktu
                                submit karya lebih cepat (
                                <span className="text-white font-medium">{myTime}</span>{" "}
                                dibanding{" "}
                                <span className="text-white font-medium">{compTime}</span>).
                              </>
                            )
                          ) : (
                            tie.rule === "CRITERIA_SCORE" && tie.criteriaName ? (
                              <>
                                Skor akhir tim Anda ({tie.score.toFixed(2)}) sama dengan tim pada{" "}
                                {targetLabel}. Penentuan peringkat memprioritaskan nilai kriteria utama{" "}
                                <strong className="text-white">&quot;{tie.criteriaName}&quot;</strong> — tim Anda memperoleh nilai{" "}
                                <span className="text-white font-medium">
                                  {typeof tie.criteriaScore === "number" ? tie.criteriaScore.toFixed(2) : "-"}
                                </span>
                                , sedangkan {targetLabel} memperoleh nilai{" "}
                                <span className="text-white font-medium">
                                  {typeof tie.comparedCriteriaScore === "number" ? tie.comparedCriteriaScore.toFixed(2) : "-"}
                                </span>
                                .
                              </>
                            ) : (
                              <>
                                Skor akhir tim Anda ({tie.score.toFixed(2)}) sama dengan tim pada{" "}
                                {targetLabel}. Penentuan peringkat memprioritaskan waktu submit
                                karya lebih cepat — tim Anda mengirim{" "}
                                <span className="text-white font-medium">{myTime}</span>, sedangkan{" "}
                                {targetLabel} mengirim{" "}
                                <span className="text-white font-medium">{compTime}</span>.
                              </>
                            )
                          )}
                        </p>
                      );
                    })()}

                    {announcement.evaluation && (
                      <AnnouncementScoringTable evaluation={announcement.evaluation} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: FEED BERITA & PENGUMUMAN PANITIA */}
      <div className={`${glass} space-y-6 p-6 lg:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Pengumuman &amp; Berita Panitia
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Informasi resmi terkini seputar kompetisi, jadwal, dan panduan dari panitia SEVENT X.
            </p>
          </div>

          {/* Filter Tabs Header */}
          <div className="flex items-center gap-2">
            {["All", "IMPORTANT", "INFO", "UPDATE"].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <Button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`h-8 cursor-pointer rounded-full border px-4 text-xs font-semibold transition-all ${
                    isActive
                      ? "border-white bg-white text-[#1B235E] shadow-sm hover:bg-white/90"
                      : "border-white/25 bg-white/[0.03] text-text-secondary hover:text-white"
                  }`}
                >
                  {filter === "All" ? "Semua" : filter}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {isNewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-md bg-white/[0.06]" />
                  <Skeleton className="h-4 w-28 rounded-md bg-white/[0.06]" />
                </div>
                <Skeleton className="h-7 w-3/4 rounded-lg bg-white/[0.06]" />
                <Skeleton className="h-16 w-full rounded-lg bg-white/[0.06]" />
                <Skeleton className="h-4 w-40 rounded-md bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          /* Empty State */
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-text-secondary">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-base text-white">
              Belum Ada Pengumuman
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {activeFilter !== "All"
                ? `Tidak ada berita atau pengumuman dengan kategori "${activeFilter}".`
                : "Panitia belum mengunggah pengumuman publik saat ini. Silakan periksa kembali nanti."}
            </p>
          </div>
        ) : (
          /* Announcement Cards List */
          <div className="space-y-4">
            {newsList.map((item) => {
              const tag = item.tag;
              const isImportant = tag === "IMPORTANT";
              const isInfo = tag === "INFO";

              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-";

              const authorName = item.author?.fullName || "Panitia SEVENT X";

              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]"
                >
                  {/* Top Row: Category Badge (Left) & Date (Right) */}
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-xs font-medium ${
                        isImportant
                          ? "text-rose-300"
                          : isInfo
                          ? "text-[#A9B7FF]"
                          : "text-emerald-400"
                      }`}
                    >
                      {tag}
                    </span>

                    <span className="text-xs text-text-secondary">
                      {formattedDate}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
                    {item.title}
                  </h2>

                  {/* Description / Content */}
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  {/* Footer: Posted By */}
                  <div className="border-t border-white/10 pt-2.5 text-xs text-text-secondary">
                    Diposting oleh{" "}
                    <strong className="text-white font-medium">
                      {authorName}
                    </strong>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <span className="text-xs font-mono text-text-secondary">
                  Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} Pengumuman)
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || isPlaceholderData}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="h-8 cursor-pointer rounded-lg border border-white/25 bg-white/[0.03] px-3 text-xs text-text-secondary transition-colors hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Sebelumnya</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= pagination.totalPages || isPlaceholderData}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8 cursor-pointer rounded-lg border border-white/25 bg-white/[0.03] px-3 text-xs text-text-secondary transition-colors hover:text-white disabled:opacity-40"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}