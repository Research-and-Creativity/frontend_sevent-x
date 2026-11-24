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
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { getGreeting } from "@/lib/greeting";
import { useCompetitions } from "@/hooks/use-peserta";

export default function AdminExportPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: competitions = [] } = useCompetitions();

  // Mode: per individu (1 baris = 1 orang) atau per tim (1 baris = 1 tim)
  const [exportMode, setExportMode] = useState<"member" | "team">("member");

  // Filter states per card
  const [allComp, setAllComp] = useState<string>("all");
  const [allVerifiedOnly, setAllVerifiedOnly] = useState<boolean>(true);

  const [finalistComp, setFinalistComp] = useState<string>("all");
  const [winnerComp, setWinnerComp] = useState<string>("all");

  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

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
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">
          {getGreeting(storeUser?.fullName, "Admin")}
        </h1>
      </div>

      {/* Header Info & Mode Selector */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Export Data Sertifikat
            </h2>
            <p className="text-xs text-white/50 mt-1 max-w-3xl leading-relaxed">
              Unduh data peserta untuk keperluan pencetakan sertifikat massal.
              Gunakan <strong>Excel (.xlsx)</strong> untuk arsip rapi dengan formatting nomor HP teks, atau <strong>CSV (.csv)</strong> untuk langsung import ke <strong>Canva Bulk Create</strong> atau plugin Figma.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="bg-white/[0.04] border border-white/10 p-1 rounded-xl flex items-center shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setExportMode("member")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                exportMode === "member"
                  ? "bg-white text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Per Individu (Orang)
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
              Per Tim (1 Baris/Tim)
            </button>
          </div>
        </div>

        {/* Mode explanation banner */}
        <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-white/70">
            {exportMode === "member" ? (
              <>
                <strong>Mode Aktif: Per Individu.</strong> Setiap ketua dan anggota tim menempati 1 baris mandiri (misal 5 tim beranggotakan 3 orang = 15 baris). Cocok untuk menerbitkan sertifikat nama masing-masing peserta.
              </>
            ) : (
              <>
                <strong>Mode Aktif: Per Tim.</strong> Setiap tim menempati tepat 1 baris (5 tim finalis = 5 baris, 3 juara = 3 baris). Nama anggota digabung dalam satu kolom. Cocok untuk sertifikat tim atau rekapitulasi data.
              </>
            )}
          </p>
        </div>
      </div>

      {/* 3 Export Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: All Participants */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <Users className="w-6 h-6 text-white/80" />
            </div>

            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-medium text-white/70 mb-2">
                Kepesertaan
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Sertifikat Peserta
              </h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Mengekspor seluruh peserta kompetisi untuk keperluan sertifikat kepesertaan.
              </p>
            </div>

            {/* Filter Cabang */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-medium text-white/60">
                Cabang Lomba
              </label>
              <select
                value={allComp}
                onChange={(e) => setAllComp(e.target.value)}
                className="w-full bg-[#15161A] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 cursor-pointer"
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
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={allVerifiedOnly}
                onChange={(e) => setAllVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-white cursor-pointer"
              />
              <span className="text-xs text-white/70">
                Hanya tim terverifikasi (Approved)
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/[0.03] text-white font-medium text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {downloadingKey === "all-csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-white/70" />
              )}
              <span>Download CSV (Canva / Figma)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Finalists */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <Award className="w-6 h-6 text-white/80" />
            </div>

            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-medium text-white/70 mb-2">
                Babak Final
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Sertifikat Finalis
              </h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Mengekspor tim yang lolos sebagai finalis (5 tim per cabang lomba yang telah diumumkan).
              </p>
            </div>

            {/* Filter Cabang */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-medium text-white/60">
                Cabang Lomba
              </label>
              <select
                value={finalistComp}
                onChange={(e) => setFinalistComp(e.target.value)}
                className="w-full bg-[#15161A] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="all">Semua Cabang Kompetisi</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.slug}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-1 text-[11px] text-white/40">
              {exportMode === "member"
                ? "💡 5 tim finalis × 3 anggota = 15 baris penerima sertifikat per cabang."
                : "💡 Menghasilkan tepat 5 baris (1 tim per baris) per cabang."}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
            <button
              onClick={() => handleDownload("finalists", finalistComp, "xlsx")}
              disabled={Boolean(downloadingKey)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors disabled:opacity-50"
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
              disabled={Boolean(downloadingKey)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/[0.03] text-white font-medium text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {downloadingKey === "finalists-csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-white/70" />
              )}
              <span>Download CSV (Canva / Figma)</span>
            </button>
          </div>
        </div>

        {/* Card 3: Winners */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white/80" />
            </div>

            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-medium text-white/70 mb-2">
                Podium &amp; Juara
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                Sertifikat Juara
              </h3>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Mengekspor tim juara podium (Juara 1, 2, 3) lengkap dengan keterangan predikat juaranya.
              </p>
            </div>

            {/* Filter Cabang */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-medium text-white/60">
                Cabang Lomba
              </label>
              <select
                value={winnerComp}
                onChange={(e) => setWinnerComp(e.target.value)}
                className="w-full bg-[#15161A] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="all">Semua Cabang Kompetisi</option>
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.slug}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-1 text-[11px] text-white/40">
              {exportMode === "member"
                ? "💡 3 tim juara × 3 anggota = 9 baris penerima sertifikat per cabang."
                : "💡 Menghasilkan tepat 3 baris (Juara 1, 2, 3) per cabang."}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
            <button
              onClick={() => handleDownload("winners", winnerComp, "xlsx")}
              disabled={Boolean(downloadingKey)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors disabled:opacity-50"
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
              disabled={Boolean(downloadingKey)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/[0.03] text-white font-medium text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {downloadingKey === "winners-csv" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-white/70" />
              )}
              <span>Download CSV (Canva / Figma)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-3.5">
          <Info className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-white/60 leading-relaxed">
            <p className="font-semibold text-white text-sm">
              Informasi Kolom Data ({exportMode === "member" ? "Mode Per Individu" : "Mode Per Tim"})
            </p>
            <p>
              {exportMode === "member" ? (
                <>Setiap baris data mewakili <strong>1 individu peserta</strong> (baik ketua maupun anggota). Kolom yang disertakan meliputi:</>
              ) : (
                <>Setiap baris data mewakili <strong>1 tim</strong>. Kolom yang disertakan meliputi:</>
              )}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 text-white/70 font-mono text-[11px]">
              {exportMode === "member" ? (
                <>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• No</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Nama Lengkap</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Email</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• No. WhatsApp / HP</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Asal Institusi</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Nama Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Kode Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Cabang Kompetisi</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Peran di Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Predikat Sertifikat</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Judul Karya</span>
                </>
              ) : (
                <>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• No</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Nama Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Kode Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Cabang Kompetisi</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Ketua Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Email Ketua</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• No. WhatsApp Ketua</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Anggota Tim</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Asal Institusi</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Predikat Sertifikat</span>
                  <span className="p-2 rounded bg-white/[0.02] border border-white/5">• Judul Karya</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
