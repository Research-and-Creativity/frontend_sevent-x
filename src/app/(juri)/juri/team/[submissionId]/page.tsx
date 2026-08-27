"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Code2,
  Play,
  Image as ImageIcon,
  ExternalLink,
  Check,
  Save,
  AlertCircle,
} from "lucide-react";
import { ScoreCriteria, Submission, Team } from "@/types/api";
import { toast } from "sonner";

export default function EvaluationConsolePage() {
  const params = useParams();
  const submissionId = (params?.submissionId as string) || "sub-101";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Live Scores State for 4 criteria (Clamped 0 - 100)
  const [scores, setScores] = useState<Record<string, number>>({
    c1: 95, // Innovation
    c2: 92, // Technical Complexity
    c3: 88, // Feasibility
    c4: 90, // Design / UX
  });

  const [comments, setComments] = useState("");

  // Pass 1: Mock Data adhering strictly to Submission, Team, ScoreCriteria interfaces from src/types/api.ts
  const mockSubmission: Submission = {
    id: submissionId,
    teamId: "t-4092",
    fileUrl: "https://example.com/AuraTech_PitchDeck_v2.pdf",
    linkUrl: "https://github.com/auratech/crop-engine",
    submittedAt: "2026-10-12T11:59:00Z",
  };

  const mockTeam: Team = {
    id: "4092",
    teamName: "Aura Tech",
    competitionId: "1",
    teamCode: "AURATECH",
    status: "APPROVE",
    members: [
      { id: "tm-1", teamId: "4092", userId: "u-1", role: "LEADER", joinedAt: "" },
      { id: "tm-2", teamId: "4092", userId: "u-2", role: "MEMBER", joinedAt: "" },
      { id: "tm-3", teamId: "4092", userId: "u-3", role: "MEMBER", joinedAt: "" },
    ],
    createdAt: "",
    updatedAt: "",
  };

  // 4 Mock Criteria matching reference image
  const mockCriteria: (ScoreCriteria & { shortSubtitle: string })[] = [
    {
      id: "c1",
      competitionId: "1",
      name: "Innovation",
      shortSubtitle: "Novelty and creativity of the climate model solution",
      description: "Novelty and creativity of the climate model solution",
      weight: 25,
      maxScore: 100,
      createdAt: "",
    },
    {
      id: "c2",
      competitionId: "1",
      name: "Technical Complexity",
      shortSubtitle: "Code execution, robustness and edge node hardware integration",
      description: "Code execution, robustness and edge node hardware integration",
      weight: 25,
      maxScore: 100,
      createdAt: "",
    },
    {
      id: "c3",
      competitionId: "1",
      name: "Feasibility",
      shortSubtitle: "Viability of deploying decentralized nodes long-term",
      description: "Viability of deploying decentralized nodes long-term",
      weight: 25,
      maxScore: 100,
      createdAt: "",
    },
    {
      id: "c4",
      competitionId: "1",
      name: "Design / UX",
      shortSubtitle: "Intuitiveness of farmer metrics readout dashboard",
      description: "Intuitiveness of farmer metrics readout dashboard",
      weight: 25,
      maxScore: 100,
      createdAt: "",
    },
  ];

  // Live Total Mathematical Average Calculation
  const totalAverageScore = useMemo(() => {
    const values = Object.values(scores);
    if (values.length === 0) return "0.0";
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    return (sum / values.length).toFixed(1);
  }, [scores]);

  // Adjust score handler (-5 / +5)
  const adjustScore = (criteriaId: string, delta: number) => {
    if (isSubmitted) return;
    setScores((prev) => {
      const current = prev[criteriaId] ?? 85;
      const nextVal = Math.max(0, Math.min(100, current + delta));
      return { ...prev, [criteriaId]: nextVal };
    });
  };

  // Save Draft Locally
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        `draft_score_${submissionId}`,
        JSON.stringify({ scores, comments, savedAt: new Date().toISOString() })
      );
      toast.success("Draft penilaian berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan draft.");
    }
  };

  // Submit Final Score
  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Penilaian berhasil dikirim!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 2. Breadcrumb bar */}
      <div>
        <Link
          href="/juri/team"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#3CD7FF] hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Submissions</span>
        </Link>
      </div>

      {/* 3. Baris Judul & Badge Round */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">
          Evaluation Console
        </h1>
        <span className="border border-white/20 bg-white/5 font-mono text-[11px] uppercase tracking-wider px-3 py-1 rounded-md text-text-secondary">
          Score ROUND 1
        </span>
      </div>

      {/* 4. LAYOUT 2 KOLOM (Kiri ~60%, Kanan ~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI (1 Card Besar Membungkus Seluruh Detail Proyek) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Project Title & Category Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                  {mockTeam.teamName} - Project Submission
                </h2>
                <p className="text-xs font-mono">
                  <span className="text-[#3CD7FF] font-semibold">{mockTeam.teamName}</span>
                  <span className="text-text-secondary"> • {(mockTeam.members?.length || 3)} MEMBERS</span>
                </p>
              </div>

              <span className="border border-[#3CD7FF]/40 text-[#3CD7FF] bg-[#3CD7FF]/10 font-mono text-xs font-semibold px-3 py-1 rounded-md shrink-0">
                AI & Climate
              </span>
            </div>

            <div className="border-t border-white/10" />

            {/* Heading & Paragraph: Project Overview */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-base text-white">
                Project Overview
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Our solution harnesses decentralized edge computing nodes paired with localized soil sensors to build real-time prediction models for crop yields in sub-Saharan climates. By minimizing reliance on cloud-dependent networks, smallholder farmers gain localized forecasting without heavy infrastructure constraints.
              </p>
            </div>

            <div className="border-t border-white/10" />

            {/* Heading & Deliverables Items */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-white">
                Submitted Deliverables
              </h3>

              <div className="space-y-2.5">
                {/* Deliverable 1: PDF */}
                <div className="bg-surface border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 flex items-center justify-center text-[#3CD7FF] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-xs truncate">
                        AuraTech_PitchDeck_v2.pdf
                      </p>
                      <p className="font-mono text-[10px] text-text-secondary uppercase mt-0.5">
                        PDF • 12.4 MB
                      </p>
                    </div>
                  </div>
                  <a
                    href={mockSubmission.fileUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-secondary hover:text-white transition-colors shrink-0"
                    title="Buka File"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Deliverable 2: GitHub Repo */}
                <div className="bg-surface border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 flex items-center justify-center text-[#3CD7FF] shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-xs truncate">
                        auratech-crop-engine-repo
                      </p>
                      <p className="font-mono text-[10px] text-text-secondary uppercase mt-0.5">
                        GITHUB • github.com/auratech/crop-engine
                      </p>
                    </div>
                  </div>
                  <a
                    href={mockSubmission.linkUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-secondary hover:text-white transition-colors shrink-0"
                    title="Buka Repo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Deliverable 3: Video */}
                <div className="bg-surface border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 flex items-center justify-center text-[#3CD7FF] shrink-0">
                      <Play className="w-5 h-5 fill-[#3CD7FF]" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-xs truncate">
                        CropYieldEngine_Demo.mp4
                      </p>
                      <p className="font-mono text-[10px] text-text-secondary uppercase mt-0.5">
                        VIDEO • 3m 45s • 1080p
                      </p>
                    </div>
                  </div>
                  <a
                    href={mockSubmission.linkUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-secondary hover:text-white transition-colors shrink-0"
                    title="Buka Video"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Deliverable 4: PNG Image */}
                <div className="bg-surface border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="w-9 h-9 flex items-center justify-center text-[#3CD7FF] shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white text-xs truncate">
                        System_Architecture_Diag.png
                      </p>
                      <p className="font-mono text-[10px] text-text-secondary uppercase mt-0.5">
                        PNG IMAGE • 1.8 MB
                      </p>
                    </div>
                  </div>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-secondary hover:text-white transition-colors shrink-0"
                    title="Buka Gambar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Heading & Team Members Horizontal Row */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-white">
                Team Members
              </h3>

              <div className="flex items-center gap-6 overflow-x-auto pt-1">
                {/* Member 1 */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#1E2640] border border-white/10 font-mono text-xs font-bold text-text-secondary flex items-center justify-center shrink-0">
                    AV
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs leading-tight">
                      Alissa Vance
                    </p>
                    <p className="text-[11px] text-text-secondary">AI Engineer</p>
                  </div>
                </div>

                {/* Member 2 */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#1E2640] border border-white/10 font-mono text-xs font-bold text-text-secondary flex items-center justify-center shrink-0">
                    KS
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs leading-tight">
                      Kenji Sato
                    </p>
                    <p className="text-[11px] text-text-secondary">Hardware Dev</p>
                  </div>
                </div>

                {/* Member 3 */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#1E2640] border border-white/10 font-mono text-xs font-bold text-text-secondary flex items-center justify-center shrink-0">
                    MG
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs leading-tight">
                      Maria Gomez
                    </p>
                    <p className="text-[11px] text-text-secondary">Fullstack Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* KOLOM KANAN (Scoring Panel) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Header Scoring Panel */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Scoring Panel
              </h2>
              <span className="border border-primary/40 bg-primary/20 text-[#3CD7FF] font-mono text-[11px] font-bold px-3 py-1 rounded-md">
                TRACK WEIGHT 1.0X
              </span>
            </div>

            {/* Card TOTAL SCORE */}
            <div className="bg-[#0B1838]/90 border border-[#3CD7FF]/40 rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div className="space-y-0.5">
                <span className="font-mono text-xs font-bold text-[#3CD7FF] uppercase block">
                  TOTAL SCORE
                </span>
                <p className="text-text-secondary text-[11px]">
                  Live mathematical average
                </p>
              </div>

              <div className="text-right">
                <span className="font-display text-3xl sm:text-4xl font-bold text-[#3CD7FF]">
                  {totalAverageScore}
                </span>
                <span className="font-mono text-xs text-text-secondary"> / 100</span>
              </div>
            </div>

            {/* List Kriteria (4 Criteria) */}
            <div className="space-y-6 pt-2">
              {mockCriteria.map((criterion) => {
                const currentScore = scores[criterion.id] ?? 85;

                return (
                  <div key={criterion.id} className="space-y-2">
                    {/* Title & Score Indicator */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {criterion.name}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {criterion.shortSubtitle}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-display font-bold text-[#3CD7FF] text-sm">
                          {currentScore}
                        </span>
                        <span className="font-mono text-xs text-text-secondary"> / 100</span>
                      </div>
                    </div>

                    {/* Progress Bar & -5 / +5 Buttons */}
                    <div className="flex items-center gap-3">
                      {/* Track & Filled Progress Bar */}
                      <div className="flex-1 bg-surface/80 rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className="bg-[#3CD7FF] h-full transition-all duration-200 rounded-full"
                          style={{ width: `${currentScore}%` }}
                        />
                      </div>

                      {/* -5 Button */}
                      <button
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => adjustScore(criterion.id, -5)}
                        className="bg-surface hover:bg-card-hover border border-border text-white text-[11px] font-mono px-2 py-0.5 rounded cursor-pointer disabled:opacity-40"
                      >
                        -5
                      </button>

                      {/* +5 Button */}
                      <button
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => adjustScore(criterion.id, 5)}
                        className="bg-surface hover:bg-card-hover border border-border text-white text-[11px] font-mono px-2 py-0.5 rounded cursor-pointer disabled:opacity-40"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evaluation Comments Textarea */}
            <div className="space-y-2 pt-2">
              <label className="block font-display font-bold text-white text-sm">
                Evaluation Comments
              </label>
              <textarea
                rows={4}
                disabled={isSubmitted}
                placeholder="......"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-surface border border-border/80 rounded-xl px-4 py-3 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-[#3CD7FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-3">
              {/* Save Draft Button (Left, smaller portion) */}
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitted}
                onClick={handleSaveDraft}
                className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold h-11 px-6 rounded-xl flex-1 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-text-secondary" />
                <span>Save Draft</span>
              </Button>

              {/* Submit Score Button (Right, solid [#3CD7FF]/cyan, larger portion) */}
              <Button
                type="button"
                disabled={isSubmitted || isSubmitting}
                onClick={() => setShowConfirmModal(true)}
                className="bg-accent hover:bg-accent/90 text-background text-xs font-display font-bold h-11 px-8 rounded-xl flex-2 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-3" />
                <span>{isSubmitting ? "Submitting..." : "Submit Score"}</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="bg-card border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Konfirmasi Pengiriman Nilai
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Apakah Anda yakin ingin mengirimkan penilaian dengan total skor <strong className="text-[#3CD7FF]">{totalAverageScore} / 100</strong>? Penilaian yang sudah dikirim <strong className="text-white">TIDAK BISA DIUBAH KEMBALI</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="bg-surface text-text-secondary text-xs h-9 px-4 rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                className="bg-accent text-background font-bold text-xs h-9 px-5 rounded-xl"
              >
                Ya, Kirim Sekarang
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
