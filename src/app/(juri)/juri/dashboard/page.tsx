"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  AlertCircle,
  FileCheck2,
  BookOpen,
  ArrowRight,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { useJudgeSubmissions, JudgeSubmissionItem } from "@/hooks/use-juri";

export default function JuriDashboardPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe } = useUserMe();
  const currentUser = userMe || storeUser;

  const {
    data: submissions = [],
    isLoading,
    isError,
    refetch,
  } = useJudgeSubmissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SCORED">("ALL");

  // 1. Calculate 4 Stats
  const { totalAssigned, completedReviews, pendingReviews, avgScore, categoryName } =
    useMemo(() => {
      const total = submissions.length;
      const lockedSubs = submissions.filter(
        (s) => s.evaluationStatus?.isLocked === true
      );
      const completed = lockedSubs.length;
      const pending = total - completed;

      const sumScores = lockedSubs.reduce(
        (acc, s) => acc + (s.evaluationStatus?.totalScore || 0),
        0
      );
      const avg =
        completed > 0 ? (sumScores / completed).toFixed(1) : "-";

      const compName =
        submissions[0]?.team?.competition?.name || "Kompetisi Terdaftar";

      return {
        totalAssigned: total,
        completedReviews: completed,
        pendingReviews: pending,
        avgScore: avg,
        categoryName: compName,
      };
    }, [submissions]);

  // 2. Filter & Sort Submissions (Pending / Unlocked first as priority)
  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];

    // Priority sorting: Pending evaluations first
    list.sort((a, b) => {
      const aLocked = a.evaluationStatus?.isLocked ? 1 : 0;
      const bLocked = b.evaluationStatus?.isLocked ? 1 : 0;
      return aLocked - bLocked;
    });

    if (statusFilter === "PENDING") {
      list = list.filter((s) => !s.evaluationStatus?.isLocked);
    } else if (statusFilter === "SCORED") {
      list = list.filter((s) => s.evaluationStatus?.isLocked);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.team?.teamName?.toLowerCase().includes(q) ||
          s.projectTitle?.toLowerCase().includes(q) ||
          s.team?.teamCode?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [submissions, statusFilter, searchQuery]);

  const judgeDisplayName = currentUser?.fullName || "Juri";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header Greeting */}
      <div className="space-y-1.5 pb-2 border-b border-border/40">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Selamat Datang, <span className="text-accent">{judgeDisplayName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-3xl leading-relaxed">
          {submissions.length > 0 ? (
            <>
              Anda ditugaskan menilai karya untuk kategori{" "}
              <strong className="text-white font-semibold">{categoryName}</strong>
              . Silakan lakukan evaluasi karya peserta sebelum batas waktu penilaian berakhir.
            </>
          ) : (
            "Portal evaluasi dan penilaian karya kompetisi SEVENT X 2026."
          )}
        </p>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-2xl bg-card/60" />
            <Skeleton className="h-28 rounded-2xl bg-card/60" />
            <Skeleton className="h-28 rounded-2xl bg-card/60" />
            <Skeleton className="h-28 rounded-2xl bg-card/60" />
          </div>
          <Skeleton className="h-96 rounded-2xl bg-card/60" />
        </div>
      ) : isError ? (
        /* Error State */
        <Card className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-base">
              Gagal Memuat Data Submission
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Terjadi kendala saat mengambil daftar karya peserta untuk akun juri Anda.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => refetch()}
            className="bg-primary text-white text-xs h-8 rounded-xl cursor-pointer"
          >
            Coba Lagi
          </Button>
        </Card>
      ) : submissions.length === 0 ? (
        /* Empty State: No Submissions / Not Assigned */
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-10 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-text-secondary mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-display font-bold text-lg text-white">
              Anda Belum Memiliki Karya untuk Dinilai
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Belum ada karya submission yang diunggah oleh peserta pada cabang kompetisi Anda,
              atau akun Anda belum ditugaskan oleh admin ke cabang kompetisi tertentu.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/juri/help">
              <Button
                variant="outline"
                className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-4 h-9 rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>Buka Panduan & Rubrik Penilaian</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Content State: Stats & Submissions */
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
              <span className="font-mono text-xs font-semibold uppercase text-text-secondary tracking-wider block">
                TOTAL DITUGASKAN
              </span>
              <p className="font-display text-3xl font-bold text-white">
                {totalAssigned}
              </p>
              <p className="text-xs text-text-secondary">Karya peserta masuk</p>
            </Card>

            {/* Stat Card 2 */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
              <span className="font-mono text-xs font-semibold uppercase text-text-secondary tracking-wider block">
                SELESAI DINILAI
              </span>
              <p className="font-display text-3xl font-bold text-emerald-400">
                {completedReviews}
              </p>
              <p className="text-xs text-text-secondary">Nilai final tersimpan & terkunci</p>
            </Card>

            {/* Stat Card 3 (Actionable Highlighted Card with Accent Border) */}
            <Card className="bg-card/90 border-2 border-accent/60 rounded-2xl p-5 space-y-2 shadow-lg">
              <span className="font-mono text-xs font-semibold uppercase text-accent tracking-wider block">
                MENUNGGU EVALUASI
              </span>
              <p className="font-display text-3xl font-bold text-accent">
                {pendingReviews}
              </p>
              <p className="text-xs text-text-secondary">Karya perlu dinilai</p>
            </Card>

            {/* Stat Card 4 */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg">
              <span className="font-mono text-xs font-semibold uppercase text-text-secondary tracking-wider block">
                RATA-RATA NILAI
              </span>
              <p className="font-display text-3xl font-bold text-white">
                {avgScore}
              </p>
              <p className="text-xs text-text-secondary">Dari karya yang telah dinilai</p>
            </Card>
          </div>

          {/* Main Grid: Left Column (2/3 Width) vs Right Column (1/3 Width) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel Besar "Assigned Submissions" (LEFT COLUMN - 2/3 Width) */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-0.5">
                    <h2 className="font-display text-xl font-bold text-white tracking-tight">
                      Daftar Karya Peserta
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Klik pada baris karya untuk membuka console evaluasi dan penilaian.
                    </p>
                  </div>

                  {/* Filter Badges */}
                  <div className="flex items-center gap-1.5 bg-surface border border-border/80 rounded-xl p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ALL")}
                      className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                        statusFilter === "ALL"
                          ? "bg-card text-white font-semibold shadow-xs"
                          : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Semua ({totalAssigned})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("PENDING")}
                      className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                        statusFilter === "PENDING"
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                          : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Perlu Dinilai ({pendingReviews})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("SCORED")}
                      className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                        statusFilter === "SCORED"
                          ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                          : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Selesai ({completedReviews})
                    </button>
                  </div>
                </div>

                {/* Submissions Table */}
                {filteredSubmissions.length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-text-secondary">
                    <FileCheck2 className="w-8 h-8 mx-auto opacity-40 mb-1" />
                    <p className="text-xs font-semibold text-white">
                      Tidak ada karya ditemukan
                    </p>
                    <p className="text-[11px]">
                      Tidak ada submission yang sesuai dengan filter yang dipilih.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-text-secondary font-mono uppercase tracking-wider">
                          <th className="pb-3 font-semibold">NAMA TIM</th>
                          <th className="pb-3 font-semibold">JUDUL KARYA</th>
                          <th className="pb-3 font-semibold">STATUS</th>
                          <th className="pb-3 font-semibold text-right">TOTAL NILAI</th>
                          <th className="pb-3 font-semibold text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredSubmissions.map((sub) => {
                          const isLocked = sub.evaluationStatus?.isLocked === true;
                          const isEvaluated = sub.evaluationStatus?.isEvaluated === true;
                          const totalScore = sub.evaluationStatus?.totalScore ?? 0;
                          const memberCount = sub.team?.members?.length || 1;

                          return (
                            <tr
                              key={sub.id}
                              className="hover:bg-surface/60 transition-colors group"
                            >
                              {/* TEAM NAME */}
                              <td className="py-4 pr-4">
                                <Link
                                  href={`/juri/team/${sub.id}`}
                                  className="block"
                                >
                                  <p className="font-display font-bold text-white text-sm group-hover:text-accent transition-colors">
                                    {sub.team?.teamName || "Nama Tim"}
                                  </p>
                                  <span className="font-mono text-[10px] text-text-secondary uppercase">
                                    #{sub.team?.teamCode || "ID"} • {memberCount} Anggota
                                  </span>
                                </Link>
                              </td>

                              {/* PROJECT TITLE */}
                              <td className="py-4 pr-4 max-w-xs">
                                <Link
                                  href={`/juri/team/${sub.id}`}
                                  className="block"
                                >
                                  <p className="text-xs text-white/90 truncate font-medium">
                                    {sub.projectTitle || "Karya Proyek"}
                                  </p>
                                  <p className="text-[10px] text-text-secondary truncate font-mono">
                                    {sub.team?.competition?.name || "Kompetisi"}
                                  </p>
                                </Link>
                              </td>

                              {/* STATUS */}
                              <td className="py-4 pr-4 whitespace-nowrap">
                                {isLocked ? (
                                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                                    <Check className="w-3.5 h-3.5" /> Dinilai
                                  </span>
                                ) : isEvaluated ? (
                                  <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                                    <Clock className="w-3.5 h-3.5" /> Draft
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                                    <Clock className="w-3.5 h-3.5" /> Belum Dinilai
                                  </span>
                                )}
                              </td>

                              {/* SCORE */}
                              <td className="py-4 text-right whitespace-nowrap">
                                <span
                                  className={`font-display font-bold text-sm ${
                                    isLocked
                                      ? "text-accent"
                                      : isEvaluated
                                      ? "text-amber-400"
                                      : "text-text-secondary/50 font-mono"
                                  }`}
                                >
                                  {isLocked
                                    ? `${totalScore}`
                                    : isEvaluated
                                    ? `${totalScore} (Draft)`
                                    : "--"}
                                </span>
                              </td>

                              {/* ACTION */}
                              <td className="py-4 text-right whitespace-nowrap">
                                <Link href={`/juri/team/${sub.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`text-xs h-7 px-3 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                      !isLocked
                                        ? "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20"
                                        : "bg-surface border-border text-text-secondary hover:text-white"
                                    }`}
                                  >
                                    <span>{isLocked ? "Lihat Nilai" : "Beri Nilai"}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Kolom Kanan (RIGHT COLUMN - 1/3 Width) */}
            <div className="space-y-6">
              {/* Card Panduan Rubrik Penilaian */}
              <Card className="bg-card/90 border border-accent/40 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 text-accent font-display font-bold text-base">
                  <BookOpen className="w-5 h-5" />
                  <span>Rubrik & Pedoman Penilaian</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Gunakan rubrik penilaian resmi sebagai standar objektif dalam memberikan poin pada kriteria inovasi, arsitektur teknis, dan desain solusi.
                </p>

                {process.env.NEXT_PUBLIC_GUIDEBOOK_URL ? (
                  <a
                    href={process.env.NEXT_PUBLIC_GUIDEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-accent" />
                      <span>Unduh Rubrik Lengkap (PDF)</span>
                    </Button>
                  </a>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full bg-surface border-border/40 text-text-secondary text-xs font-semibold h-9 rounded-xl opacity-50 cursor-not-allowed"
                  >
                    Rubrik Belum Tersedia
                  </Button>
                )}
              </Card>

              {/* Card Shortcut Buka Direktori Tim */}
              <Card className="bg-surface/50 border border-white/10 rounded-2xl p-6 space-y-3 shadow-md">
                <h3 className="font-display font-bold text-white text-sm">
                  Direktori Tim Peserta
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Lihat daftar seluruh tim peserta dan profil anggota yang terdaftar pada kompetisi Anda.
                </p>
                <Link href="/juri/team" className="block pt-1">
                  <Button
                    variant="outline"
                    className="w-full bg-card hover:bg-card-hover border-border text-white text-xs font-semibold h-9 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Buka Direktori Tim</span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
