"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface CalculatedRankItem {
  rank: number;
  teamId: string;
  teamName: string;
  projectTitle: string;
  category: string;
  finalScore: number;
  isFinalist: boolean;
}

export default function AdminResultsPage() {
  const [selectedCompetition, setSelectedCompetition] = useState("comp-1");
  const [roundName, setRoundName] = useState("Final Round");
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [rankings, setRankings] = useState<CalculatedRankItem[]>([]);

  // Mock Ranking Data generated on calculation
  const mockCalculatedRankings: CalculatedRankItem[] = [
    {
      rank: 1,
      teamId: "t-101",
      teamName: "Aura Tech",
      projectTitle: "Predictive Crop Yield Engine & Sensor Dashboard",
      category: "Web Development",
      finalScore: 94.2,
      isFinalist: true,
    },
    {
      rank: 2,
      teamId: "t-105",
      teamName: "Apex Coders",
      projectTitle: "E-Commerce Micro-Frontend Engine",
      category: "Web Development",
      finalScore: 88.5,
      isFinalist: true,
    },
    {
      rank: 3,
      teamId: "t-102",
      teamName: "Nexus Innovators",
      projectTitle: "Smart Campus IoT Portal",
      category: "Web Development",
      finalScore: 85.0,
      isFinalist: true,
    },
    {
      rank: 4,
      teamId: "t-104",
      teamName: "ByteSquad",
      projectTitle: "AI Healthcare Diagnostics Web App",
      category: "Web Development",
      finalScore: 81.4,
      isFinalist: true,
    },
    {
      rank: 5,
      teamId: "t-103",
      teamName: "CyberCrafters",
      projectTitle: "Decentralized Auth Hub",
      category: "Web Development",
      finalScore: 78.9,
      isFinalist: true,
    },
    {
      rank: 6,
      teamId: "t-106",
      teamName: "Quantum Shift",
      projectTitle: "Cloud Resource Optimizer",
      category: "Web Development",
      finalScore: 74.2,
      isFinalist: false,
    },
  ];

  // Handler: Calculate Scores
  const handleCalculateScores = async () => {
    setIsCalculating(true);
    try {
      await apiClient.post("/api/admin/announcements/calculate", {
        competitionId: selectedCompetition,
        round: roundName,
      });
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsCalculating(false);
      setHasCalculated(true);
      setRankings(mockCalculatedRankings);
      toast.success("Kalkulasi skor akumulasi juri berhasil dihitung!");
    }, 600);
  };

  // Handler: Publish Results
  const handlePublishResults = async () => {
    if (!hasCalculated) return;
    setIsPublishing(true);
    try {
      await apiClient.patch("/api/admin/announcements/publish", {
        competitionId: selectedCompetition,
        round: roundName,
      });
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);
      toast.success("Pengumuman Pemenang Resmi Berhasil Dipublikasikan!");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Subtitle Singkat (TANPA Instructional Card Berlebihan) */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Publish Results & Winner Announcement
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Konsolidasi skor akumulasi juri dan publikasi pemenang resmi ke peserta.
        </p>
      </div>

      {/* 2. Selector Controls Bar: Pilih Kompetisi, Round, & Tombol Hitung */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Dropdown Pilih Kompetisi */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
              Pilih Kompetisi
            </label>
            <select
              value={selectedCompetition}
              onChange={(e) => {
                setSelectedCompetition(e.target.value);
                setHasCalculated(false);
                setIsPublished(false);
              }}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="comp-1" className="bg-card text-white">
                National Web Development Competition 2026
              </option>
              <option value="comp-2" className="bg-card text-white">
                National UI/UX Design Challenge 2026
              </option>
            </select>
          </div>

          {/* Input / Dropdown Round */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
              Tahap / Round
            </label>
            <select
              value={roundName}
              onChange={(e) => {
                setRoundName(e.target.value);
                setHasCalculated(false);
                setIsPublished(false);
              }}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="Final Round" className="bg-card text-white">Final Round</option>
              <option value="Phase 1 Preliminary" className="bg-card text-white">Phase 1 Preliminary</option>
              <option value="Phase 2 Finalist" className="bg-card text-white">Phase 2 Finalist</option>
            </select>
          </div>

          {/* Tombol Hitung Akumulasi Skor Juri */}
          <div className="sm:col-span-3">
            <Button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculateScores}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isCalculating ? "Mengkalkulasi..." : "Hitung Akumulasi Skor Juri"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Hasil Kalkulasi Tabel Ranking (Pola Style Sama dengan Teams & Payment) */}
      {hasCalculated && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="space-y-0.5">
              <h2 className="font-display text-xl font-bold text-white">
                Hasil Ranking Skor Akumulasi
              </h2>
              <p className="text-xs text-text-secondary font-mono">
                {roundName} • Total {rankings.length} Submissions Calculated
              </p>
            </div>

            {isPublished && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                Sudah Dipublikasikan
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                  <th className="pb-3 font-semibold text-center w-16">Rank</th>
                  <th className="pb-3 font-semibold">Nama Tim & Project</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold text-center">Skor Akhir</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rankings.map((item) => (
                  <tr key={item.teamId} className="hover:bg-surface/50 transition-colors">
                    {/* Rank Number */}
                    <td className="py-4 text-center font-mono font-bold text-sm">
                      <span className={item.rank <= 3 ? "text-accent" : "text-text-secondary"}>
                        #{item.rank}
                      </span>
                    </td>

                    {/* Team & Project */}
                    <td className="py-4 pr-4">
                      <p className="font-bold text-white text-sm">{item.teamName}</p>
                      <p className="text-xs text-text-secondary truncate max-w-md">
                        {item.projectTitle}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 pr-4 font-mono text-text-secondary">
                      {item.category}
                    </td>

                    {/* Final Score */}
                    <td className="py-4 text-center font-display font-bold text-sm text-accent">
                      {item.finalScore.toFixed(1)} <span className="text-xs text-text-secondary font-normal">/ 100</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 text-right">
                      {item.isFinalist ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md">
                          Finalis
                        </span>
                      ) : (
                        <span className="bg-surface text-text-secondary border border-border text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md">
                          Peserta
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Action Bar: Publikasikan Pemenang Resmi */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-secondary">
              {isPublished
                ? "Pengumuman pemenang resmi telah dikirim ke leaderboard publik peserta."
                : "Klik tombol di kanan untuk mempublikasikan hasil kalkulasi ini ke publik."}
            </p>

            <Button
              type="button"
              disabled={isPublishing || isPublished}
              onClick={handlePublishResults}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-6 h-10 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isPublished
                ? "Sudah Dipublikasikan"
                : isPublishing
                ? "Mempublikasikan..."
                : "Publikasikan Pemenang Resmi"}
            </Button>
          </div>
        </Card>
      )}

      {/* Disabled State Info Card before Calculation */}
      {!hasCalculated && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 text-center space-y-3">
          <p className="text-xs text-text-secondary">
            Hitung skor dulu sebelum publikasi. Pilih cabang kompetisi dan klik tombol <strong className="text-white">"Hitung Akumulasi Skor Juri"</strong> di atas.
          </p>

          <div>
            <Button
              disabled
              className="bg-emerald-600/40 text-white/50 text-xs font-semibold px-6 h-10 rounded-xl cursor-not-allowed"
            >
              Publikasikan Pemenang Resmi
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
