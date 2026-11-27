"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJudgeSubmissions, useJudgeRankings } from "@/hooks/use-juri";
import type { JudgeSubmissionItem } from "@/hooks/use-juri";
import {
  leaderName,
  submissionStatus,
  formatSubmittedDate,
  statusBadge,
} from "@/lib/juri-submission";

const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

const glassControl =
  "bg-white/[0.03] border-white/15 backdrop-blur-md " +
  "hover:bg-white/10 text-white/70 hover:text-white transition-colors";

interface SubmissionListProps {
  /** Hanya tampilkan karya yang belum / sudah dinilai juri ini. */
  scope: "pending" | "judged";
  title: string;
  subtitle: string;
  basePath: string;
}

export function SubmissionList({ scope, title, subtitle, basePath }: SubmissionListProps) {
  const { data: submissions = [], isLoading, isError, refetch } =
    useJudgeSubmissions();
  const { data: rankingsData } = useJudgeRankings();
  const rankings = useMemo(() => rankingsData?.rankings ?? [], [rankingsData?.rankings]);
  const expectedJudgeCount = rankingsData?.expectedJudgeCount;

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState(() => (scope === "judged" ? "score-desc" : "newest"));
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const scoped = useMemo(
    () =>
      submissions.filter((s) =>
        scope === "pending"
          ? !s.evaluationStatus?.isEvaluated
          : s.evaluationStatus?.isEvaluated
      ),
    [submissions, scope]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scoped
      .map((s: JudgeSubmissionItem) => {
        const rankingItem = rankings.find(
          (r) => r.submissionId === s.id || r.teamId === s.team?.id
        );
        const myScore = s.evaluationStatus?.totalScore ?? 0;
        const avgScore = rankingItem ? rankingItem.finalScore : myScore;
        const judgeCount =
          rankingItem?.judgeBreakdown?.length ??
          (s.evaluationStatus?.isEvaluated ? 1 : 0);

        return {
          sub: s,
          team: s.team?.teamName ?? "-",
          product: s.projectTitle ?? "-",
          leader: leaderName(s),
          status: submissionStatus(s),
          score: myScore,
          averageScore: avgScore,
          judgeCount,
          isFullyScored: rankingItem?.isFullyScored ?? false,
        };
      })
      .filter((row) => {
        const matchSearch =
          row.team.toLowerCase().includes(q) ||
          row.product.toLowerCase().includes(q) ||
          row.leader.toLowerCase().includes(q) ||
          row.sub.id.toLowerCase().includes(q);
        const matchStatus =
          statusFilter === "all" ||
          row.status.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortOption === "score-desc") {
          const diff = b.averageScore - a.averageScore;
          if (diff !== 0) return diff;
          const da = new Date(a.sub.submittedAt).getTime();
          const db = new Date(b.sub.submittedAt).getTime();
          return da - db; // tie breaker submit tercepat
        }
        if (sortOption === "score-asc") {
          const diff = a.averageScore - b.averageScore;
          if (diff !== 0) return diff;
          const da = new Date(a.sub.submittedAt).getTime();
          const db = new Date(b.sub.submittedAt).getTime();
          return da - db;
        }
        if (sortOption === "az") return a.team.localeCompare(b.team);
        if (sortOption === "za") return b.team.localeCompare(a.team);
        const da = new Date(a.sub.submittedAt).getTime();
        const db = new Date(b.sub.submittedAt).getTime();
        if (sortOption === "newest") return db - da;
        if (sortOption === "oldest") return da - db;
        return 0;
      });
  }, [scoped, searchQuery, statusFilter, sortOption, rankings]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const paginatedRows = useMemo(
    () => filtered.slice(startIndex, startIndex + pageSize),
    [filtered, startIndex, pageSize]
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };
  const handlePageSizeChange = (val: string | null) => {
    if (val) {
      setPageSize(Number(val));
      setCurrentPage(1);
    }
  };

  return (
    <div className="relative isolate space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      <div className={`${glass} p-6 lg:p-8 flex flex-col justify-center`}>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">
          {title}
        </h1>
        <p className="text-text-secondary text-sm">{subtitle}</p>
      </div>

      <div className={`${glass} p-6 lg:p-8`}>
        <div className="flex flex-wrap items-center gap-3 justify-between mb-6">
          <h2 className="relative font-display text-2xl font-bold tracking-tight text-white">
            List of Participant
          </h2>

          <div className="relative flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors ${
                showFilters ? "bg-white/10 text-white" : "text-text-secondary"
              }`}
              title="Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
            <div className="relative w-full sm:w-64 lg:w-72">
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-4 pr-10 py-2 w-full text-sm rounded-full bg-transparent border-white/20 focus:border-[#7D8CFF]/60 text-white placeholder:text-white/40"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          </div>
        </div>

        <div
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            {scope === "pending" && (
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#7D8CFF]/60 cursor-pointer"
              >
                <option value="all" className="bg-[#15161A]">By Status: All</option>
                <option value="in review" className="bg-[#15161A]">In Review</option>
                <option value="judged" className="bg-[#15161A]">Judged</option>
              </select>
            )}
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#7D8CFF]/60 cursor-pointer"
            >
              {scope === "judged" && (
                <>
                  <option value="score-desc" className="bg-[#15161A]">Final Score: Highest</option>
                  <option value="score-asc" className="bg-[#15161A]">Final Score: Lowest</option>
                </>
              )}
              <option value="newest" className="bg-[#15161A]">Date: Newest</option>
              <option value="oldest" className="bg-[#15161A]">Date: Oldest</option>
              <option value="az" className="bg-[#15161A]">Team Name: A-Z</option>
              <option value="za" className="bg-[#15161A]">Team Name: Z-A</option>
            </select>
          </div>
        </div>

        <div className="relative lg:overflow-x-auto lg:rounded-xl lg:border lg:border-white/10 lg:bg-white/[0.015]">
          <table className="block w-full text-sm text-left text-text-secondary lg:table">
            <thead className="hidden text-xs text-white uppercase bg-white/[0.04] border-b border-white/10 lg:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Team</th>
                <th scope="col" className="px-6 py-3 min-w-[200px]">Product Name</th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Team Leader Name</th>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Submitted Date</th>
                {scope === "judged" ? (
                  <>
                    <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                      <span className="block">Your Score</span>
                      <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-white/50">
                        Nilai Anda (0–100)
                      </span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">
                      <span className="block">Final Score</span>
                      <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-white/50">
                        Rata-rata semua juri
                      </span>
                    </th>
                  </>
                ) : (
                  <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">Status</th>
                )}
                <th scope="col" className="px-6 py-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="block space-y-3 lg:table-row-group lg:space-y-0">
              {isLoading ? (
                <tr className="block lg:table-row">
                  <td colSpan={scope === "judged" ? 7 : 6} className="block px-6 py-12 text-center lg:table-cell">
                    <p className="text-sm text-white/70">Memuat data karya...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="block lg:table-row">
                  <td colSpan={scope === "judged" ? 7 : 6} className="block px-6 py-12 text-center lg:table-cell">
                    <p className="text-sm font-semibold text-rose-400">
                      Gagal memuat daftar karya
                    </p>
                    <Button
                      size="sm"
                      onClick={() => refetch()}
                      className="mt-3 bg-primary text-white text-xs h-8 rounded-lg"
                    >
                      Coba Lagi
                    </Button>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr className="block lg:table-row">
                  <td colSpan={scope === "judged" ? 7 : 6} className="block px-6 py-12 text-center lg:table-cell">
                    <Users className="w-8 h-8 text-white/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">
                      {submissions.length === 0
                        ? "Belum ada karya yang masuk"
                        : "Tidak ada peserta yang cocok"}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {submissions.length === 0
                        ? "Karya yang dikirim peserta akan muncul di sini."
                        : "Coba ubah kata kunci pencarian atau filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.sub.id}
                    className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-white/5 lg:bg-transparent lg:p-0 lg:space-y-0 lg:last:border-b-0 lg:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="flex items-start justify-between gap-3 py-0.5 font-medium text-white lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                      <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Team</span>
                      <span className="min-w-0 text-right lg:text-left break-words">{row.team}</span>
                    </td>
                    <td className="block py-0.5 text-white/90 lg:table-cell lg:px-6 lg:py-4 lg:min-w-[200px] lg:max-w-[360px]">
                      <span className="text-xs text-white/50 block mb-0.5 lg:hidden">Product Name</span>
                      <span className="break-words">{row.product}</span>
                    </td>
                    <td className="flex items-start justify-between gap-3 py-0.5 text-white/80 lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                      <span className="text-xs text-white/50 shrink-0 lg:hidden">Leader</span>
                      <span className="min-w-0 text-right lg:text-left break-words">{row.leader}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 py-0.5 text-white/70 lg:table-cell lg:px-6 lg:py-4 lg:whitespace-nowrap">
                      <span className="text-xs text-white/50 shrink-0 lg:hidden">Submitted</span>
                      <span>{formatSubmittedDate(row.sub.submittedAt)}</span>
                    </td>
                    {scope === "judged" ? (
                      <>
                        <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                          <span className="text-xs text-white/50 shrink-0 lg:hidden">Your Score</span>
                          <span className="font-semibold text-white/90 tabular-nums text-sm">
                            {row.score.toFixed(2)}
                          </span>
                        </td>
                        <td className="flex items-start justify-between gap-3 py-0.5 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                          <span className="text-xs text-white/50 shrink-0 lg:hidden">Final Score</span>
                          <div className="text-right lg:text-center">
                            <span className="font-bold text-[#7D8CFF] tabular-nums text-sm">
                              {row.averageScore.toFixed(2)}
                            </span>
                            <span
                              className={`block text-[11px] mt-0.5 ${
                                row.isFullyScored ? "text-emerald-400" : "text-white/50"
                              }`}
                            >
                              {expectedJudgeCount
                                ? `${row.judgeCount}/${expectedJudgeCount} juri`
                                : `${row.judgeCount} juri`}{" "}
                              ({row.isFullyScored ? "Lengkap" : "Belum lengkap"})
                            </span>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                        <span className="text-xs text-white/50 shrink-0 lg:hidden">Status</span>
                        <span
                          className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    )}
                    <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 lg:border-t-0 lg:table-cell lg:px-6 lg:py-4 lg:text-center lg:whitespace-nowrap">
                      <span className="text-xs text-white/50 lg:hidden">Action</span>
                      <Link
                        href={`${basePath}/${row.sub.id}`}
                        className="inline-flex items-center justify-center gap-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-medium lg:hidden">Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="relative flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-4 sm:mb-0">
            Showing{" "}
            <span className="font-semibold text-white">
              {totalItems === 0
                ? 0
                : `${startIndex + 1} - ${Math.min(startIndex + pageSize, totalItems)}`}
            </span>{" "}
            data out of <span className="font-semibold text-white">{totalItems}</span>
            {scoped.length !== totalItems && (
              <span className="text-xs text-white/50">({scoped.length} total)</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Show</span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[80px] text-sm bg-white/[0.03] border-white/15 backdrop-blur-md text-white hover:bg-white/10 cursor-pointer">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0C12] border border-white/10 text-white z-50">
                  <SelectItem value="5" className="cursor-pointer hover:bg-white/10 text-white">5</SelectItem>
                  <SelectItem value="10" className="cursor-pointer hover:bg-white/10 text-white">10</SelectItem>
                  <SelectItem value="25" className="cursor-pointer hover:bg-white/10 text-white">25</SelectItem>
                  <SelectItem value="50" className="cursor-pointer hover:bg-white/10 text-white">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-text-secondary">data per page</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`${glassControl} disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-white/70 px-1 font-medium whitespace-nowrap">
                {safeCurrentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`${glassControl} disabled:opacity-30 disabled:pointer-events-none cursor-pointer`}
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
