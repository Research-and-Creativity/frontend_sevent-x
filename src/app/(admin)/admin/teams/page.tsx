"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  docStatusInfo,
  payStatusInfo,
  teamLeaderName,
  formatRegistrationDate,
} from "@/lib/admin-team-status";
import { getErrorMessage } from "@/lib/errors";
import { Team } from "@/types/api";
import { useCompetitions } from "@/hooks/use-peserta";
import { useUpdatePaymentProofStatus } from "@/hooks/use-admin";

import {
  AdminApproveModal,
  AdminRejectModal,
} from "@/components/admin/admin-review-modals";

export default function AdminTeamsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");
  const [isManualReloading, setIsManualReloading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [docFilter, setDocFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [timeSort, setTimeSort] = useState("newest");
  const [nameSort, setNameSort] = useState("az");

  // 1. Fetch competitions list for filter dropdown
  const { data: competitions = [] } = useCompetitions();

  // 2. Fetch teams list from GET /api/teams
  const {
    data: teams = [],
    isLoading: isTeamsLoading,
    isFetching: isTeamsFetching,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useQuery<Team[]>({
    queryKey: ["adminTeams", selectedCompSlug],
    queryFn: async () => {
      const res = await apiClient.get("/api/teams", {
        params: selectedCompSlug
          ? { competitionSlug: selectedCompSlug }
          : undefined,
      });
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
  });

  const updatePaymentStatusMutation = useUpdatePaymentProofStatus();

  const handleReloadData = async () => {
    setIsManualReloading(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["adminTeams"] });
      await refetchTeams();
      toast.success("Data tim berhasil dimuat ulang!");
    } catch {
      toast.error("Gagal memuat ulang data tim.");
    } finally {
      setTimeout(() => setIsManualReloading(false), 400);
    }
  };

  // Modal State for Approve & Reject
  const [approveModalTeam, setApproveModalTeam] = useState<Team | null>(null);
  const [rejectModalTeam, setRejectModalTeam] = useState<Team | null>(null);

  const handleOpenApproveModal = (team: Team) => {
    setApproveModalTeam(team);
  };

  const handleConfirmApprove = async () => {
    if (!approveModalTeam) return;

    try {
      await updatePaymentStatusMutation.mutateAsync({
        teamId: approveModalTeam.id,
        status: "APPROVE",
      });
      toast.success(
        `Bukti pembayaran tim "${approveModalTeam.teamName}" berhasil disetujui!`
      );
      setApproveModalTeam(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyetujui bukti pembayaran."));
    }
  };

  const handleOpenRejectModal = (team: Team) => {
    setRejectModalTeam(team);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectModalTeam) return;

    try {
      await updatePaymentStatusMutation.mutateAsync({
        teamId: rejectModalTeam.id,
        status: "REJECT",
        reason: reason.trim(),
      });
      toast.success(
        `Bukti pembayaran tim "${rejectModalTeam.teamName}" berhasil ditolak.`
      );
      setRejectModalTeam(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menolak bukti pembayaran."));
    }
  };

  const filteredTeams = teams
    .filter((t) => {
      const leader = teamLeaderName(t);
      const matchSearch =
        t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchComp =
        !selectedCompSlug || t.competition?.slug === selectedCompSlug;
      return matchSearch && matchComp;
    })
    .filter((t) => {
      if (docFilter === "all") return true;
      const s = docStatusInfo(t).label.toLowerCase();
      if (docFilter === "approved") return s === "approved";
      if (docFilter === "revise") return s === "revise";
      if (docFilter === "review") return s === "need review";
      return true;
    })
    .filter((t) => {
      if (payFilter === "all") return true;
      const s = payStatusInfo(t).label.toLowerCase();
      if (payFilter === "paid") return s === "paid";
      if (payFilter === "not_paid") return s === "not paid";
      if (payFilter === "review") return s === "need review";
      return true;
    })
    .sort((a, b) => {
      if (nameSort === "az") return a.teamName.localeCompare(b.teamName);
      if (nameSort === "za") return b.teamName.localeCompare(a.teamName);
      return 0;
    })
    .sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      if (timeSort === "newest") return db - da;
      if (timeSort === "oldest") return da - db;
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Good Morning, Admin</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Registered Team</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedCompSlug}
              onChange={(e) => setSelectedCompSlug(e.target.value)}
              className="cursor-pointer bg-transparent border border-white/20 rounded-full pl-4 pr-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-white/50"
            >
              <option value="" className="bg-[#15161A]">
                All Competitions
              </option>
              {competitions.map((c) => (
                <option key={c.id || c.slug} value={c.slug} className="bg-[#15161A]">
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleReloadData}
              disabled={isManualReloading || isTeamsFetching}
              title="Muat ulang data"
              className="cursor-pointer w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/5 disabled:opacity-40"
            >
              <RefreshCw
                className={`h-4 w-4 ${isManualReloading || isTeamsFetching ? "animate-spin" : ""}`}
              />
            </button>
            <button onClick={() => setShowFilters(!showFilters)} className="cursor-pointer w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/5" title="Filter">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/></svg>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-transparent border border-white/20 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-white/10 rounded-xl bg-white/[0.02]">
            <select value={docFilter} onChange={(e) => setDocFilter(e.target.value)} className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80">
              <option value="all" className="bg-[#15161A]">Status Document: All</option>
              <option value="review" className="bg-[#15161A]">Need Review</option>
              <option value="revise" className="bg-[#15161A]">Revise</option>
              <option value="approved" className="bg-[#15161A]">Approved</option>
            </select>
            <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80">
              <option value="all" className="bg-[#15161A]">Status Payment: All</option>
              <option value="review" className="bg-[#15161A]">Need Review</option>
              <option value="not_paid" className="bg-[#15161A]">Not Paid</option>
              <option value="paid" className="bg-[#15161A]">Paid</option>
            </select>
            <select value={timeSort} onChange={(e) => setTimeSort(e.target.value)} className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80">
              <option value="newest" className="bg-[#15161A]">Time Regist: Newest</option>
              <option value="oldest" className="bg-[#15161A]">Time Regist: Oldest</option>
            </select>
            <select value={nameSort} onChange={(e) => setNameSort(e.target.value)} className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80">
              <option value="az" className="bg-[#15161A]">Team Name: A-Z</option>
              <option value="za" className="bg-[#15161A]">Team Name: Z-A</option>
            </select>
          </div>
        </div>

        {isTeamsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
          </div>
        ) : isTeamsError ? (
          <div className="p-8 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Gagal memuat data tim</p>
            <Button size="sm" onClick={() => refetchTeams()} className="bg-primary text-white text-xs h-8 rounded-lg">Coba Lagi</Button>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-white/5 border border-dashed border-white/10 rounded-xl">
            <Users className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Belum ada data tim yang terdaftar</p>
            <p className="text-xs text-white/40">{searchQuery || selectedCompSlug ? "Tidak ada tim yang cocok dengan filter pencarian." : "Tim yang dibuat oleh peserta akan muncul di antrean ini."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
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
              <tbody className="divide-y divide-white/5">
                {filteredTeams.map((t) => {
                  const teamName = t.teamName;
                  const leader = teamLeaderName(t);
                  const registeredAt = formatRegistrationDate(t.createdAt);
                  const doc = docStatusInfo(t);
                  const pay = payStatusInfo(t);
                  // Tanpa bukti pembayaran, BE akan menolak aksi approve/reject.
                  const hasProof = Boolean(t.paymentProof);
                  const isBusy = updatePaymentStatusMutation.isPending;
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 pr-4">{teamName}</td>
                      <td className="py-5 pr-4">{leader}</td>
                      <td className="py-5 pr-4">{registeredAt}</td>
                      <td className="py-5 pr-4"><span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${doc.cls}`}>{doc.label}</span></td>
                      <td className="py-5 pr-4"><span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${pay.cls}`}>{pay.label}</span></td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleOpenApproveModal(t)}
                            disabled={!hasProof || pay.label === "Paid" || isBusy}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3CB578]/40 px-3 py-1.5 text-xs font-semibold text-[#63CFA0] transition-colors hover:bg-[#3CB578]/10 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              !hasProof
                                ? "Belum ada bukti pembayaran"
                                : pay.label === "Paid"
                                ? "Pembayaran sudah disetujui"
                                : "Setujui bukti pembayaran"
                            }
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(t)}
                            disabled={!hasProof || isBusy}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E55353]/40 px-3 py-1.5 text-xs font-semibold text-[#F08080] transition-colors hover:bg-[#E55353]/10 disabled:cursor-not-allowed disabled:opacity-40"
                            title={hasProof ? "Tolak bukti pembayaran" : "Belum ada bukti pembayaran"}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                          <Link href={`/admin/teams/${t.id}`} className="text-white/60 hover:text-white" title="Lihat detail tim">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between pt-5 text-xs text-white/50">
          <span>Showing {filteredTeams.length} data out of {teams.length}</span>
          <div className="flex items-center gap-3">
            <span>Show</span>
            <select className="bg-transparent border border-white/20 rounded-lg px-2 py-1"><option>10</option></select>
            <span>data per page</span>
            <button className="border border-white/20 rounded-lg p-1.5"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button className="border border-white/20 rounded-lg p-1.5"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
        </div>
      </div>

      {approveModalTeam && (() => {
        const pObj = approveModalTeam.paymentProof;
        const stUpper = (pObj?.status || approveModalTeam.status || "").toUpperCase();
        const isPrevRejected = stUpper === "REJECT" || stUpper === "REJECTED";
        const prevReason =
          pObj?.rejectionReason || approveModalTeam.rejectionReason || null;

        return (
          <AdminApproveModal
            isOpen={Boolean(approveModalTeam)}
            onClose={() => setApproveModalTeam(null)}
            onConfirm={handleConfirmApprove}
            isLoading={updatePaymentStatusMutation.isPending}
            title={`Approve ${approveModalTeam.teamName}?`}
            targetName={approveModalTeam.teamName}
            targetDetail={`Team ID: #${approveModalTeam.id} • ${approveModalTeam.competition?.name || "Kompetisi"}`}
            contextMessage="Bukti pembayaran tim akan ditandai terverifikasi dan status tim akan disetujui."
            isPreviouslyRejected={isPrevRejected}
            previousRejectionReason={prevReason}
            confirmButtonText="Ya, Approve"
          />
        );
      })()}

      {/* REJECT PAYMENT PROOF CONFIRMATION MODAL */}
      {rejectModalTeam && (() => {
        const pObj = rejectModalTeam.paymentProof;
        const stUpper = (pObj?.status || rejectModalTeam.status || "").toUpperCase();
        const isPrevApproved =
          stUpper === "APPROVE" || stUpper === "APPROVED" || stUpper === "VERIFIED";

        return (
          <AdminRejectModal
            isOpen={Boolean(rejectModalTeam)}
            onClose={() => setRejectModalTeam(null)}
            onConfirm={handleConfirmReject}
            isLoading={updatePaymentStatusMutation.isPending}
            title="Tolak Bukti Pembayaran"
            targetName={rejectModalTeam.teamName}
            targetDetail={`Team ID: #${rejectModalTeam.id} • ${rejectModalTeam.competition?.name || "Kompetisi"}`}
            isPreviouslyApproved={isPrevApproved}
            placeholder="Contoh: Bukti transfer tidak sesuai nominal, foto buram, rekening palsu, dll"
            confirmButtonText="Tolak Pembayaran"
          />
        );
      })()}
    </div>
  );
}
