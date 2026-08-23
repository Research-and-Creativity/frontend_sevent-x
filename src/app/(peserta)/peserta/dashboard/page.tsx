"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useUserMe,
  useUserTeam,
  useUserSubmission,
  useNewsAnnouncements,
} from "@/hooks/use-peserta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  HelpCircle,
  UploadCloud,
  Users,
  Clock,
  RotateCcw,
} from "lucide-react";

export default function PesertaDashboardPage() {
  const { data: user, isLoading: isUserLoading } = useUserMe();
  const { data: team, isLoading: isTeamLoading } = useUserTeam();
  const { data: submission, isLoading: isSubLoading } = useUserSubmission();
  const { data: news = [], isLoading: isNewsLoading } = useNewsAnnouncements();

  // Live Countdown State for Time Remaining Card
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, mins: 45 });

  useEffect(() => {
    const target = new Date("2026-10-28T23:59:59Z").getTime();
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
  const memberCount = team?.members?.length || 4;
  const maxMembers = 5;
  const teamProgress = Math.min(100, Math.round((memberCount / maxMembers) * 100));

  const userName = user?.name || "User";

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl bg-card/60" />
      ) : (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {userName}!
          </h2>
          <p className="text-sm text-text-secondary">
            You have <span className="text-accent font-semibold">3 days</span> left to submit your final project.
          </p>
        </Card>
      )}

      {/* 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: TEAM MEMBERS */}
        {isLoading ? (
          <Skeleton className="h-40 rounded-2xl bg-card/60" />
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

        {/* Card 2: SUBMISSION STATUS */}
        {isLoading ? (
          <Skeleton className="h-40 rounded-2xl bg-card/60" />
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
                <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_8px_rgba(45,228,224,0.8)]" />
                <span className="font-display text-2xl font-bold text-accent">
                  {submission?.status === "SUBMITTED" ? "Submitted" : "In Progress"}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                Last saved 2 hours ago
              </p>
            </div>
          </Card>
        )}

        {/* Card 3: TIME REMAINING */}
        {isLoading ? (
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
                {String(timeLeft.days).padStart(2, "0")}d : {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.mins).padStart(2, "0")}m
              </div>
              <p className="text-xs text-text-secondary mt-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Until submission deadline
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 2-Column Section: Recent Announcements & Deadlines */}
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
            ) : news.length > 0 ? (
              news.slice(0, 2).map((item, index) => {
                const isImportant = index === 0;
                return (
                  <div
                    key={item.id || index}
                    className="bg-surface/50 border border-white/10 rounded-xl p-4 sm:p-5 space-y-2 transition-colors hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isImportant
                            ? "bg-urgent-soft/40 text-urgent border border-urgent/30"
                            : "bg-card-hover text-text-secondary border border-border"
                        }`}
                      >
                        {isImportant ? "Important" : "Event"}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">
                        {isImportant ? "Today, 10:00 AM" : "Yesterday"}
                      </span>
                    </div>
                    <h4 className="font-display font-bold text-base text-white hover:text-accent transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {item.excerpt || item.content}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="space-y-3.5">
                <div className="bg-surface/50 border border-white/10 rounded-xl p-4 sm:p-5 space-y-2 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="bg-urgent-soft/40 text-urgent border border-urgent/30 text-[10px] font-mono px-2 py-0.5 rounded">
                      Important
                    </span>
                    <span className="text-xs font-mono text-text-secondary">Today, 10:00 AM</span>
                  </div>
                  <h4 className="font-display font-bold text-base text-white hover:text-accent transition-colors">
                    Final Submission Guidelines Updated
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Please review the updated guidelines for the final project submission. We have clarified the requirements for the video presentation component.
                  </p>
                </div>

                <div className="bg-surface/50 border border-white/10 rounded-xl p-4 sm:p-5 space-y-2 transition-colors hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="bg-card-hover text-text-secondary border border-border text-[10px] font-mono px-2 py-0.5 rounded">
                      Event
                    </span>
                    <span className="text-xs font-mono text-text-secondary">Yesterday</span>
                  </div>
                  <h4 className="font-display font-bold text-base text-white hover:text-accent transition-colors">
                    Q&A Session with Mentors
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Join us tomorrow at 2 PM EST for a live Q&A session with industry mentors. Bring your questions about architecture and deployment.
                  </p>
                </div>
              </div>
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

            {/* Item 1: Past */}
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-5 h-5 rounded-full bg-text-secondary/50 flex items-center justify-center shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-text-secondary/70 line-through">Oct 15</p>
                <p className="text-sm font-semibold text-text-secondary/70 line-through">Team Formation</p>
              </div>
            </div>

            {/* Item 2: Past */}
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-5 h-5 rounded-full bg-text-secondary/50 flex items-center justify-center shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-text-secondary/70 line-through">Oct 22</p>
                <p className="text-sm font-semibold text-text-secondary/70 line-through">Midpoint Check-in</p>
              </div>
            </div>

            {/* Item 3: Current Active */}
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-5 h-5 rounded-full bg-accent shadow-[0_0_8px_rgba(45,228,224,0.8)] flex items-center justify-center shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-accent font-bold">Oct 28 (In 3 Days)</p>
                <p className="text-sm font-bold text-white font-display">Final Submission</p>
              </div>
            </div>

            {/* Item 4: Upcoming */}
            <div className="relative flex items-start gap-4 z-10">
              <div className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-xs text-text-secondary">Oct 30</p>
                <p className="text-sm font-medium text-text-secondary">Judging Begins</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

