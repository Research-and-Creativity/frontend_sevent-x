"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { useAdminOverview } from "@/hooks/use-admin";
import { useCompetitions } from "@/hooks/use-peserta";
import {
  docStatusInfo,
  payStatusInfo,
  teamLeaderName,
  formatRegistrationDate,
} from "@/lib/admin-team-status";
import { Team } from "@/types/api";

const PAGE_SIZE = 10;

export default function AdminOverviewDashboardPage() {
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: overview } = useAdminOverview();
  const { data: competitions = [] } = useCompetitions();

  const {
    data: teams = [],
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useQuery<Team[]>({
    queryKey: ["adminTeams", ""],
    queryFn: async () => {
      const res = await apiClient.get("/api/teams");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
  });

  const counts = useMemo(() => {
    let needReview = 0;
    let revise = 0;
    let approvedDoc = 0;
    let paid = 0;
    for (const t of teams) {
      const doc = docStatusInfo(t).label;
      const pay = payStatusInfo(t).label;
      if (doc === "Need Review") needReview += 1;
      if (doc === "Revise") revise += 1;
      if (doc === "Approved") approvedDoc += 1;
      if (pay === "Paid") paid += 1;
    }
    return { needReview, revise, approvedDoc, paid };
  }, [teams]);

  const deadline = useMemo(() => {
    const times = competitions
      .flatMap((c) => c.timelines ?? [])
      .filter((t) => t.phase === "REGISTRATION")
      .map((t) => new Date(t.endDate).getTime())
      .filter((ts) => !Number.isNaN(ts));
    if (times.length === 0) return null;
    const upcoming = times.filter((ts) => ts > now).sort((a, b) => a - b);
    return (upcoming[0] ?? Math.max(...times)) as number;
  }, [competitions, now]);

  const remaining = useMemo(() => {
    if (!deadline) return null;
    const diff = Math.max(0, deadline - now);
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    return `${String(d).padStart(2, "0")}d : ${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m`;
  }, [deadline, now]);

  const totalTeams = overview?.totalTeams ?? teams.length;
  const totalPages = Math.max(1, Math.ceil(teams.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = teams.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const statusCards = [
    { label: "NEED REVIEW", value: counts.needReview },
    { label: "NEED REVISE", value: counts.revise },
    { label: "APPROVED PROFILE", value: counts.approvedDoc },
    { label: "APPROVED PAYMENT", value: counts.paid },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h1 className="font-display text-3xl font-bold">Good Morning, Admin</h1>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">
              REGISTERED TEAM
            </span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">{totalTeams}</p>
          <p className="text-xs text-white/50 mt-2">
            {overview?.totalPeserta ?? 0} peserta terdaftar
          </p>
        </div>
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">
              TIME REMAINING
            </span>
            <Clock className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">{remaining ?? "—"}</p>
          <p className="text-xs text-white/50 mt-2">
            {deadline ? "Registration" : "No active registration"}
          </p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((c) => {
          const percent = teams.length
            ? Math.round((c.value / teams.length) * 100)
            : 0;
          return (
            <div
              key={c.label}
              className="bg-[#15161A] border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] tracking-widest text-white/60">
                  {c.label}
                </span>
                <Users className="w-5 h-5 text-white/70" />
              </div>
              <p className="font-display text-4xl font-bold text-[#A9B7FF]">
                {c.value}{" "}
                <span className="text-sm text-white/40 font-normal">
                  / {teams.length}
                </span>
              </p>
              <div className="mt-4 h-1.5 rounded-full bg-[#2A3568] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7D8CFF]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Registered Team table */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-bold mb-6">
          Registered Team
        </h2>

        {isTeamsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
          </div>
        ) : isTeamsError ? (
          <div className="p-8 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              Gagal memuat data tim
            </p>
          </div>
        ) : teams.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-white/5 border border-dashed border-white/10 rounded-xl">
            <Users className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">
              Belum ada data tim yang terdaftar
            </p>
            <p className="text-xs text-white/40">
              Tim yang dibuat oleh peserta akan muncul di antrean ini.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/70 border-b border-white/10">
                    <th className="pb-3 font-semibold">Team</th>
                    <th className="pb-3 font-semibold">Team Leader Name</th>
                    <th className="pb-3 font-semibold">Time Registration</th>
                    <th className="pb-3 font-semibold">Status Document</th>
                    <th className="pb-3 font-semibold">Status Payment</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((t) => {
                    const doc = docStatusInfo(t);
                    const pay = payStatusInfo(t);
                    return (
                      <tr key={t.id} className="border-b border-white/5">
                        <td className="py-4">{t.teamName}</td>
                        <td className="py-4">{teamLeaderName(t)}</td>
                        <td className="py-4">
                          {formatRegistrationDate(t.createdAt)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${doc.cls}`}
                          >
                            {doc.label}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${pay.cls}`}
                          >
                            {pay.label}
                          </span>
                        </td>
                        <td className="py-4">
                          <Link
                            href={`/admin/teams/${t.id}`}
                            className="text-white/60 hover:text-white"
                            title="Lihat detail tim"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between pt-5 text-xs text-white/50">
              <span>
                Showing {pageRows.length} data out of {teams.length}
              </span>
              <div className="flex items-center gap-3">
                <span>
                  Page {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage <= 1}
                  className="border border-white/20 rounded-lg p-1.5 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage >= totalPages}
                  className="border border-white/20 rounded-lg p-1.5 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
