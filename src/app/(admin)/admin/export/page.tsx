"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Users,
  Award,
  Trophy,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { getGreeting } from "@/lib/greeting";
import { useCompetitions } from "@/hooks/use-peserta";
import { TIMELINE_EVENTS } from "@/config/site";

export default function AdminExportPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: competitions = [] } = useCompetitions();

  const [exportMode, setExportMode] = useState<"member" | "team">("member");

  const [allComp, setAllComp] = useState<string>("all");
  const [allVerifiedOnly, setAllVerifiedOnly] = useState<boolean>(true);

  const [finalistComp, setFinalistComp] = useState<string>("all");
  const [winnerComp, setWinnerComp] = useState<string>("all");

  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  // Jadwal timeline & status lock
  const now = new Date();

  const getStageDate = (keyword: string, compSlug?: string): Date | null => {
    const targetComp =
      compSlug && compSlug !== "all"
        ? competitions.find((c) => c.slug === compSlug)
        : competitions[0];

    const dbStage = targetComp?.timelines?.find((t) =>
      (t.stageName || "").toLowerCase().includes(keyword.toLowerCase())
    );
    if (dbStage?.startDate) {
      const d = new Date(dbStage.startDate);
      if (!Number.isNaN(d.getTime())) return d;
    }

    const siteEvent = TIMELINE_EVENTS.find((e) =>
      (e.title || "").toLowerCase().includes(keyword.toLowerCase())
    );
    if (siteEvent?.start) {
      const d = new Date(siteEvent.start);
      if (!Number.isNaN(d.getTime())) return d;
    }

    return null;
  };

  const finalistStageDate = getStageDate("finalis", finalistComp);
  const isFinalistUnlocked = finalistStageDate ? now >= finalistStageDate : true;

  const winnerStageDate =
    getStageDate("awarding", winnerComp) || getStageDate("final lomba", winnerComp);
  const isWinnerUnlocked = winnerStageDate ? now >= winnerStageDate : true;

  const formatScheduleDate = (date: Date | null) => {
    if (!date) return "-";
    return (
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(date) + " WIB"
    );
  };

  const handleDownload = async (
    category: "all" | "finalists" | "winners",
    compSlug: string,
    format: "xlsx" | "csv",
    verifiedOnly = true
  ) => {
    const key = `${category}-${format}`;
    setDownloadingKey(key);
    try {
      const res = await apiClient.get("/api/export/participants", {
        params: {
          category,
          competitionSlug: compSlug === "all" ? undefined : compSlug,
          verifiedOnly: String(verifiedOnly),
          format,
          mode: exportMode,
        },
        responseType: "blob",
      });

      const disposition = res.headers["content-disposition"] || "";
      let filename = `sertifikat-${category}-${exportMode}.${format}`;
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match?.[1]) {
        filename = match[1];
      }

      const mimeType =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv;charset=utf-8;";

      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Berhasil mengunduh ${filename}`);
    } catch {
      toast.error("Gagal mengunduh file export. Silakan coba lagi.");
    } finally {
      setDownloadingKey(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Greeting */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h1 className="font-display text-3xl font-bold">
          {getGreeting(storeUser?.fullName, "Admin")}
        </h1>
      </div>

      {/* Header Info & Mode Selector */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Export Data Sertifikat
            </h2>
            <p className="text-xs text-white/50 mt-1 max-w-2xl leading-relaxed">
              Unduh data peserta untuk kebutuhan pencetakan sertifikat massal (Excel untuk arsip, CSV untuk Canva Bulk Create / Figma).
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <div className="bg-white/[0.04] border border-white/10 p-1 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => setExportMode("member")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  exportMode === "member"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Per Individu
              </button>
              <button
                type="button"
                onClick={() => setExportMode("team")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  exportMode === "team"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Per Tim
              </button>
            </div>
            <span className="text-[11px] text-white/40">
              {exportMode === "member"
                ? "1 baris = 1 peserta (ketua & anggota)"
                : "1 baris = 1 tim"}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: All Participants */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <Users className="w-5 h-5 text-white/70" />
            </div>

            <div>
              <span className="inline-block text-[11px] font-medium text-white/50 mb-1">
                Kepesertaan
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Sertifikat Peserta
              </h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Data seluruh peserta kompetisi untuk sertifikat kepesertaan.
              </p>
            </div>

            {/* Filter Cabang */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs text-white/50 font-medium">
                Cabang Lomba
              </label>
              <select
                value={allComp}
                onChange={(e) => setAllComp(e.target.value)}
                className="w-full bg-[#15161A] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="all">Semua Cabang Kompetisi</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.slug}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox Verified Only */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={allVerifiedOnly}
                onChange={(e) => setAllVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer"
              />
              <span className="text-xs text-white/60">
                Hanya tim terverifikasi (Approved)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={() => handleDownload("all", allComp, "xlsx", allVerifiedOnly)}
              disabled={Boolean(downloadingKey)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {downloadingKey === "all-xlsx" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleDownload("all", allComp, "csv", allVerifiedOnly)}
              disabled={Boolean(downloadingKey)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.02] text-white/80 font-medium text-xs hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              {downloadingKey === "all-csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-white/60" />
              )}
              <span>Download CSV (Canva / Figma)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Finalists */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                <Award className="w-5 h-5 text-white/70" />
              </div>
              {!isFinalistUnlocked && (
                <span className="text-[11px] font-mono text-white/40 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.02]">
                  Terkunci
                </span>
              )}
            </div>

            <div>
              <span className="inline-block text-[11px] font-medium text-white/50 mb-1">
                Babak Final
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Sertifikat Finalis
              </h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Data tim yang dinyatakan lolos ke babak final (5 tim per cabang).
              </p>
            </div>

            {/* Filter Cabang */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs text-white/50 font-medium">
                Cabang Lomba
              </label>
              <select
                value={finalistComp}
                onChange={(e) => setFinalistComp(e.target.value)}
                className="w-full bg-[#15161A] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="all">Semua Cabang Kompetisi</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.slug}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Status */}
            {!isFinalistUnlocked ? (
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs text-white/70 font-medium">Jadwal Pengumuman</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Dibuka pada {formatScheduleDate(finalistStageDate)}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-white/40 pt-1">
                {exportMode === "member"
                  ? "5 tim × 3 anggota (15 baris per cabang)"
                  : "5 baris per cabang"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={() => handleDownload("finalists", finalistComp, "xlsx")}
              disabled={Boolean(downloadingKey) || !isFinalistUnlocked}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {downloadingKey === "finalists-xlsx" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleDownload("finalists", finalistComp, "csv")}
              disabled={Boolean(downloadingKey) || !isFinalistUnlocked}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.02] text-white/80 font-medium text-xs hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {downloadingKey === "finalists-csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-white/60" />
              )}
              <span>Download CSV (Canva / Figma)</span>
            </button>
          </div>
        </div>

        {/* Card 3: Winners */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white/70" />
              </div>
              {!isWinnerUnlocked && (
                <span className="text-[11px] font-mono text-white/40 px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.02]">
                  Terkunci
                </span>
              )}
            </div>

            <div>
              <span className="inline-block text-[11px] font-medium text-white/50 mb-1">
                Podium &amp; Juara
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                Sertifikat Juara
              </h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Data tim pemenang podium (Juara 1, 2, 3) beserta predikat juaranya.
              </p>
            </div>

            {/* Filter Cabang */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs text-white/50 font-medium">
                Cabang Lomba
              </label>
              <select
                value={winnerComp}
                onChange={(e) => setWinnerComp(e.target.value)}
                className="w-full bg-[#15161A] border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="all">Semua Cabang Kompetisi</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.slug}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule Status */}
            {!isWinnerUnlocked ? (
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs text-white/70 font-medium">Jadwal Pengumuman</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Dibuka pada {formatScheduleDate(winnerStageDate)}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-white/40 pt-1">
                {exportMode === "member"
                  ? "3 tim × 3 anggota (9 baris per cabang)"
                  : "3 baris per cabang"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              onClick={() => handleDownload("winners", winnerComp, "xlsx")}
              disabled={Boolean(downloadingKey) || !isWinnerUnlocked}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {downloadingKey === "winners-xlsx" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Download Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => handleDownload("winners", winnerComp, "csv")}
              disabled={Boolean(downloadingKey) || !isWinnerUnlocked}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.02] text-white/80 font-medium text-xs hover:bg-white/[0.05] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {downloadingKey === "winners-csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-white/60" />
              )}
              <span>Download CSV (Canva / Figma)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-white/50 leading-relaxed">
            <p className="font-semibold text-white">
              Struktur Kolom ({exportMode === "member" ? "Mode Per Individu" : "Mode Per Tim"})
            </p>
            <p className="text-white/40">
              {exportMode === "member"
                ? "Setiap baris mencakup data satu peserta: No, Nama Lengkap, Email, No. WhatsApp, Asal Institusi, Nama Tim, Kode Tim, Cabang Kompetisi, Peran di Tim, Predikat Sertifikat, dan Judul Karya."
                : "Setiap baris mencakup data satu tim: No, Nama Tim, Kode Tim, Cabang Kompetisi, Ketua Tim, Email Ketua, No. WhatsApp Ketua, Anggota Tim, Asal Institusi, Predikat Sertifikat, dan Judul Karya."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
