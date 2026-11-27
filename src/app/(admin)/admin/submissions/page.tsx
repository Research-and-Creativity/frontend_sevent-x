"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { getGreeting } from "@/lib/greeting";
import { useAdminSubmissions } from "@/hooks/use-admin";
import { useCompetitions } from "@/hooks/use-peserta";
import { TablePagination, paginateItems } from "@/components/shared/table-pagination";
import type { Submission } from "@/types/api";

export default function AdminSubmissionsPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: competitions = [] } = useCompetitions();
  const [competitionFilter, setCompetitionFilter] = useState<string>("all");
  const { data: submissions = [], isLoading, isError, refetch } = useAdminSubmissions(
    competitionFilter === "all" ? undefined : competitionFilter
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [evaluationFilter, setEvaluationFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return submissions
      .filter((s: Submission) => {
        const teamName = s.team?.teamName || "";
        const teamCode = s.team?.teamCode || "";
        const product = s.projectTitle || "";
        const leader =
          s.team?.members?.find((m) => m.role === "LEADER")?.user?.fullName || "";
        const institution =
          s.team?.members?.find((m) => m.role === "LEADER")?.user?.institution || "";

        const matchSearch =
          !q ||
          teamName.toLowerCase().includes(q) ||
          teamCode.toLowerCase().includes(q) ||
          product.toLowerCase().includes(q) ||
          leader.toLowerCase().includes(q) ||
          institution.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q);

        const assignedJudges = s.team?.competition?.judges || [];
        const evaluatedJudgeIds = new Set([
          ...(s.scores?.map((sc) => sc.judgeId).filter(Boolean) || []),
          ...(s.judgeEvaluations?.map((ev) => ev.judgeId).filter(Boolean) || []),
        ]);
        const scoredCount =
          assignedJudges.length > 0
            ? assignedJudges.filter((j) => evaluatedJudgeIds.has(j.id)).length
            : evaluatedJudgeIds.size;
        const totalJudges = assignedJudges.length;

        const isComplete = totalJudges > 0 ? scoredCount === totalJudges : scoredCount > 0;
        const isPartial = totalJudges > 0 ? scoredCount > 0 && scoredCount < totalJudges : false;
        const isPending = scoredCount === 0;

        let matchEval = true;
        if (evaluationFilter === "completed") {
          matchEval = isComplete;
        } else if (evaluationFilter === "partial") {
          matchEval = isPartial;
        } else if (evaluationFilter === "pending") {
          matchEval = isPending;
        } else if (evaluationFilter === "evaluated") {
          matchEval = scoredCount > 0;
        }

        return matchSearch && matchEval;
      })
      .sort((a, b) => {
        if (sortOption === "az") {
          return (a.team?.teamName || "").localeCompare(b.team?.teamName || "");
        }
        if (sortOption === "za") {
          return (b.team?.teamName || "").localeCompare(a.team?.teamName || "");
        }
        const da = new Date(a.submittedAt || 0).getTime();
        const db = new Date(b.submittedAt || 0).getTime();
        if (sortOption === "oldest") return da - db;
        return db - da;
      });
  }, [submissions, searchQuery, evaluationFilter, sortOption]);

  const { pageItems: paginatedRows } = paginateItems(filtered, currentPage, pageSize);

  const formatDateTime = (iso: string | null | undefined) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">
          {getGreeting(storeUser?.fullName, "Admin")}
        </h1>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Already Submitted</h2>
            <p className="text-xs text-white/40 mt-1">
              Daftar tim yang telah mengunggah proposal &amp; karya
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={competitionFilter}
              onChange={(e) => {
                setCompetitionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="cursor-pointer bg-transparent border border-white/20 rounded-full pl-4 pr-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-white/50"
            >
              <option value="all" className="bg-[#15161A]">
                All Competitions
              </option>
              {competitions.map((c) => (
                <option key={c.id || c.slug} value={c.slug} className="bg-[#15161A]">
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors ${
                showFilters ? "bg-white/10 text-white border-white/40" : "text-white/60"
              }`}
              title="Filter Lanjutan"
            >
              <Filter className="w-4 h-4" />
            </button>

            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Cari tim atau karya..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-4 pr-10 py-2 w-full text-sm rounded-full bg-white/[0.03] border-white/20 focus:border-white/50 text-white placeholder:text-white/40"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 mb-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                Status Evaluasi Juri
              </label>
              <select
                value={evaluationFilter}
                onChange={(e) => {
                  setEvaluationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#15161A] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="all">Semua Status Penilaian</option>
                <option value="completed">Lengkap (Semua Juri)</option>
                <option value="partial">Sebagian (Perlu Diingatkan)</option>
                <option value="pending">Belum Ada Nilai</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">
                Urutan
              </label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#15161A] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/50 cursor-pointer"
              >
                <option value="newest">Submit: Terbaru</option>
                <option value="oldest">Submit: Terlama</option>
                <option value="az">Nama Tim: A-Z</option>
                <option value="za">Nama Tim: Z-A</option>
              </select>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="relative lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10">
          <table className="block w-full text-sm text-left text-white/70 lg:table">
            <thead className="hidden text-xs text-white uppercase bg-white/[0.04] border-b border-white/10 lg:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-3.5 whitespace-nowrap">Tim</th>
                <th scope="col" className="px-6 py-3.5 min-w-[200px]">Karya</th>
                <th scope="col" className="px-6 py-3.5 whitespace-nowrap">Ketua Tim</th>
                <th scope="col" className="px-6 py-3.5 whitespace-nowrap">Waktu Submit</th>
                <th scope="col" className="px-6 py-3.5 text-center whitespace-nowrap">Status Penilaian</th>
                <th scope="col" className="px-6 py-3.5 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="block space-y-3 lg:table-row-group lg:space-y-0">
              {isLoading ? (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block px-6 py-12 text-center lg:table-cell">
                    <p className="text-sm text-white/60">Memuat data submission...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block px-6 py-12 text-center lg:table-cell">
                    <p className="text-sm text-rose-400">Gagal memuat daftar karya.</p>
                    <Button
                      size="sm"
                      onClick={() => refetch()}
                      className="mt-3 bg-white/10 hover:bg-white/20 text-white text-xs h-8 rounded-lg"
                    >
                      Coba Lagi
                    </Button>
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr className="block lg:table-row">
                  <td colSpan={6} className="block px-6 py-12 text-center lg:table-cell">
                    <Users className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-sm text-white/70">Tidak ada karya yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((item) => {
                  const leader = item.team?.members?.find((m) => m.role === "LEADER")?.user;
                  const assignedJudges = item.team?.competition?.judges || [];
                  const evaluatedJudgeIds = new Set([
                    ...(item.scores?.map((sc) => sc.judgeId).filter(Boolean) || []),
                    ...(item.judgeEvaluations?.map((ev) => ev.judgeId).filter(Boolean) || []),
                  ]);
                  const scoredCount =
                    assignedJudges.length > 0
                      ? assignedJudges.filter((j) => evaluatedJudgeIds.has(j.id)).length
                      : evaluatedJudgeIds.size;
                  const totalJudges = assignedJudges.length;
                  const pendingJudges = assignedJudges
                    .filter((j) => !evaluatedJudgeIds.has(j.id))
                    .map((j) => j.user?.fullName)
                    .filter(Boolean);
                  const isComplete = totalJudges > 0 ? scoredCount === totalJudges : scoredCount > 0;
                  const isPartial = totalJudges > 0 ? scoredCount > 0 && scoredCount < totalJudges : false;

                  return (
                    <tr
                      key={item.id}
                      className="block p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors lg:table-row lg:p-0 lg:border-b lg:border-white/5 lg:bg-transparent"
                    >
                      {/* Tim */}
                      <td className="flex items-start justify-between gap-3 pb-2 border-b border-white/10 lg:border-b-0 lg:table-cell lg:px-6 lg:py-4 whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden font-medium">Tim</span>
                        <div className="text-right lg:text-left">
                          <p className="font-semibold text-white">
                            {item.team?.teamName || "Tanpa Nama Tim"}
                          </p>
                          <p className="text-xs text-white/40 font-mono mt-0.5">
                            {item.team?.teamCode} - {item.team?.competition?.name || "Kompetisi"}
                          </p>
                        </div>
                      </td>

                      {/* Judul Karya */}
                      <td className="flex items-center justify-between gap-3 py-2 border-b border-white/10 lg:border-b-0 lg:table-cell lg:px-6 lg:py-4">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden font-medium">Karya</span>
                        <div className="min-w-0 max-w-sm">
                          <p className="font-medium text-white truncate" title={item.projectTitle}>
                            {item.projectTitle || "Untitled Product"}
                          </p>
                          <p className="text-xs text-white/50 truncate mt-0.5" title={item.description}>
                            {item.description || "-"}
                          </p>
                        </div>
                      </td>

                      {/* Ketua Tim */}
                      <td className="flex items-center justify-between gap-3 py-2 border-b border-white/10 lg:border-b-0 lg:table-cell lg:px-6 lg:py-4 whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden font-medium">Ketua</span>
                        <div>
                          <p className="text-white text-sm">{leader?.fullName || "-"}</p>
                          <p className="text-xs text-white/50">{leader?.institution || "-"}</p>
                        </div>
                      </td>

                      {/* Waktu Submit */}
                      <td className="flex items-center justify-between gap-3 py-2 border-b border-white/10 lg:border-b-0 lg:table-cell lg:px-6 lg:py-4 whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden font-medium">Submit</span>
                        <span className="text-xs text-white/70">
                          {formatDateTime(item.submittedAt)}
                        </span>
                      </td>

                      {/* Status Penilaian Juri */}
                      <td className="flex items-center justify-between gap-3 py-2 border-b border-white/10 lg:border-b-0 lg:table-cell lg:px-6 lg:py-4 lg:text-center whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden font-medium">Penilaian</span>
                        <div className="flex flex-col items-end lg:items-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${
                              isComplete
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : isPartial
                                ? "border-white/10 bg-white/[0.04] text-white/80"
                                : "border-white/10 bg-white/[0.02] text-white/40"
                            }`}
                          >
                            {isComplete
                              ? `Lengkap (${scoredCount}/${totalJudges})`
                              : isPartial
                              ? `${scoredCount}/${totalJudges} Juri`
                              : `0/${totalJudges || 3} Dinilai`}
                          </span>
                          {pendingJudges.length > 0 && totalJudges > 0 && isPartial ? (
                            <span
                              className="text-[10px] text-white/40 mt-1 max-w-[170px] truncate"
                              title={`Belum: ${pendingJudges.join(", ")}`}
                            >
                              Belum: {pendingJudges.join(", ")}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="flex items-center justify-between gap-3 pt-2 lg:pt-0 lg:table-cell lg:px-6 lg:py-4 lg:text-center whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden font-medium">Aksi</span>
                        <Link
                          href={`/admin/submissions/${item.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/[0.04] text-xs font-medium text-white hover:bg-white/10 hover:border-white/40 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-white/70" />
                          <span>Detail Karya</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          totalItems={filtered.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          suffixLabel="karya"
        />
      </div>
    </div>
  );
}
