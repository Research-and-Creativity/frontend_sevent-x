"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useUserMe,
  useUserTeam,
  useUserSubmission,
  useNewsAnnouncements,
  useCompetitionTimeline,
} from "@/hooks/use-peserta";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  HelpCircle,
  UploadCloud,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowUpRight,
  Sparkles,
  CalendarDays,
  FileCode2,
} from "lucide-react";

export default function PesertaDashboardPage() {
  const { data: user, isLoading: isUserLoading, isError: isUserError, refetch: refetchUser } = useUserMe();
  const { data: team, isLoading: isTeamLoading, isError: isTeamError, refetch: refetchTeam } = useUserTeam();
  const { data: submission, isLoading: isSubLoading, isError: isSubError, refetch: refetchSub } = useUserSubmission();
  const { data: news = [], isLoading: isNewsLoading } = useNewsAnnouncements();
  const { data: timeline = [], isLoading: isTimelineLoading } = useCompetitionTimeline();

  // Live Countdown State for Time Remaining Card
  const [timeLeft, setTimeLeft] = useState({ days: 55, hours: 14, mins: 32 });

  useEffect(() => {
    const target = new Date("2026-10-15T23:59:59Z").getTime();
    const updateTime = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft({ days, hours, mins });
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const isLoading = isUserLoading || isTeamLoading || isSubLoading;
  const hasError = isUserError || isTeamError || isSubError;

  const handleRetryAll = () => {
    refetchUser();
    refetchTeam();
    refetchSub();
  };

  // Helper for Member count calculation
  const memberCount = team?.members?.length || 1;
  const maxMembers = 3;
  const teamProgress = Math.min(100, Math.round((memberCount / maxMembers) * 100));

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
            Competition Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Pantau progres tim, berkas karya, dan jadwal kompetisi SEVENT X.
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            className="relative p-2.5 rounded-xl bg-card border border-border text-text-secondary hover:text-white hover:border-accent/40 transition-all"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent animate-pulse" />
          </button>

          <Link href="/peserta/help">
            <button
              className="p-2.5 rounded-xl bg-card border border-border text-text-secondary hover:text-white hover:border-accent/40 transition-all"
              title="Help & FAQ"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </Link>

          <Link href="/peserta/submission">
            <Button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 h-10 rounded-xl shadow-lg shadow-primary/25 flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              <span>Submit Project</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Retry Alert Banner */}
      {hasError && (
        <div className="bg-danger/10 border border-danger/40 rounded-2xl p-4 flex items-center justify-between text-danger">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">
              Gagal memuat beberapa data dari server backend. Tampilan menggunakan data cadangan sementara.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetryAll}
            className="border-danger/40 text-danger hover:bg-danger/20 text-xs font-bold shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Welcome Banner */}
      {isLoading ? (
        <Skeleton className="h-36 w-full rounded-2xl bg-card/60" />
      ) : (
        <div className="relative bg-gradient-to-r from-[#111A3A] via-[#0E1530] to-[#0A0F24] border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
          {/* Subtle Decorative Mesh Glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/20 text-accent border border-primary/30 font-mono text-xs">
                  Web Development Track
                </Badge>
                <Badge variant="outline" className="border-border text-text-secondary text-xs">
                  {user?.institution || "Telkom University"}
                </Badge>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name || "Alex Septiadi"}! 👋
              </h2>

              <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
                Tim kamu <span className="text-white font-semibold">{team?.name || "Apex Innovators"}</span> siap melangkah ke tahap pengumpulan akhir karya. Pastikan semua berkas telah lengkap.
              </p>
            </div>

            {/* Countdown Badge Pill */}
            <div className="bg-surface/80 border border-white/10 p-4 rounded-xl flex items-center gap-3 shrink-0 shadow-lg">
              <div className="p-2.5 rounded-lg bg-urgent-soft border border-urgent/40 text-urgent">
                <Clock className="w-5 h-5 text-urgent animate-pulse" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-text-secondary font-semibold">
                  Deadline Upload Karya
                </p>
                <p className="font-display text-lg font-bold text-urgent">
                  {timeLeft.days} Hari {timeLeft.hours} Jam Lagi
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Team Members */}
        {isLoading ? (
          <Skeleton className="h-44 rounded-2xl bg-card/60" />
        ) : (
          <Card className="bg-card hover:bg-card-hover border-border border shadow-xl transition-all rounded-2xl flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase text-text-secondary">
                  Team Members
                </span>
                <div className="p-2 rounded-lg bg-surface border border-border text-accent">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <CardTitle className="font-display text-3xl font-extrabold text-white">
                {memberCount} <span className="text-text-secondary text-lg font-normal">/ {maxMembers}</span>
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                {memberCount >= maxMembers
                  ? "Anggota tim lengkap (Verified)"
                  : `Kurang ${maxMembers - memberCount} anggota lagi`}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <Progress value={teamProgress} className="h-2 bg-surface" />
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tim Siap
                </span>
                <Link
                  href="/peserta/team"
                  className="text-accent hover:underline font-semibold flex items-center gap-1 group"
                >
                  <span>Kelola Tim</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 2: Submission Status */}
        {isLoading ? (
          <Skeleton className="h-44 rounded-2xl bg-card/60" />
        ) : (
          <Card className="bg-card hover:bg-card-hover border-border border shadow-xl transition-all rounded-2xl flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase text-text-secondary">
                  Submission Status
                </span>
                <div className="p-2 rounded-lg bg-surface border border-border text-accent">
                  <FileCode2 className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={
                    submission?.status === "SUBMITTED"
                      ? "bg-success/20 text-success border border-success/30 text-xs px-3 py-1 font-semibold"
                      : "bg-warning/20 text-warning border border-warning/30 text-xs px-3 py-1 font-semibold"
                  }
                >
                  {submission?.status || "IN_PROGRESS"}
                </Badge>
              </div>

              <CardDescription className="text-xs text-text-secondary pt-2 truncate">
                {submission?.title || "Belum ada berkas karya terunggah"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <div className="p-2.5 rounded-lg bg-surface/60 border border-border text-[11px] text-text-secondary flex items-center justify-between">
                <span>Terakhir diperbarui</span>
                <span className="font-mono text-white font-medium">2 jam yang lalu</span>
              </div>
              <div className="flex items-center justify-end text-xs">
                <Link
                  href="/peserta/submission"
                  className="text-accent hover:underline font-semibold flex items-center gap-1 group"
                >
                  <span>Upload Berkas</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 3: Time Remaining Live Countdown */}
        {isLoading ? (
          <Skeleton className="h-44 rounded-2xl bg-card/60" />
        ) : (
          <Card className="bg-card hover:bg-card-hover border-border border shadow-xl transition-all rounded-2xl flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold uppercase text-text-secondary">
                  Time Remaining
                </span>
                <div className="p-2 rounded-lg bg-surface border border-border text-urgent">
                  <Clock className="w-4 h-4 text-urgent" />
                </div>
              </div>

              <CardTitle className="font-mono text-2xl sm:text-3xl font-bold text-urgent tracking-wider">
                {String(timeLeft.days).padStart(2, "0")}d : {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.mins).padStart(2, "0")}m
              </CardTitle>
              <CardDescription className="text-xs text-text-secondary">
                Sebelum penutupan sistem submisi
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <div className="p-2.5 rounded-lg bg-urgent-soft/40 border border-urgent/30 text-[11px] text-urgent flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Stage: UPLOAD_KARYA
                </span>
                <span className="font-mono font-bold">15 OKT</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 2-Column Section: Recent Announcements & Deadlines Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Announcements (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20 text-accent">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Recent Announcements
              </h3>
            </div>
            <Link
              href="/peserta/announcements"
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {isNewsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl bg-card/60" />
              ))
            ) : news.length > 0 ? (
              news.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  className="bg-card hover:bg-card-hover border-border border shadow-lg p-5 rounded-2xl transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary/20 text-accent border border-primary/30 text-[10px] font-mono">
                      {item.category}
                    </Badge>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-base text-white hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {item.excerpt || item.content}
                  </p>
                </Card>
              ))
            ) : (
              <div className="bg-card border border-border p-6 rounded-2xl text-center text-text-secondary text-xs">
                Belum ada pengumuman terbaru saat ini.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines & Roadmap Timeline (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20 text-accent">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight">
              Deadlines & Roadmap
            </h3>
          </div>

          <Card className="bg-card border-border border shadow-xl p-6 rounded-2xl space-y-6">
            {isTimelineLoading ? (
              <Skeleton className="h-48 rounded-xl bg-surface" />
            ) : (
              <div className="relative space-y-6">
                {/* Vertical Connecting Line */}
                <div className="absolute top-2 bottom-2 left-3 w-0.5 bg-border" />

                {timeline.map((stage) => {
                  const isDone = stage.isCompleted;
                  const isActive = stage.isActive;

                  return (
                    <div key={stage.id} className="relative flex items-start gap-4 z-10">
                      {/* Status Dot */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isDone
                            ? "bg-success/20 text-success border border-success/40"
                            : isActive
                            ? "bg-accent/20 text-accent border-2 border-accent shadow-[0_0_10px_rgba(45,228,224,0.5)] animate-pulse"
                            : "bg-surface text-text-secondary border border-border"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-accent" : "bg-text-secondary"}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold ${
                            isDone
                              ? "text-text-secondary line-through"
                              : isActive
                              ? "text-accent font-display font-extrabold"
                              : "text-white"
                          }`}
                        >
                          {stage.stageName}
                        </p>
                        <p className="text-[11px] text-text-secondary leading-snug">
                          {stage.description}
                        </p>
                        <p className="font-mono text-[10px] text-text-secondary pt-0.5">
                          {new Date(stage.endDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
