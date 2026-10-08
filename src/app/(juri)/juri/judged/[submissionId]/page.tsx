"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SubmissionAccordion } from "@/components/juri/submission-accordion";
import { ConfirmModal } from "@/components/confirm-modal";
import { toast } from "sonner";
import Link from "next/link";

// Style glass yang sama dengan halaman Overview & Already Submitted
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Input bentuk pill sesuai desain
const glassInput =
  "h-14 rounded-full px-6 bg-white/[0.03] border border-white/30 backdrop-blur-md " +
  "text-white placeholder:text-white/40 focus-visible:border-[#7D8CFF]/70 " +
  "focus-visible:ring-0 disabled:opacity-60";

export default function JudgedDetailPage() {
  const router = useRouter();

  const [isConfirmWaitlistOpen, setIsConfirmWaitlistOpen] = useState(false);
  const [isConfirmFinalistOpen, setIsConfirmFinalistOpen] = useState(false);

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

  const scores = {
    category1: "85",
    category2: "90",
    category3: "78",
    category4: "88",
  };

  const notes = "Good effort, but need improvement in UI/UX.";

  const handleConfirmWaitlist = () => {
    setIsConfirmWaitlistOpen(false);
    toast.success(`Tim "${team.name}" berhasil dimasukkan ke Waitlist!`);
    router.push("/juri/judged");
  };

  const handleConfirmFinalist = () => {
    setIsConfirmFinalistOpen(false);
    toast.success(`Tim "${team.name}" berhasil dipilih sebagai Finalist!`);
    router.push("/juri/judged");
  };

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <Link
          href="/juri/judged"
          className="text-sm text-text-secondary hover:text-white transition-colors"
        >
          ← Back to Judged
        </Link>
      </div>

      {/* Header: Competition • Category */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Competition
          <span className="mx-3 text-white/70">•</span>
          Software Development
        </h1>
      </div>

      {/* Bar Submission (collapsible) */}
      <SubmissionAccordion
        team={team}
        product={product}
        externalLinks={externalLinks}
        proposal={proposal}
        defaultOpen={false}
      />

      {/* Judgement Preliminary (Read Only) */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-6">
          Judgement Preliminary
        </h2>

        {/* Scores Table */}
        <div className="w-full mb-6">
          <div className="grid grid-cols-5 gap-4 border-b border-white/10 pb-4 mb-4 text-sm font-medium text-white/60 text-center">
            <div>Category 1</div>
            <div>Category 2</div>
            <div>Category 3</div>
            <div>Category 4</div>
            <div>Final Score</div>
          </div>
          <div className="grid grid-cols-5 gap-4 text-center text-white pb-6 border-b border-white/10">
            <div>100</div>
            <div>100</div>
            <div>100</div>
            <div>95</div>
            <div>97.5</div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6 pb-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/80 mb-2">Notes For The Team</h3>
          <p className="text-white text-sm">
            Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit.
          </p>
        </div>

        {/* Disclaimer & Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <p className="text-xs text-white/60 leading-relaxed max-w-3xl">
            *Teams scoring below the minimum threshold are automatically disqualified. Eligible teams are categorized as Finalists or Waitlisted. Waitlisted teams are system-qualified, but judges reserve the right to prioritize more qualified teams for the Finals.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsConfirmWaitlistOpen(true)}
              className="cursor-pointer px-6 py-2.5 rounded-full border border-[#3B5BFF] text-white text-sm font-semibold hover:bg-[#3B5BFF]/10 transition-colors bg-[#3B5BFF]/20"
            >
              Waitlist
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmFinalistOpen(true)}
              className="cursor-pointer px-6 py-2.5 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-colors"
            >
              Finalist
            </button>
          </div>
        </div>
      </div>

      {/* Modal konfirmasi Waitlist */}
      <ConfirmModal
        open={isConfirmWaitlistOpen}
        onOpenChange={setIsConfirmWaitlistOpen}
        title="Konfirmasi Waitlist"
        description={`Apakah Anda yakin ingin memasukkan "${team.name}" ke dalam Waitlist?`}
        confirmText="Ya, Waitlist"
        cancelText="Batal"
        onConfirm={handleConfirmWaitlist}
      />

      {/* Modal konfirmasi Finalist */}
      <ConfirmModal
        open={isConfirmFinalistOpen}
        onOpenChange={setIsConfirmFinalistOpen}
        title="Konfirmasi Finalist"
        description={`Apakah Anda yakin ingin memilih "${team.name}" sebagai Finalist?`}
        confirmText="Ya, Finalist"
        cancelText="Batal"
        onConfirm={handleConfirmFinalist}
      />
    </div>
  );
}
