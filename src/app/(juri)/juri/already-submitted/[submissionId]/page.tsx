"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal } from "@/components/confirm-modal";
import { toast } from "sonner";

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

export default function AlreadySubmittedDetailPage() {
  const router = useRouter();

  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scores, setScores] = useState<Record<string, string>>({
    category1: "",
    category2: "",
    category3: "",
    category4: "",
  });
  const [notes, setNotes] = useState("");

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

  const handleConfirmSubmit = () => {
    setIsSubmitted(true);
    setIsConfirmOpen(false);
    toast.success(`Penilaian untuk "${team.name}" berhasil dikirim!`);
    router.push("/juri/already-submitted");
  };

  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
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
      <button
        type="button"
        onClick={() => setIsSubmissionOpen((prev) => !prev)}
        className={`${glass} flex w-full items-center justify-between px-6 py-4 lg:px-8 text-left cursor-pointer hover:bg-white/[0.04] transition-colors`}
        aria-expanded={isSubmissionOpen}
      >
        <span className="relative font-display text-2xl font-bold tracking-tight text-white">
          Submission
        </span>
        <ChevronUp
          className={`relative w-5 h-5 fill-white text-white transition-transform duration-200 ${
            isSubmissionOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {isSubmissionOpen && (
        <>
          {/* Baris 1: Team Information + Product Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Information */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-6">
                Team Information
              </h2>
              <h3 className="relative font-display text-xl font-bold text-white mb-3">
                {team.name}
              </h3>
              <ul className="relative space-y-1.5">
                {team.members.map((member) => (
                  <li key={member} className="text-sm text-white/90">
                    {member}
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Information */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-1">
                Product Information
              </h2>
              <p className="relative text-xs text-white/70 mb-6">
                You can filled this form with the Product Title and Description
              </p>

              <div className="relative space-y-1">
                <span className="block text-sm text-white/60">
                  Product Title
                </span>
                <p className="text-lg text-white">{product.title}</p>
              </div>

              <div className="relative mt-5 space-y-1">
                <span className="block text-sm text-white/60">Description</span>
                <p className="text-lg text-white">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Baris 2: External Links + Proposal (tinggi mengikuti isi masing-masing) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* External Links */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-1">
                External Links
              </h2>
              <p className="relative text-xs text-white/70 mb-6">
                Please make sure this link is open public so we can access it
              </p>

              <div className="relative space-y-5">
                {externalLinks.map((link) => (
                  <div key={link.label} className="space-y-1">
                    <span className="block text-sm text-white/60">
                      {link.label}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg text-white underline underline-offset-4 decoration-white/40 hover:decoration-white break-all"
                    >
                      {link.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposal */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-5">
                Proposal
              </h2>

              <a
                href="#"
                className="relative flex items-center gap-4 w-full max-w-xs rounded-xl border border-white/40 bg-white/[0.03] p-4 hover:bg-white/[0.07] transition-colors"
              >
                <span className="flex flex-col items-center leading-none shrink-0">
                  <FileText
                    className="w-9 h-9 text-red-500"
                    strokeWidth={1.5}
                  />
                  <span className="-mt-5 mb-3 text-[7px] font-bold text-red-500">
                    PDF
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white truncate">
                    {proposal.name}
                  </span>
                  <span className="block text-xs text-white/60">
                    {proposal.size}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </>
      )}

      {/* Judgement Preliminary (full-width, selalu tampil) */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-2xl font-bold tracking-tight text-white mb-6">
          Judgement Preliminary
        </h2>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {(["category1", "category2", "category3", "category4"] as const).map(
            (key, idx) => (
              <div key={key} className="space-y-2">
                <label htmlFor={key} className="block text-sm text-white/60">
                  Category {idx + 1}
                </label>
                <Input
                  id={key}
                  type="number"
                  min={0}
                  disabled={isSubmitted}
                  value={scores[key]}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className={glassInput}
                />
              </div>
            ),
          )}
        </div>

        <div className="relative mt-5 space-y-2">
          <label htmlFor="notes" className="block text-sm text-white/60">
            Notes for the Team
          </label>
          <Textarea
            id="notes"
            rows={4}
            disabled={isSubmitted}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="min-h-32 rounded-2xl px-6 py-4 bg-white/[0.03] border border-white/30 backdrop-blur-md text-white placeholder:text-white/40 focus-visible:border-[#7D8CFF]/70 focus-visible:ring-0 resize-none disabled:opacity-60"
          />
        </div>

        <div className="relative mt-6 flex justify-end">
          <button
            type="button"
            disabled={isSubmitted}
            onClick={() => setIsConfirmOpen(true)}
            className="cursor-pointer px-10 py-3 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Modal konfirmasi sebelum submit */}
      <ConfirmModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Konfirmasi Submit"
        description={`Apakah Anda yakin ingin mengirimkan penilaian untuk "${team.name}"? Penilaian yang sudah dikirim tidak dapat diubah kembali.`}
        confirmText="Ya, Submit"
        cancelText="Batal"
        onConfirm={handleConfirmSubmit}
      />
    </div>
  );
}
