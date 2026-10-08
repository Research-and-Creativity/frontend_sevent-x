"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { SubmissionAccordion } from "@/components/juri/submission-accordion";

// Style glass yang sama dengan halaman juri lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Bar collapsible (Judgement Preliminary / Judgement Final)
const glassBar =
  "flex w-full items-center justify-between px-6 py-4 lg:px-8 text-left cursor-pointer " +
  "hover:bg-white/[0.04] transition-colors";

export default function WinnerDetailPage() {
  const [isPreliminaryOpen, setIsPreliminaryOpen] = useState(false);
  const [isFinalOpen, setIsFinalOpen] = useState(true);

  // Mock data (akan diganti dengan data API di kemudian hari)
  const team = {
    name: "Team Anomali",
    members: [
      "Haryanto",
      "Wifakul Azmi",
      "Rifki Naufal Dzaki",
      "Farrel Ghazali",
      "Geusan Edurals Aria Daffa",
    ],
  };

  const product = {
    title: "Productnya adalah pokoknya",
    description: "Lorem ipsum dolor sit amet",
  };

  const externalLinks = [
    { label: "Github Repository", url: "https://github.com/" },
    { label: "Live Deployment", url: "https://vercel.app" },
    { label: "Demonstration Video", url: "http://youtube.com/" },
  ];

  const proposal = { name: "Proposal", size: "10.MB" };

  // Rekap nilai (read-only)
  const scores = [
    { label: "Category 1", value: "100" },
    { label: "Category 2", value: "100" },
    { label: "Category 3", value: "100" },
    { label: "Category 4", value: "95" },
    { label: "Final Score", value: "97.5" },
  ];

  const notes = "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.";

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Back link */}
      <Link
        href="/juri/winner"
        className="inline-block text-sm text-text-secondary hover:text-white transition-colors"
      >
        ← Back to Winner
      </Link>

      {/* Header: Competition • Category */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Competition
          <span className="mx-3 text-white/70">•</span>
          Software Development
        </h1>
      </div>

      {/* Bar Submission (collapsible, default tertutup) */}
      <SubmissionAccordion
        team={team}
        product={product}
        externalLinks={externalLinks}
        proposal={proposal}
        defaultOpen={false}
      />

      {/* Bar Judgement Preliminary (collapsible, default tertutup) */}
      <button
        type="button"
        onClick={() => setIsPreliminaryOpen((prev) => !prev)}
        className={`${glass} ${glassBar}`}
        aria-expanded={isPreliminaryOpen}
      >
        <span className="relative font-display text-2xl font-bold tracking-tight text-white">
          Judgement Preliminary
        </span>
        <ChevronUp
          className={`relative w-5 h-5 fill-white text-white transition-transform duration-200 ${
            isPreliminaryOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {isPreliminaryOpen && (
        <div className={`${glass} p-6 lg:p-8`}>
          {/* Scores table (read-only) */}
          <div className="w-full mb-6">
            <div className="grid grid-cols-5 gap-4 border-b border-white/10 pb-4 mb-4 text-sm font-medium text-white/60 text-center">
              {scores.map((s) => (
                <div key={s.label}>{s.label}</div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4 text-center text-white pb-6 border-b border-white/10">
              {scores.map((s) => (
                <div key={s.label}>{s.value}</div>
              ))}
            </div>
          </div>

          {/* Notes (read-only) */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              Notes For The Team
            </h3>
            <p className="text-white text-sm">{notes}</p>
          </div>
        </div>
      )}

      {/* Bar Judgement Final (collapsible, default terbuka) */}
      <button
        type="button"
        onClick={() => setIsFinalOpen((prev) => !prev)}
        className={`${glass} ${glassBar}`}
        aria-expanded={isFinalOpen}
      >
        <span className="relative font-display text-2xl font-bold tracking-tight text-white">
          Judgement Final
        </span>
        <ChevronUp
          className={`relative w-5 h-5 fill-white text-white transition-transform duration-200 ${
            isFinalOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {isFinalOpen && (
        <div className={`${glass} p-6 lg:p-8`}>
          {/* Scores table (read-only) */}
          <div className="w-full mb-6">
            <div className="grid grid-cols-5 gap-4 border-b border-white/10 pb-4 mb-4 text-sm font-medium text-white/60 text-center">
              {scores.map((s) => (
                <div key={s.label}>{s.label}</div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4 text-center text-white pb-6 border-b border-white/10">
              {scores.map((s) => (
                <div key={s.label}>{s.value}</div>
              ))}
            </div>
          </div>

          {/* Notes (read-only) */}
          <div>
            <h3 className="text-sm font-semibold text-white/80 mb-2">
              Notes For The Team
            </h3>
            <p className="text-white text-sm">{notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
