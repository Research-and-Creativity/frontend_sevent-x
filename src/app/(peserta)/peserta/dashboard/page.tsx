"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  RotateCcw,
  Clock,
  Check,
  Trophy,
  Award,
  Sparkles,
  Megaphone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompetitionTimeline,
  useMyAnnouncements,
  useNewsFeed,
  useProfileComplete,
  useSubmissionEligibility,
  useUserMe,
  useUserSubmission,
  useUserTeam,
} from "@/hooks/use-peserta";
import { useAnnouncementStore } from "@/store/announcement-store";

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

// Hitung mundur format "02d : 14h : 45m" dari tanggal target.
function formatCountdown(target: Date) {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "Closed";

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m`;
}

export default function PesertaDashboardPage() {
  // Reset badge "unread" di sidebar begitu overview dibuka. Dulu tugas ini
  // dipegang halaman Announcements yang kini sudah digabung ke sini.
  const markSeen = useAnnouncementStore((s) => s.markSeen);
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  const { data: user, isLoading: userLoading } = useUserMe();
  const { data: team } = useUserTeam();
  const { data: submission } = useUserSubmission();
  const { data: timeline = [] } = useCompetitionTimeline(team?.competition?.slug);
  const { isComplete: profileComplete, isLoading: profileLoading } =
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

  // Status dokumen verifikasi per anggota. Selama ini data eligibility tidak
  // pernah ditampilkan di mana pun, padahal peserta baru tahu mereka harus
  // unggah Twibbon/KTM/dsb setelah membaca halaman kompetisi.
  const { data: eligibility } = useSubmissionEligibility();
  const teamMembers = eligibility?.requirements.members ?? [];
  const docsAllApproved =
    eligibility?.requirements.allMembersDocumentsApproved ?? false;

  const memberCount = team?.members?.length ?? 0;
  const maxMembers = team?.competition?.maxMember ?? 0;
  const memberProgress =
    maxMembers > 0
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
        <h1 className="relative font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
          {userLoading
            ? "Welcome back"
            : `Welcome back${user?.fullName ? `, ${user.fullName}` : ""}`}
        </h1>
      </div>

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
            <Button className={pillButton}>Add Discord ID</Button>
          </Link>
        </div>
      )}

      {/* Profile */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-4">
          Profile
        </h2>
        <ul className="relative space-y-1.5 mb-6">
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-white">•</span>
            <span>
              {!profileLoading && profileComplete ? (
                <>
                  Your profile has been verified
                  <Check className="ml-1 inline h-4 w-4 text-white" />
                </>
              ) : (
                "Please complete your identity"
              )}
            </span>
          </li>
        </ul>
        {!profileLoading && !profileComplete && (
          <Link href="/peserta/profile">
            <Button className={pillButton}>Complete Now!</Button>
          </Link>
        )}
      </div>

      {hasJoined ? (
        <>
          {/* Competition (title) */}
          <div className={`${glass} px-6 py-5 lg:px-8`}>
            <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
              Competition
              {team?.competition?.name && (
                <span className="ml-3 text-sm font-normal text-text-secondary">
                  • {team.competition.name}
                </span>
              )}
            </h2>
          </div>

          {/* Competition metrics */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Team Members */}
            <div className={`${glass} ${statCard}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
                  Team Members
                </span>
                <Users className="h-4 w-4 text-text-secondary" />
              </div>
              <div className="font-display text-3xl font-bold leading-none text-white">
                {memberCount}{" "}
                <span className="text-base font-normal text-text-secondary">
                  / {maxMembers}
                </span>
              </div>
              <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#7D8CFF]"
                  style={{ width: `${memberProgress}%` }}
                />
              </div>
            </div>

            {/* Submission Status */}
            <div className={`${glass} ${statCard}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
                  Submission Status
                </span>
                <RotateCcw className="h-4 w-4 text-text-secondary" />
              </div>
              <div
                className={`font-display text-2xl font-bold ${
                  submission ? "text-emerald-400" : "text-rose-500"
                }`}
              >
                {submission ? "Submitted" : "Not Submitted"}
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
              <div className="font-display text-2xl font-bold tracking-wide text-white">
                {deadline ? formatCountdown(deadline) : "--"}
              </div>
              <p className="relative mt-2 text-[11px] text-text-secondary">
                Until submission deadline
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Competition (belum join) */
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
                      : "text-xs font-medium text-amber-300"
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
            const isWinner = winnerRank === 1 || winnerRank === 2;
            const competitionName =
              announcement.competition?.name ||
              teamInfo?.competition?.name ||
              "Kompetisi";
            const teamName = teamInfo?.teamName || "Tim Anda";
            const roundName = announcement.round || "Babak Penyisihan";

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
                  isFinalist
                    ? "border-amber-500/40 bg-amber-500/[0.06]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {/* Kilau amber tipis, hanya untuk tim yang lolos */}
                {isFinalist && (
                  <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
                )}

                <div className="relative z-10 space-y-3">
                  {/* Top Badge & Published Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>JUARA {winnerRank}</span>
                        </span>
                      ) : isFinalist ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>LOLOS SEBAGAI FINALIS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                          <Award className="w-3.5 h-3.5 text-text-secondary" />
                          <span>PENGUMUMAN HASIL SELEKSI</span>
                        </span>
                      )}

                      <span className="rounded-md bg-white/[0.06] px-2.5 py-0.5 font-mono text-xs text-text-secondary">
                        {roundName}
                      </span>
                    </div>

                    {publishedDate && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Diumumkan: {publishedDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Main Announcement Message */}
                  <div className="space-y-2">
                    <h2 className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white">
                      {isWinner ? (
                        <>
                          <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
                          <span>
                            Selamat! Tim {teamName} Meraih Juara {winnerRank}
                          </span>
                        </>
                      ) : isFinalist ? (
                        <>
                          <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
                          <span>
                            Selamat! Tim {teamName} Lolos ke {roundName}
                          </span>
                        </>
                      ) : (
                        <>
                          <Info className="w-5 h-5 text-blue-400 shrink-0" />
                          <span>Pengumuman Hasil Seleksi {roundName}</span>
                        </>
                      )}
                    </h2>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
                      {isWinner
                        ? `Selamat kepada tim ${teamName} (${competitionName})! Karya dan performa tim Anda berhasil meraih Juara ${winnerRank} pada babak ${roundName}. Terima kasih atas dedikasi dan kerja keras seluruh anggota tim.`
                        : isFinalist
                        ? `Selamat kepada tim ${teamName} (${competitionName})! Karya dan performa tim Anda berhasil meraih nilai unggul dan dinyatakan lolos untuk melaju ke tahap ${roundName}. Persiapkan diri Anda untuk tahapan berikutnya sesuai jadwal yang ditentukan oleh panitia.`
                        : `Terima kasih atas partisipasi dan dedikasi tim ${teamName} (${competitionName}) pada babak ${roundName}. Tim Anda belum berhasil melaju ke babak selanjutnya pada kesempatan ini. Tetap semangat dan terus berkarya!`}
                    </p>
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
                  className={`h-8 cursor-pointer rounded-full border px-4 font-mono text-xs font-semibold transition-all ${
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
                      className={`rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                        isImportant
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                          : isInfo
                          ? "border-[#7D8CFF]/30 bg-[#7D8CFF]/10 text-[#7D8CFF]"
                          : "border-white/15 bg-white/[0.05] text-text-secondary"
                      }`}
                    >
                      {tag}
                    </span>

                    <span className="text-xs font-mono text-text-secondary flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
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
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs font-mono text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-text-secondary" />
                      <span>
                        Diposting oleh:{" "}
                        <strong className="text-white font-medium">
                          {authorName}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
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