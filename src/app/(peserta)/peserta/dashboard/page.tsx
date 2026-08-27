"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useUserMe,
  useUserTeam,
  useSubmission,
  useNews,
  useCompetitionTimeline,
  TimelineStage,
} from "@/hooks/use-peserta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Clock,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function PesertaDashboardPage() {
  // 1. React Query Hooks
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
  } = useUserMe();

  const {
    data: team,
    isLoading: isTeamLoading,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useUserTeam();

  const {
    data: submission,
    isLoading: isSubLoading,
    isError: isSubError,
    refetch: refetchSubmission,
  } = useSubmission();

  const {
    data: news = [],
    isLoading: isNewsLoading,
    isError: isNewsError,
    refetch: refetchNews,
  } = useNews(2);

  const {
    data: timeline = [],
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useCompetitionTimeline(team?.competition?.slug);

  // Find Upload Karya or Active Stage for Deadline Calculations
  const uploadStage = timeline.find(
    (s) =>
      s.stageName.toLowerCase().includes("upload") ||
      s.stageName.toLowerCase().includes("submission") ||
      s.isActive
  ) || timeline[1] || timeline[0];

  const targetEndDate = uploadStage?.endDate ? new Date(uploadStage.endDate).getTime() : null;

  // 2. Real-time Countdown State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number } | null>(null);

  useEffect(() => {
    if (!targetEndDate) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetEndDate - now;
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft({ days, hours, mins });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000 * 30);
    return () => clearInterval(interval);
  }, [targetEndDate]);

  // Derived Metrics
  const userName = user?.fullName || user?.email?.split("@")[0] || "Peserta";
  const memberCount = team?.members?.length || 0;
  const maxMembers = team?.competition?.maxMember || 0;
  const teamProgress = Math.min(100, Math.round((memberCount / maxMembers) * 100));

  // Helper date formatter
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
    } catch {
      return isoString;
    }
  };

  const formatLastSaved = (isoString?: string) => {
    if (!isoString) return "Belum disimpan";
    try {
      const d = new Date(isoString);
      return `Terakhir disimpan ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
    } catch {
      return "Terakhir disimpan baru saja";
    }
  };

  // 4. Edge State: User has no team
  if (!isTeamLoading && !team) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-4">
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-8 sm:p-10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Selamat Datang, {userName}!
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Anda belum memiliki atau terdaftar di dalam tim. Untuk dapat mengikuti kompetisi, memantau pengumuman, dan mengunggah karya, silakan buat atau bergabung ke tim terlebih dahulu.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/peserta/team">
              <Button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-6 h-10 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-md">
                <span>Buat atau Gabung Tim Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner Card */}
      {isUserLoading || isTeamLoading || isTimelineLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl bg-card/60" />
      ) : isUserError ? (
        <Card className="bg-card/90 border border-rose-500/30 rounded-2xl p-6 flex items-center justify-between gap-4 text-xs text-rose-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Gagal memuat profil pengguna.</span>
          </div>
          <Button onClick={() => refetchUser()} variant="outline" className="h-8 px-3 text-xs bg-surface border-border text-white">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
          </Button>
        </Card>
      ) : (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {userName}!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            {team && timeLeft ? (
              <>
                Tersisa <span className="text-accent font-semibold">{timeLeft.days} hari lagi</span> untuk mengunggah karya final tim <strong className="text-white">{team.teamName}</strong>.
              </>
            ) : (
              "Lengkapi tim & kompetisi terlebih dahulu untuk memulai kompetisi."
            )}
          </p>
        </Card>
      )}

      {/* 2. 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1: TEAM MEMBERS */}
        {isTeamLoading ? (
          <Skeleton className="h-40 rounded-2xl bg-card/60" />
        ) : isTeamError ? (
          <Card className="bg-card/90 border border-rose-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-rose-400">
              <span className="font-mono font-semibold uppercase">TEAM MEMBERS</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <Button onClick={() => refetchTeam()} variant="outline" className="h-8 text-xs bg-surface border-border text-white">
              Retry
            </Button>
          </Card>
        ) : (
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                TEAM MEMBERS
              </span>
              <Users className="w-4 h-4 text-text-secondary" />
            </div>

            <div>
              <div className="font-display text-3xl font-bold text-white leading-none">
                {memberCount} <span className="text-text-secondary text-base font-normal">/ {maxMembers}</span>
              </div>
              <Progress value={teamProgress} className="h-1.5 bg-surface mt-4" />
            </div>
          </Card>
        )}

        {/* Stat Card 2: SUBMISSION STATUS */}
        {isSubLoading ? (
          <Skeleton className="h-40 rounded-2xl bg-card/60" />
        ) : isSubError ? (
          <Card className="bg-card/90 border border-rose-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-xs text-rose-400">
              <span className="font-mono font-semibold uppercase">SUBMISSION STATUS</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <Button onClick={() => refetchSubmission()} variant="outline" className="h-8 text-xs bg-surface border-border text-white">
              Retry
            </Button>
          </Card>
        ) : (
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                SUBMISSION STATUS
              </span>
              <RotateCcw className="w-4 h-4 text-accent" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${submission ? "bg-accent shadow-[0_0_8px_rgba(45,228,224,0.8)]" : "bg-amber-400"}`} />
                <span className={`font-display text-2xl font-bold ${submission ? "text-accent" : "text-amber-400"}`}>
                  {submission ? "Submitted" : "Belum Submit"}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                {submission ? formatLastSaved(submission.submittedAt) : "Belum ada berkas karya diunggah"}
              </p>
            </div>
          </Card>
        )}

        {/* Stat Card 3: TIME REMAINING */}
        {isTimelineLoading ? (
          <Skeleton className="h-40 rounded-2xl bg-card/60" />
        ) : (
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                TIME REMAINING
              </span>
              <Clock className="w-4 h-4 text-text-secondary" />
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wider">
                {timeLeft ? (
                  `${String(timeLeft.days).padStart(2, "0")}d : ${String(timeLeft.hours).padStart(2, "0")}h : ${String(timeLeft.mins).padStart(2, "0")}m`
                ) : (
                  "N/A"
                )}
              </div>
              <p className="text-xs text-text-secondary mt-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Until submission deadline
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 3. 2-Column Section: Recent Announcements & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Announcements Panel (2 Cols) */}
        <Card className="lg:col-span-2 bg-card/90 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h3 className="font-display text-xl font-bold text-white tracking-tight">
              Recent Announcements
            </h3>
            <Link
              href="/peserta/announcements"
              className="text-xs font-mono text-text-secondary hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3.5">
            {isNewsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl bg-card/60" />
              ))
            ) : isNewsError ? (
              <div className="p-4 text-center space-y-2 border border-rose-500/30 rounded-xl bg-rose-500/5 text-rose-400 text-xs">
                <p>Gagal memuat pengumuman terbaru.</p>
                <Button onClick={() => refetchNews()} variant="outline" className="h-7 text-xs bg-surface border-border text-white">
                  Retry
                </Button>
              </div>
            ) : news.length > 0 ? (
              news.slice(0, 2).map((item, index) => {
                const isImportant = item.tag === "IMPORTANT" || index === 0;
                return (
                  <div
                    key={item.id || index}
                    className="bg-surface/50 border border-white/10 rounded-xl p-4 sm:p-5 space-y-2 transition-colors hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isImportant
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-card-hover text-text-secondary border border-border"
                        }`}
                      >
                        {item.tag || "INFO"}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-white hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {item.content?.slice(0, 120)}{item.content?.length > 120 ? "..." : ""}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-text-secondary text-center py-4">
                Belum ada pengumuman terbaru.
              </p>
            )}
          </div>
        </Card>

        {/* Right Column: Deadlines Timeline Panel (1 Col) */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="pb-2 border-b border-border/40">
            <h3 className="font-display text-xl font-bold text-white tracking-tight">
              Deadlines
            </h3>
          </div>

          <div className="relative space-y-5 pt-1">
            {/* Vertical Connecting Line */}
            <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-border/60" />

            {isTimelineLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-card/60 rounded-lg" />
              ))
            ) : isTimelineError ? (
              <div className="p-3 text-center text-xs text-rose-400">
                Gagal memuat jadwal deadline.
              </div>
            ) : (
              timeline.map((stage) => {
                const now = new Date().getTime();
                const end = new Date(stage.endDate).getTime();
                const start = new Date(stage.startDate).getTime();
                const isPassed = end < now || stage.isCompleted;
                const isActive = (start <= now && now <= end) || stage.isActive;

                return (
                  <div key={stage.id} className="relative flex items-start gap-4 z-10">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isPassed
                          ? "bg-text-secondary/50"
                          : isActive
                          ? "bg-accent shadow-[0_0_8px_rgba(45,228,224,0.8)]"
                          : "bg-surface border border-border"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-mono text-xs ${
                          isPassed
                            ? "text-text-secondary/70 line-through"
                            : isActive
                            ? "text-accent font-bold"
                            : "text-text-secondary"
                        }`}
                      >
                        {formatDate(stage.endDate)} {isActive && "(Sedang Berlangsung)"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          isPassed
                            ? "text-text-secondary/70 line-through"
                            : isActive
                            ? "text-white font-bold font-display"
                            : "text-text-secondary"
                        }`}
                      >
                        {stage.stageName}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
