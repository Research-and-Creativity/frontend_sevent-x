"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Competition } from "@/types/api";

interface CalculatedRankItem {
  rank: number;
  teamId: string;
  teamName: string;
  projectTitle: string;
  category: string;
  finalScore: number;
  isFinalist: boolean;
  isFullyScored?: boolean;
}

export default function AdminResultsPage() {
  // 1. Fetch competitions list
  const { data: competitions = [] } = useQuery<Competition[]>({
    queryKey: ["adminCompetitionsList"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/competitions");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const [selectedCompSlug, setSelectedCompSlug] = useState("");
  const activeSlug = selectedCompSlug || competitions[0]?.slug || "";

  const [roundName, setRoundName] = useState("PENYISIHAN");
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [rankings, setRankings] = useState<CalculatedRankItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    if (!activeSlug) {
      toast.error("Pilih Kompetisi terlebih dahulu.");
      return;
    }
    setIsExporting(true);
    try {
      const res = await apiClient.get("/api/export/scores", {
        params: { competitionSlug: activeSlug, round: roundName },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nilai-${activeSlug}-${roundName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export CSV berhasil.");
    } catch (err) {
      toast.error("Gagal export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // BE mengembalikan array datar sesuai CalculatedRankItem.
  const handleCalculateScores = async () => {
    if (!activeSlug) {
      toast.error("Pilih Kompetisi terlebih dahulu.");
      return;
    }

    setIsCalculating(true);
    try {
      const res = await apiClient.post("/api/admin/announcements/calculate", {
        competitionSlug: activeSlug,
        round: roundName,
      });
      const data = res.data?.data || res.data;
      const list: CalculatedRankItem[] = Array.isArray(data) ? data : [];
      setRankings(list);

      if (list.length === 0) {
        toast.info("Belum ada tim yang bisa dihitung pada kompetisi ini.");
      } else {
        toast.success("Kalkulasi skor akumulasi juri berhasil dihitung!");
      }
    } catch (err) {
      setRankings([]);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Gagal menghitung skor akumulasi juri.");
    } finally {
      setIsCalculating(false);
      setHasCalculated(true);
    }
  };

  // Handler: Publish Results (mengubah publishedAt di BE)
  const handlePublishResults = async () => {
    if (!hasCalculated) return;
    setIsPublishing(true);
    try {
      await apiClient.patch("/api/admin/announcements/publish", {
        competitionSlug: activeSlug,
        round: roundName,
      });
      setIsPublished(true);
      toast.success("Pengumuman Pemenang Resmi Berhasil Dipublikasikan!");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Gagal mempublikasikan hasil.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Results</h1>
      </div>

      {/* Selector Controls Bar: Pilih Kompetisi, Round, & Tombol Hitung */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Dropdown Pilih Kompetisi (berbasis slug) */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-sm text-white/70">
              Pilih Kompetisi
            </label>
            <select
              value={activeSlug}
              onChange={(e) => {
                setSelectedCompSlug(e.target.value);
                setHasCalculated(false);
                setIsPublished(false);
              }}
              className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
            >
              {competitions.map((comp) => (
                <option key={comp.id || comp.slug} value={comp.slug}>
                  {comp.name}
                </option>
              ))}
              {competitions.length === 0 && (
                <option value="">Memuat kompetisi...</option>
              )}
            </select>
          </div>

          {/* Input / Dropdown Round */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-sm text-white/70">
              Tahap / Round
            </label>
            <select
              value={roundName}
              onChange={(e) => {
                setRoundName(e.target.value);
                setHasCalculated(false);
                setIsPublished(false);
              }}
              className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
            >
              <option value="PENYISIHAN">Penyisihan (Finalis)</option>
              <option value="FINAL">Final (Pemenang)</option>
            </select>
          </div>

          {/* Tombol Hitung Akumulasi Skor Juri */}
          <div className="sm:col-span-3">
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculateScores}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm h-12 px-6 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCalculating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCalculating ? "Mengkalkulasi..." : "Hitung Akumulasi Skor Juri"}
            </button>
          </div>

          {/* Tombol Export CSV (read-only) */}
          <div className="sm:col-span-3">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportCsv}
              className="w-full flex items-center justify-center gap-2 border border-white/20 text-white font-semibold text-sm h-12 px-6 rounded-full hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isExporting ? "Mengekspor..." : "Export CSV (Read-only)"}
            </button>
          </div>
        </div>
      </div>

      {/* Hasil Kalkulasi Tabel Ranking */}
      {hasCalculated && (
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="space-y-0.5">
              <h2 className="font-display text-2xl font-bold">
                Hasil Ranking Skor Akumulasi
              </h2>
              <p className="text-xs text-white/40">
                {roundName} • Total {rankings.length} Submissions Calculated
              </p>
            </div>

            {isPublished && (
              <span className="inline-block px-4 py-1.5 rounded-full border border-[#3CB578]/40 text-xs font-semibold text-[#63CFA0]">
                Sudah Dipublikasikan
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/70">
                  <th className="pb-3 font-semibold text-center w-16">Rank</th>
                  <th className="pb-3 font-semibold">Nama Tim & Project</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold text-center">Skor Akhir</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rankings.map((item) => (
                  <tr key={item.teamId} className="hover:bg-white/[0.03] transition-colors">
                    {/* Rank Number */}
                    <td className="py-4 text-center font-bold text-sm">
                      <span className={item.rank <= 3 ? "text-[#7FA7F5]" : "text-white/40"}>
                        #{item.rank}
                      </span>
                    </td>

                    {/* Team & Project */}
                    <td className="py-4 pr-4">
                      <p className="font-bold text-white text-sm">{item.teamName}</p>
                      <p className="text-xs text-white/40 truncate max-w-md">
                        {item.projectTitle}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 pr-4 text-white/40">
                      {item.category}
                    </td>

                    {/* Final Score */}
                    <td className="py-4 text-center font-bold text-sm text-[#7FA7F5]">
                      {item.finalScore.toFixed(1)}{" "}
                      <span className="text-xs text-white/40 font-normal">/ 100</span>
                      {item.isFullyScored === false && (
                        <p className="mt-1 font-normal text-[11px] text-amber-400">
                          Belum dinilai penuh
                        </p>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 text-right">
                      {item.isFinalist ? (
                        <span className="inline-block px-4 py-1.5 rounded-full border border-[#3CB578]/40 text-xs font-semibold text-[#63CFA0]">
                          Finalis
                        </span>
                      ) : (
                        <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-white/40">
                          Peserta
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Bar: Publikasikan Pemenang Resmi */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              {isPublished
                ? "Pengumuman pemenang resmi telah dikirim ke leaderboard publik peserta."
                : "Klik tombol di kanan untuk mempublikasikan hasil kalkulasi ini ke publik."}
            </p>

            <button
              type="button"
              disabled={isPublishing || isPublished}
              onClick={handlePublishResults}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPublished
                ? "Sudah Dipublikasikan"
                : isPublishing
                ? "Mempublikasikan..."
                : "Publikasikan Pemenang Resmi"}
            </button>
          </div>
        </div>
      )}

      {/* Disabled State Info Card before Calculation */}
      {!hasCalculated && (
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 text-center space-y-4">
          <p className="text-sm text-white/40">
            Hitung skor dulu sebelum publikasi. Pilih cabang kompetisi dan klik
            tombol <strong className="text-white">&quot;Hitung Akumulasi Skor Juri&quot;</strong> di atas.
          </p>

          <button
            type="button"
            disabled
            className="bg-white/40 text-white/50 cursor-not-allowed font-semibold text-sm px-6 h-12 rounded-full"
          >
            Publikasikan Pemenang Resmi
          </button>
        </div>
      )}
    </div>
  );
}