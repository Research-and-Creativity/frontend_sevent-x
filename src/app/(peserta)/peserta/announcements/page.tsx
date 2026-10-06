"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Award,
  Sparkles,
  Megaphone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Info,
  Clock,
} from "lucide-react";
import { useMyAnnouncements, useNewsFeed } from "@/hooks/use-peserta";

export default function PesertaAnnouncementsPage() {
  // 1. Fetch Team Announcement (Results / Finalist)
  const { data: myAnnouncementsData, isLoading: isAnnouncementsLoading } =
    useMyAnnouncements();

  // 2. Filter & Pagination States for News Feed
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // 3. Fetch News Feed from Backend
  const {
    data: newsFeedData,
    isLoading: isNewsLoading,
    isPlaceholderData,
  } = useNewsFeed({
    tag: activeFilter,
    page: currentPage,
    limit: pageSize,
  });

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

  // Valid Published Team Announcements
  const publishedTeamAnnouncements = (
    myAnnouncementsData?.announcements || []
  ).filter((a) => a.publishedAt !== null);

  const teamInfo = myAnnouncementsData?.team;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* SECTION 1: BANNER PENGUMUMAN HASIL TIM (Hanya muncul jika sudah ada pengumuman yang dipublish) */}
      {!isAnnouncementsLoading && publishedTeamAnnouncements.length > 0 && (
        <div className="space-y-4">
          {publishedTeamAnnouncements.map((announcement) => {
            const isFinalist = Boolean(announcement.isFinalist);
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
                className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 border shadow-xl transition-all ${
                  isFinalist
                    ? "bg-linear-to-br from-amber-500/15 via-emerald-500/10 to-surface border-amber-500/40 text-white"
                    : "bg-linear-to-br from-surface via-card to-surface border-border/80 text-white"
                }`}
              >
                {/* Background Glow Accent */}
                {isFinalist && (
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="relative z-10 space-y-4">
                  {/* Top Badge & Published Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isFinalist ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>LOLOS SEBAGAI FINALIS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          <Award className="w-3.5 h-3.5 text-blue-400" />
                          <span>PENGUMUMAN HASIL SELEKSI</span>
                        </span>
                      )}

                      <span className="bg-white/10 text-text-secondary font-mono text-xs px-2.5 py-0.5 rounded-md">
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
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2.5">
                      {isFinalist ? (
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
                      {isFinalist
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-accent" />
              <span>Pengumuman & Berita Panitia</span>
            </h1>
            <p className="text-xs text-text-secondary mt-1">
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
                  className={`px-4 h-8 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary hover:bg-primary-hover text-white shadow-sm"
                      : "bg-surface hover:bg-card-hover border-border text-text-secondary hover:text-white"
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
              <Card
                key={i}
                className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-md bg-surface" />
                  <Skeleton className="h-4 w-28 rounded-md bg-surface" />
                </div>
                <Skeleton className="h-7 w-3/4 rounded-lg bg-surface" />
                <Skeleton className="h-16 w-full rounded-lg bg-surface" />
                <Skeleton className="h-4 w-40 rounded-md bg-surface" />
              </Card>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          /* Empty State */
          <Card className="bg-card/60 border border-white/10 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-text-secondary mx-auto">
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
          </Card>
        ) : (
          /* Announcement Cards List */
          <div className="space-y-4">
            {newsList.map((item) => {
              const tag = item.tag;
              const isImportant = tag === "IMPORTANT";
              const isInfo = tag === "INFO";
              const isUpdate = tag === "UPDATE";

              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "-";

              const authorName = item.author?.fullName || "Panitia SEVENT X";

              return (
                <Card
                  key={item.id}
                  className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm transition-all hover:border-white/20 space-y-3"
                >
                  {/* Top Row: Category Badge (Left) & Date (Right) */}
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                        isImportant
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : isInfo
                          ? "bg-primary/20 border-primary/40 text-accent"
                          : isUpdate
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "bg-card-hover border-border text-text-secondary"
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
                  <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs font-mono text-text-secondary">
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
                </Card>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <span className="text-xs font-mono text-text-secondary">
                  Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} Pengumuman)
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || isPlaceholderData}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="bg-surface hover:bg-card-hover border-border text-text-secondary hover:text-white text-xs h-8 px-3 rounded-lg cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span>Sebelumnya</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= pagination.totalPages || isPlaceholderData}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="bg-surface hover:bg-card-hover border-border text-text-secondary hover:text-white text-xs h-8 px-3 rounded-lg cursor-pointer disabled:opacity-40"
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
