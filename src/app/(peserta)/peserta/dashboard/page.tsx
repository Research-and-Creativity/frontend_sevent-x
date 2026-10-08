"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, RotateCcw, Clock, Check } from "lucide-react";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Tombol pill putih sesuai desain
const pillButton =
  "bg-white text-[#1B235E] hover:bg-white/90 rounded-full px-5 h-9 text-xs font-semibold shadow-sm";

const statCard =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5";

// Flag mock: true = sudah join kompetisi, false = belum join.
// Nanti diganti dengan data API.
const hasJoined = true;

// Dummy data (mock statis, akan diganti dengan data API di kemudian hari)
const stats = {
  memberCount: 4,
  maxMembers: 5,
  submissionStatus: "Not Submitted",
  timeRemaining: "02d : 14h : 45m",
};

const announcements = [
  {
    title: "Final Submission Guidelines Updated",
    date: "Today, 10:00 AM",
    description:
      "Please review the updated guidelines for the final project submission. We have clarified the requirements for the video presentation component.",
  },
  {
    title: "Q&A Session with Mentors",
    date: "Yesterday",
    description:
      "Join us tomorrow at 2 PM EST for a live Q&A session with industry mentors. Bring your questions about architecture and deployment.",
  },
];

export default function PesertaDashboardPage() {
  const memberProgress = Math.min(
    100,
    Math.round((stats.memberCount / stats.maxMembers) * 100),
  );

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
          Welcome back, Haryanto
        </h1>
        {hasJoined && (
          <p className="relative mt-1.5 text-sm text-text-secondary">
            You have 3 days left to submit your final project.
          </p>
        )}
      </div>

      {/* Profile */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-4">
          Profile
        </h2>
        <ul className="relative space-y-1.5 mb-6">
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-white">•</span>
            <span>
              {hasJoined
                ? `Your profile has been verified ${(<Check className="h-4 w-4 text-white" />)}`
                : "Please complete your identity"}
            </span>
          </li>
        </ul>
        {!hasJoined && (
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
                {stats.memberCount}{" "}
                <span className="text-base font-normal text-text-secondary">
                  / {stats.maxMembers}
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
              <div className="font-display text-2xl font-bold text-rose-500">
                {stats.submissionStatus}
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
                {stats.timeRemaining}
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
          <Link href="/peserta/team">
            <Button className={pillButton}>Join Now!</Button>
          </Link>
        </div>
      )}

      {/* Recent Announcement */}
      <div className={`${glass} p-6 lg:p-8`}>
        <div className="relative flex items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Recent Announcement
          </h2>
          <Link href="/peserta/announcements">
            <Button className={pillButton}>View All</Button>
          </Link>
        </div>

        <div className="relative space-y-4">
          {announcements.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-sm font-bold text-white">
                  {item.title}
                </h3>
                <span className="shrink-0 text-xs text-text-secondary">
                  {item.date}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
