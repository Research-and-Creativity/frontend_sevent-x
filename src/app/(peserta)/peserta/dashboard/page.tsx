"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Style glass yang sama dengan halaman lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Tombol pill putih sesuai desain
const pillButton =
  "bg-white text-[#1B235E] hover:bg-white/90 rounded-full px-5 h-9 text-xs font-semibold shadow-sm";

// Dummy data pengumuman (akan diganti dengan data API di kemudian hari)
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
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Welcome back, Haryanto
        </h1>
      </div>

      {/* Profile */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-4">
          Profile
        </h2>
        <ul className="relative space-y-1.5 mb-6">
          <li className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-white">•</span>
            <span>Please complete your identity</span>
          </li>
        </ul>
        <Link href="/peserta/settings">
          <Button className={pillButton}>Complete Now!</Button>
        </Link>
      </div>

      {/* Competition */}
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
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7D8CFF]/15 text-[#7D8CFF]">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
