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
import { useJudgeSubmissions } from "@/hooks/use-juri";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [nameSort, setNameSort] = useState("az");

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
      .map((s: JudgeSubmissionItem) => ({
        sub: s,
        team: s.team?.teamName ?? "-",
        product: s.projectTitle ?? "-",
        leader: leaderName(s),
        status: submissionStatus(s),
      }))
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
        if (nameSort === "az") return a.team.localeCompare(b.team);
        if (nameSort === "za") return b.team.localeCompare(a.team);
        return 0;
      })
      .sort((a, b) => {
        const da = new Date(a.sub.submittedAt).getTime();
        const db = new Date(b.sub.submittedAt).getTime();
        if (dateSort === "newest") return db - da;
        if (dateSort === "oldest") return da - db;
        return 0;
      });
  }, [scoped, searchQuery, statusFilter, nameSort, dateSort]);

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
        <div className="flex items-center gap-2 justify-between mb-6">
          <h2 className="relative font-display text-2xl font-bold tracking-tight text-white">
            List of Participant
          </h2>

          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors ${
                showFilters ? "bg-white/10 text-white" : "text-text-secondary"
              }`}
              title="Filter"
            >
              <Filter className="w-4 h-4" />
            </button>
            <div className="relative w-64 sm:w-72">
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#7D8CFF]/60 cursor-pointer"
            >
              <option value="all" className="bg-[#15161A]">By Status: All</option>
              <option value="in review" className="bg-[#15161A]">In Review</option>
              <option value="judged" className="bg-[#15161A]">Judged</option>
            </select>
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#7D8CFF]/60 cursor-pointer"
            >
              <option value="newest" className="bg-[#15161A]">Date Sort: Newest</option>
              <option value="oldest" className="bg-[#15161A]">Date Sort: Oldest</option>
            </select>
            <select
              value={nameSort}
              onChange={(e) => setNameSort(e.target.value)}
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#7D8CFF]/60 cursor-pointer"
            >
              <option value="az" className="bg-[#15161A]">Team Name: A-Z</option>
              <option value="za" className="bg-[#15161A]">Team Name: Z-A</option>
            </select>
          </div>
        </div>

        <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-white/[0.015]">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-white uppercase bg-white/[0.04] border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-3">Team</th>
                <th scope="col" className="px-6 py-3">Product Name</th>
                <th scope="col" className="px-6 py-3">Team Leader Name</th>
                <th scope="col" className="px-6 py-3">Submitted Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-white/70">Memuat data karya...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                filtered.map((row) => (
                  <tr
                    key={row.sub.id}
                    className="bg-transparent border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {row.team}
                    </td>
                    <td className="px-6 py-4">{row.product}</td>
                    <td className="px-6 py-4">{row.leader}</td>
                    <td className="px-6 py-4">
                      {formatSubmittedDate(row.sub.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-transparent border ${statusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`${basePath}/${row.sub.id}`}
                        className="inline-flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 rounded-md p-2 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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
            Showing <span className="font-semibold text-white">{filtered.length}</span>{" "}
            data out of <span className="font-semibold text-white">{scoped.length}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Show</span>
              <Select defaultValue="10" disabled>
                <SelectTrigger className="w-[80px] text-sm bg-white/[0.03] border-white/15 backdrop-blur-md opacity-60">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="bg-[#0B0C12]/80 backdrop-blur-xl border border-white/10 text-white">
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-text-secondary">data per page</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled className={`${glassControl} opacity-40`}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" disabled className={`${glassControl} opacity-40`}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
