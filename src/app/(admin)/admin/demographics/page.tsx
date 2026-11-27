"use client";

import { useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  School,
  MapPin,
  Search,
  Download,
  Filter,
  RefreshCw,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination, paginateItems } from "@/components/shared/table-pagination";
import { useAdminDemographics } from "@/hooks/use-admin";

type TabKey = "provinsi" | "institusi" | "tim";

export default function AdminDemographicsPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminDemographics();

  const [activeTab, setActiveTab] = useState<TabKey>("provinsi");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [competitionFilter, setCompetitionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [provinceFilter, setProvinceFilter] = useState<string>("ALL");

  // Pagination states per tab
  const [provPage, setProvPage] = useState(1);
  const [provPageSize, setProvPageSize] = useState(10);

  const [instPage, setInstPage] = useState(1);
  const [instPageSize, setInstPageSize] = useState(10);

  const [teamPage, setTeamPage] = useState(1);
  const [teamPageSize, setTeamPageSize] = useState(10);

  const summary = data?.summary;
  const provinces = data?.provinces || [];
  const institutions = data?.institutions || [];
  const teams = data?.teams || [];

  // Filtered Provinces
  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return provinces;
    const q = searchQuery.toLowerCase();
    return provinces.filter(
      (p) =>
        p.province.toLowerCase().includes(q) ||
        p.topInstitutions.some((inst) => inst.toLowerCase().includes(q))
    );
  }, [provinces, searchQuery]);

  // Filtered Institutions
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      if (levelFilter !== "ALL" && inst.level !== levelFilter) return false;
      if (provinceFilter !== "ALL" && inst.province !== provinceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          inst.name.toLowerCase().includes(q) ||
          inst.province.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [institutions, levelFilter, provinceFilter, searchQuery]);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (levelFilter !== "ALL" && t.detectedLevel !== levelFilter) return false;
      if (competitionFilter !== "ALL" && t.competitionSlug !== competitionFilter)
        return false;
      if (statusFilter !== "ALL") {
        const s = (t.status || "").toUpperCase();
        if (statusFilter === "APPROVE") {
          if (!s.includes("APPROV") && !s.includes("VERIF")) return false;
        } else if (statusFilter === "REVIEW") {
          if (!s.includes("REVIEW")) return false;
        } else if (statusFilter === "REJECT") {
          if (!s.includes("REJECT")) return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }
      if (provinceFilter !== "ALL" && t.detectedProvince !== provinceFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.teamName.toLowerCase().includes(q) ||
          t.teamCode.toLowerCase().includes(q) ||
          t.leaderName.toLowerCase().includes(q) ||
          t.leaderInstitution.toLowerCase().includes(q) ||
          t.leaderDomicile.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [teams, levelFilter, competitionFilter, statusFilter, provinceFilter, searchQuery]);

  const { pageItems: paginatedProvinces } = paginateItems(
    filteredProvinces,
    provPage,
    provPageSize
  );

  const { pageItems: paginatedInstitutions } = paginateItems(
    filteredInstitutions,
    instPage,
    instPageSize
  );

  const { pageItems: paginatedTeams } = paginateItems(
    filteredTeams,
    teamPage,
    teamPageSize
  );

  // List opsi provinsi untuk dropdown filter
  const allProvinceNames = useMemo(() => {
    return Array.from(new Set(provinces.map((p) => p.province))).sort();
  }, [provinces]);

  // Ekspor CSV Data Demografi Lengkap (UTF-8 with BOM untuk kompatibilitas Excel)
  const handleExportCSV = () => {
    if (!teams || teams.length === 0) return;

    const headers = [
      "Kode Tim",
      "Nama Tim",
      "Kompetisi",
      "Status Tim",
      "Jumlah Anggota",
      "Jenjang Terdeteksi",
      "Kategori Jenjang",
      "Provinsi Terdeteksi",
      "Nama Ketua",
      "Email Ketua",
      "No HP Ketua",
      "Institusi / Sekolah / Kampus",
      "Domisili Asli",
    ];

    const rows = teams.map((t) => [
      `"${t.teamCode}"`,
      `"${t.teamName.replace(/"/g, '""')}"`,
      `"${t.competitionName.replace(/"/g, '""')}"`,
      `"${t.status}"`,
      t.memberCount,
      `"${t.detectedLevel}"`,
      `"${t.detectedSubcategory}"`,
      `"${t.detectedProvince.replace(/"/g, '""')}"`,
      `"${t.leaderName.replace(/"/g, '""')}"`,
      `"${t.leaderEmail}"`,
      `"${t.leaderPhone || "-"}"`,
      `"${t.leaderInstitution.replace(/"/g, '""')}"`,
      `"${t.leaderDomicile.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `demografi-peserta-seventx-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Demografi Peserta
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-medium">
              Statistik sebaran jenjang pendidikan (SMA/SMK vs Kuliah), institusi, dan asal wilayah peserta SEVENT X
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isLoading || !teams.length}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta & Tim */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-white/60">
              TOTAL PESERTA & TIM
            </span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 bg-white/10" />
          ) : (
            <>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {summary?.totalTeams ?? 0}{" "}
                <span className="text-sm font-normal text-white/50">Tim</span>
              </p>
              <p className="text-xs text-white/50 mt-2">
                {summary?.totalParticipants ?? 0} total peserta terdaftar
              </p>
            </>
          )}
        </div>

        {/* Siswa SMA / SMK / MA */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-white/60">
              SISWA (SMA / SMK)
            </span>
            <School className="w-5 h-5 text-white/70" />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 bg-white/10" />
          ) : (
            <>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {summary?.byLevel.smaSmk.teamsCount ?? 0}{" "}
                <span className="text-sm font-normal text-white/50">
                  Tim ({summary?.byLevel.smaSmk.percentage ?? 0}%)
                </span>
              </p>
              <p className="text-xs text-white/50 mt-2">
                {summary?.byLevel.smaSmk.participantsCount ?? 0} siswa (
                {summary?.byLevel.smaSmk.smkCount ?? 0} SMK,{" "}
                {summary?.byLevel.smaSmk.smaCount ?? 0} SMA,{" "}
                {summary?.byLevel.smaSmk.maCount ?? 0} MA)
              </p>
            </>
          )}
        </div>

        {/* Mahasiswa Kuliah / PT */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-white/60">
              KULIAH (PERGURUAN TINGGI)
            </span>
            <GraduationCap className="w-5 h-5 text-white/70" />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 bg-white/10" />
          ) : (
            <>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {summary?.byLevel.kuliah.teamsCount ?? 0}{" "}
                <span className="text-sm font-normal text-white/50">
                  Tim ({summary?.byLevel.kuliah.percentage ?? 0}%)
                </span>
              </p>
              <p className="text-xs text-white/50 mt-2">
                {summary?.byLevel.kuliah.participantsCount ?? 0} mahasiswa (
                {summary?.byLevel.kuliah.univCount ?? 0} Univ,{" "}
                {summary?.byLevel.kuliah.polytechnicCount ?? 0} Poltek,{" "}
                {summary?.byLevel.kuliah.instituteCount ?? 0} Institut)
              </p>
            </>
          )}
        </div>

        {/* Sebaran Wilayah */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-white/60">
              CAKUPAN PROVINSI
            </span>
            <MapPin className="w-5 h-5 text-white/70" />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24 bg-white/10" />
          ) : (
            <>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {summary?.totalProvinces ?? 0}{" "}
                <span className="text-sm font-normal text-white/50">
                  / 38 Provinsi
                </span>
              </p>
              <p className="text-xs text-white/50 mt-2">
                {summary?.totalInstitutions ?? 0} sekolah & kampus terdaftar
              </p>
            </>
          )}
        </div>
      </div>

      {/* Visual Distribution Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribusi Jenjang & Kompetisi */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-widest text-white/60">
                PROPORSI JENJANG PENDIDIKAN
              </span>
              <Building2 className="w-4 h-4 text-white/40" />
            </div>

            {/* Proportion Bar */}
            {isLoading ? (
              <Skeleton className="h-4 w-full bg-white/10 rounded-full my-4" />
            ) : (
              <div className="space-y-3">
                <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden flex">
                  <div
                    style={{
                      width: `${summary?.byLevel.smaSmk.percentage ?? 0}%`,
                    }}
                    className="bg-[#7D8CFF] h-full transition-all duration-500"
                    title={`SMA/SMK: ${summary?.byLevel.smaSmk.percentage}%`}
                  />
                  <div
                    style={{
                      width: `${summary?.byLevel.kuliah.percentage ?? 0}%`,
                    }}
                    className="bg-white/80 h-full transition-all duration-500"
                    title={`Kuliah: ${summary?.byLevel.kuliah.percentage}%`}
                  />
                  <div
                    style={{
                      width: `${summary?.byLevel.unclassified.percentage ?? 0}%`,
                    }}
                    className="bg-white/20 h-full transition-all duration-500"
                    title={`Lainnya: ${summary?.byLevel.unclassified.percentage}%`}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7D8CFF]" />
                    <span>SMA/SMK ({summary?.byLevel.smaSmk.percentage ?? 0}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/80" />
                    <span>Kuliah ({summary?.byLevel.kuliah.percentage ?? 0}%)</span>
                  </div>
                  {Number(summary?.byLevel.unclassified.percentage ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                      <span>Lainnya ({summary?.byLevel.unclassified.percentage}%)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rincian per Kompetisi */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] tracking-wider text-white/40 uppercase block mb-3">
              Rincian per Cabang Lomba
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary?.byCompetition.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5"
                >
                  <p className="text-xs font-semibold text-white/90">{c.name}</p>
                  <p className="font-display text-xl font-bold text-white mt-1">
                    {c.totalTeams}{" "}
                    <span className="text-xs font-normal text-white/50">Tim</span>
                  </p>
                  <div className="mt-2 text-[11px] text-white/50 space-y-0.5">
                    <div className="flex justify-between">
                      <span>SMA/SMK:</span>
                      <span className="text-white/80 font-medium">
                        {c.smaSmkTeams} tim
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kuliah:</span>
                      <span className="text-white/80 font-medium">
                        {c.kuliahTeams} tim
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Provinsi Teraktif */}
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-white/60">
              TOP PROVINSI TERAKTIF
            </span>
            <MapPin className="w-4 h-4 text-white/40" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-7 w-full bg-white/10" />
              ))}
            </div>
          ) : provinces.length === 0 ? (
            <p className="text-sm text-white/40 py-8 text-center">
              Belum ada data domisili peserta.
            </p>
          ) : (
            <div className="space-y-3.5">
              {provinces.slice(0, 6).map((p, idx) => (
                <div key={p.province} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white/90">
                      {idx + 1}. {p.province}
                    </span>
                    <span className="text-white/50">
                      <strong className="text-white font-semibold">
                        {p.teamsCount}
                      </strong>{" "}
                      tim · {p.participantsCount} peserta ({p.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(p.percentage, 4)}%` }}
                      className="h-full rounded-full bg-white/60 transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Tabbed Data View */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("provinsi");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "provinsi"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Sebaran Provinsi ({provinces.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("institusi");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "institusi"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Daftar Sekolah / Kampus ({institutions.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("tim");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "tim"
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Detail Tim ({teams.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setProvPage(1);
                setInstPage(1);
                setTeamPage(1);
              }}
              placeholder={
                activeTab === "provinsi"
                  ? "Cari nama provinsi..."
                  : activeTab === "institusi"
                  ? "Cari nama sekolah / kampus..."
                  : "Cari nama tim, ketua, kampus..."
              }
              className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Filter Controls for Institusi & Tim tabs */}
        {(activeTab === "institusi" || activeTab === "tim") && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
            <span className="flex items-center gap-1.5 text-white/40 font-medium">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Jenjang Filter */}
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setInstPage(1);
                setTeamPage(1);
              }}
              className="bg-[#15161A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="SMA/SMK">SMA / SMK / Sederajat</option>
              <option value="KULIAH">Kuliah (Perguruan Tinggi)</option>
            </select>

            {/* Competition Filter (Khusus Tab Tim) */}
            {activeTab === "tim" && (
              <select
                value={competitionFilter}
                onChange={(e) => {
                  setCompetitionFilter(e.target.value);
                  setTeamPage(1);
                }}
                className="bg-[#15161A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30"
              >
                <option value="ALL">Semua Kompetisi</option>
                {summary?.byCompetition.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter (Khusus Tab Tim) */}
            {activeTab === "tim" && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTeamPage(1);
                }}
                className="bg-[#15161A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30"
              >
                <option value="ALL">Semua Status</option>
                <option value="APPROVE">Approved</option>
                <option value="REVIEW">Need Review</option>
                <option value="REJECT">Rejected</option>
              </select>
            )}

            {/* Province Filter */}
            <select
              value={provinceFilter}
              onChange={(e) => {
                setProvinceFilter(e.target.value);
                setInstPage(1);
                setTeamPage(1);
              }}
              className="bg-[#15161A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30 max-w-[200px]"
            >
              <option value="ALL">Semua Provinsi</option>
              {allProvinceNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {(levelFilter !== "ALL" ||
              competitionFilter !== "ALL" ||
              statusFilter !== "ALL" ||
              provinceFilter !== "ALL" ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setLevelFilter("ALL");
                  setCompetitionFilter("ALL");
                  setStatusFilter("ALL");
                  setProvinceFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-xs text-white/40 hover:text-white underline ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* TAB 1: SEBARAN PROVINSI */}
        {activeTab === "provinsi" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead>
                  <tr className="border-b border-white/10 text-xs tracking-wider text-white/40 uppercase">
                    <th className="py-3 px-4">Provinsi</th>
                    <th className="py-3 px-4">Jumlah Tim</th>
                    <th className="py-3 px-4">Jumlah Peserta</th>
                    <th className="py-3 px-4">Porsi (%)</th>
                    <th className="py-3 px-4">Contoh Sekolah / Kampus Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        Memuat data provinsi...
                      </td>
                    </tr>
                  ) : paginatedProvinces.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        Tidak ada provinsi yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedProvinces.map((p) => (
                      <tr key={p.province} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {p.province}
                        </td>
                        <td className="py-3.5 px-4 text-white/90">
                          {p.teamsCount} Tim
                        </td>
                        <td className="py-3.5 px-4 text-white/70">
                          {p.participantsCount} Peserta
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                            {p.percentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-white/50 max-w-md truncate">
                          {p.topInstitutions.length > 0
                            ? p.topInstitutions.join(", ")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredProvinces.length > 0 && (
              <TablePagination
                totalItems={filteredProvinces.length}
                currentPage={provPage}
                pageSize={provPageSize}
                onPageChange={setProvPage}
                onPageSizeChange={setProvPageSize}
                suffixLabel="Provinsi"
              />
            )}
          </div>
        )}

        {/* TAB 2: DAFTAR INSTITUSI */}
        {activeTab === "institusi" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead>
                  <tr className="border-b border-white/10 text-xs tracking-wider text-white/40 uppercase">
                    <th className="py-3 px-4">Nama Institusi / Sekolah / Kampus</th>
                    <th className="py-3 px-4">Kategori Jenjang</th>
                    <th className="py-3 px-4">Provinsi</th>
                    <th className="py-3 px-4 text-right">Jumlah Tim</th>
                    <th className="py-3 px-4 text-right">Jumlah Peserta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        Memuat data institusi...
                      </td>
                    </tr>
                  ) : paginatedInstitutions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        Tidak ada institusi yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedInstitutions.map((inst, idx) => (
                      <tr key={`${inst.name}-${idx}`} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {inst.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                              inst.level === "SMA/SMK"
                                ? "bg-[#7D8CFF]/10 text-[#7D8CFF] border-[#7D8CFF]/30"
                                : inst.level === "KULIAH"
                                ? "bg-white/10 text-white border-white/20"
                                : "bg-white/5 text-white/50 border-white/10"
                            }`}
                          >
                            {inst.level === "SMA/SMK"
                              ? "SMA / SMK"
                              : inst.level === "KULIAH"
                              ? "Perguruan Tinggi"
                              : "Lainnya"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-white/70">
                          {inst.province}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-white/90">
                          {inst.teamsCount}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-white/60">
                          {inst.participantsCount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredInstitutions.length > 0 && (
              <TablePagination
                totalItems={filteredInstitutions.length}
                currentPage={instPage}
                pageSize={instPageSize}
                onPageChange={setInstPage}
                onPageSizeChange={setInstPageSize}
                suffixLabel="Institusi"
              />
            )}
          </div>
        )}

        {/* TAB 3: DETAIL TIM */}
        {activeTab === "tim" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead>
                  <tr className="border-b border-white/10 text-xs tracking-wider text-white/40 uppercase">
                    <th className="py-3 px-4">Kode Tim</th>
                    <th className="py-3 px-4">Nama Tim</th>
                    <th className="py-3 px-4">Kompetisi</th>
                    <th className="py-3 px-4">Institusi & Ketua</th>
                    <th className="py-3 px-4">Jenjang</th>
                    <th className="py-3 px-4">Provinsi & Domisili</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        Memuat data tim...
                      </td>
                    </tr>
                  ) : paginatedTeams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-white/40">
                        Tidak ada tim yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedTeams.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-mono text-xs text-white/60">
                          {t.teamCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {t.teamName}
                          <span className="block text-[11px] font-normal text-white/40">
                            {t.memberCount} anggota
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-white/70">
                          {t.competitionName}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs font-medium text-white/90 truncate">
                            {t.leaderInstitution}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">
                            Ketua: {t.leaderName}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              t.detectedLevel === "SMA/SMK"
                                ? "bg-[#7D8CFF]/10 text-[#7D8CFF]"
                                : t.detectedLevel === "KULIAH"
                                ? "bg-white/10 text-white/90"
                                : "bg-white/5 text-white/40"
                            }`}
                          >
                            {t.detectedSubcategory}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs text-white/90 font-medium truncate">
                            {t.detectedProvince}
                          </p>
                          <p className="text-[11px] text-white/40 truncate">
                            {t.leaderDomicile || "-"}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              t.status?.toUpperCase().includes("APPROV") || t.status?.toUpperCase().includes("VERIF")
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : t.status?.toUpperCase().includes("REVIEW")
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            }`}
                          >
                            {t.status === "APPROVE"
                              ? "Approved"
                              : t.status === "REVIEW"
                              ? "Need Review"
                              : t.status === "REJECT"
                              ? "Rejected"
                              : t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredTeams.length > 0 && (
              <TablePagination
                totalItems={filteredTeams.length}
                currentPage={teamPage}
                pageSize={teamPageSize}
                onPageChange={setTeamPage}
                onPageSizeChange={setTeamPageSize}
                suffixLabel="Tim"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
