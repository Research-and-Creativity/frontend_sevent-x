"use client";

import { useParams } from "next/navigation";
import { Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Tombol pill putih sesuai desain
const pillButton =
  "bg-white text-[#1B235E] hover:bg-white/90 rounded-full px-6 h-10 text-xs font-semibold shadow-sm";

// Peta slug -> judul kompetisi
const COMPETITION_NAMES: Record<string, string> = {
  softdev: "Software Development",
  uiux: "UI/UX Design",
};

// Dummy data (mock statis, akan diganti dengan data API di kemudian hari)
const teamCode = "XYZ092E";

const members = [
  "Haryanto",
  "Wifakul Azmi",
  "Rifki Naufal Dzaki",
  "Farrel Ghazali",
  "Geusan Edurais Aria Daffa",
];

const payment = {
  amount: "Rp60.000,-",
  bank: "BNI",
  accountNumber: "0010293810",
  accountName: "Salumita Ardiana",
  status: "Not Submitted",
};

export default function CompetitionRegistrationPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const competitionName = COMPETITION_NAMES[slug] || "Competition";

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Header */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Competition
          <span className="mx-3 text-white/60">•</span>
          {competitionName}
        </h1>
      </div>

      {/* Team Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <div className="relative mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Team Information
          </h2>
          <span className="font-mono text-xs text-text-secondary">
            Team Code <span className="text-white">• {teamCode}</span>
          </span>
        </div>

        <div className="relative space-y-3">
          {/* Leader (anggota pertama) full width */}
          <div className="flex h-12 items-center rounded-xl border border-white/15 bg-white/[0.03] px-5">
            <span className="text-sm text-white">{members[0]}</span>
          </div>

          {/* Anggota lain, 2 kolom */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.slice(1).map((member) => (
              <div
                key={member}
                className="flex h-12 items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-5"
              >
                <span className="text-sm text-white">{member}</span>
                <button
                  type="button"
                  aria-label={`Remove ${member}`}
                  className="text-rose-500 transition-colors hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
          Payment Information
        </h2>
        <p className="relative mt-2 text-sm text-text-secondary">
          Before you can submit your product to this competition, please
          complete this payment first
        </p>

        <div className="relative mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bank Account */}
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Bank Account
            </h3>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
              {payment.amount}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-text-secondary">
              <span>
                <span className="text-white">{payment.bank}</span>
                <span className="mx-1.5">•</span>
                {payment.accountNumber}
              </span>
              <span>a.n. {payment.accountName}</span>
            </div>

            <span className="mt-5 inline-flex items-center rounded-full border border-rose-500/60 px-4 py-1.5 text-xs font-semibold text-rose-500">
              {payment.status}
            </span>
          </div>

          {/* Payment Evidence */}
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-bold text-white">
              Payment Evidence
            </h3>
            <button
              type="button"
              className="mt-3 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:bg-white/[0.04]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D8CFF]/20 text-[#7D8CFF]">
                <UploadCloud className="h-5 w-5" />
              </span>
              <span className="text-sm text-white">
                Drag or Upload your files here
              </span>
              <span className="text-xs text-text-secondary">
                (ZIP, PDF. Max 1 File and 2MB)
              </span>
            </button>
          </div>
        </div>

        <div className="relative mt-8 flex justify-end">
          <Button className={pillButton}>Submit Payment</Button>
        </div>
      </div>
    </div>
  );
}
