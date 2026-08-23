"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  UploadCloud,
  Link as LinkIcon,
  Code2,
  PlayCircle,
  Globe,
  FileUp,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Team } from "@/types/api";

export default function PesertaSubmissionPage() {
  // TODO: HAPUS setelah wiring API Pass 2, ini murni buat testing visual dulu
  const [isDebugLocked, setIsDebugLocked] = useState<boolean>(true);

  // Pass 1: UI-Only with mock data adhering to Team type from src/types/api.ts
  const mockTeam: Team = {
    id: "t-101",
    name: "Team Alpha",
    competitionId: "1",
    leaderId: "u-1",
    inviteCode: "ALPHA2026",
    status: "PENDING",
    members: [
      { id: "tm-1", teamId: "t-101", userId: "u-1", role: "LEADER", joinedAt: "" },
      { id: "tm-2", teamId: "t-101", userId: "u-2", role: "MEMBER", joinedAt: "" },
      { id: "tm-3", teamId: "t-101", userId: "u-3", role: "MEMBER", joinedAt: "" },
    ],
    createdAt: "",
    updatedAt: "",
  };

  const memberCount = mockTeam.members?.length || 3;

  // Form Field States
  const [projectTitle, setProjectTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      {/* TODO: HAPUS setelah wiring API Pass 2, ini murni buat testing visual dulu */}
      <div className="flex items-center justify-between bg-card/60 border border-white/10 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
          <span>Submission View State Switcher (Visual Test Only):</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDebugLocked(true)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              isDebugLocked
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold"
                : "bg-surface text-text-secondary hover:text-white"
            }`}
          >
            State Locked
          </button>
          <button
            onClick={() => setIsDebugLocked(false)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              !isDebugLocked
                ? "bg-primary/30 text-white border border-primary/40 font-bold"
                : "bg-surface text-text-secondary hover:text-white"
            }`}
          >
            State Unlocked
          </button>
        </div>
      </div>

      {/* STATE LOCKED */}
      {isDebugLocked ? (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-left max-w-3xl">
          {/* Card Header: Inline Small Icon & Title */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/40">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Menunggu Verifikasi Admin
            </h2>
          </div>

          {/* Left-Aligned Description */}
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
            Formulir pengunggahan karya baru dapat diakses setelah pendaftaran tim dan dokumen administrasi (bukti pembayaran & berkas verifikasi) selesai diverifikasi oleh panitia.
          </p>

          {/* Verification Status List (Using Overview Dot Pattern) */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider block">
              RINGKASAN STATUS VERIFIKASI
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary min-w-[130px]">Status Tim:</span>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-amber-400">
                    Menunggu Review
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-text-secondary min-w-[130px]">Bukti Pembayaran:</span>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-amber-400">
                    Menunggu Review
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Left-Aligned Secondary Button */}
          <div className="pt-2">
            <Link href="/peserta/team">
              <Button
                variant="outline"
                className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-4 h-9 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Lihat Status Tim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* STATE UNLOCKED (Complete Form) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2/3 Width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card A: Project Details */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <FileText className="w-5 h-5 text-white" />
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Project Details
                </h2>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a striking name for your project"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-sm text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                    Detailed Description
                  </label>
                  <span className="text-[11px] font-mono text-text-secondary/70">
                    Markdown supported
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder="Describe the problem, your solution, and the technical architecture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-sm text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                />
              </div>
            </Card>

            {/* Card B: Deliverables */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <UploadCloud className="w-5 h-5 text-white" />
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Deliverables
                </h2>
              </div>

              {/* Dropzone Box */}
              <div className="border-2 border-dashed border-border/80 hover:border-accent/60 bg-surface/40 rounded-2xl p-8 sm:p-10 text-center space-y-4 transition-colors relative">
                <input
                  type="file"
                  accept=".zip,.pdf,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center mx-auto text-white shadow-sm">
                  <FileUp className="w-6 h-6 text-white" />
                </div>

                <div className="space-y-2">
                  <p className="font-display font-bold text-white text-base sm:text-lg">
                    {selectedFile ? selectedFile.name : "Drag & drop files here"}
                  </p>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    Upload your presentation deck, architecture diagrams, or compressed source code (ZIP, PDF, PNG - Max 50MB)
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="bg-surface border-border text-white text-xs font-mono font-semibold px-6 h-10 rounded-xl transition-all cursor-pointer relative z-20 pointer-events-none"
                >
                  Browse Files
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (1/3 Width) */}
          <div className="space-y-6">
            {/* Card A: External Links */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-1">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <LinkIcon className="w-5 h-5 text-white" />
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  External Links
                </h2>
              </div>

              {/* Input 1: GitHub Repository */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  GitHub Repository
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-surface border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Input 2: Demo Video URL */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Demo Video URL
                </label>
                <div className="relative">
                  <PlayCircle className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-surface border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Input 3: Live Deployment (Optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Live Deployment (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full bg-surface border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </Card>

            {/* Card B: Team Banner ("Submitting as") */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0C1738] via-[#0F1E4A] to-[#0A122E] border border-white/10 rounded-2xl p-6 space-y-2 shadow-lg">
              {/* Background Graphic Accent */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />

              <span className="font-mono text-xs text-text-secondary/80 uppercase tracking-wider block">
                Submitting as
              </span>

              <div className="flex items-center gap-3 relative z-10 pt-1">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                  {mockTeam.name}
                </h3>
                <span className="bg-white/10 border border-white/20 text-white font-mono text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {memberCount} Members
                </span>
              </div>
            </div>

            {/* Button C: Submit Project (Separate below Team Banner) */}
            <Button className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-display font-semibold h-11 rounded-xl shadow-md cursor-pointer transition-all">
              Submit Project
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
