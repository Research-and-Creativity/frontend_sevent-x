"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Team } from "@/types/api";
import { DUMMY_TEAMS } from "@/lib/dummy-teams";
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

  // 1. Fetch competitions list for filter dropdown
  const { data: competitions = [] } = useCompetitions();

  // TEMPORARY: use dummy data until API integration is finalized
  const teams = DUMMY_TEAMS as any as Team[];
  const isTeamsLoading = false;
  const isTeamsFetching = false;
  const isTeamsError = false;
  const refetchTeams = () => Promise.resolve();

  // Original API fetch (kept for later):
  // const { data: teams = [], isLoading: isTeamsLoading, isFetching: isTeamsFetching, isError: isTeamsError, refetch: refetchTeams } = useQuery<Team[]>({
  //   queryKey: ["adminTeams", selectedCompSlug],
  //   queryFn: async () => {
  //     const res = await apiClient.get("/api/teams", { params: selectedCompSlug ? { competitionSlug: selectedCompSlug } : undefined });
  //     const list = res.data?.data || res.data;
  //     return Array.isArray(list) ? list : [];
  //   },
  // });

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
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menyetujui bukti pembayaran."
      );
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
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menolak bukti pembayaran."
      );
    }
  };

  const filteredTeams = teams.filter((t) => {
    const name = t.teamName || (t as any).name || "";
    const id = t.id || "";
    const leader =
      t.members?.find((m) => m.role === "LEADER")?.user?.fullName ||
      (t as any).leader ||
      "";
    const compSlug =
      t.competition?.slug || (t as any).competitionSlug || (t as any).slug || "";

    const matchSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchComp = !selectedCompSlug || compSlug === selectedCompSlug;
    return matchSearch && matchComp;
  });

  const paymentStatusLabel = (t: Team) => {
    const created = (t as any).createdAt || (t as any).registrationDate;
    if (!created) return "-";
    try { return new Date(created).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return String(created); }
  };

  const docStatusInfo = (t: Team) => {
    const s = ((t as any).documentStatus || (t as any).status || "").toString().toUpperCase();
    if (s.includes("APPROV") || s.includes("VERIF")) return { label: "Approved", cls: "border-[#3CB578] text-[#63CFA0]" };
    if (s.includes("REJECT") || s.includes("REVISE")) return { label: "Revise", cls: "border-[#E5B33C] text-[#F0C969]" };
    return { label: "Need Review", cls: "border-[#5B8DEF] text-[#7FA7F5]" };
  };

  const payStatusInfo = (t: Team) => {
    const pObj = t.paymentProof || (t as any).documents?.find((d: any) => d.type === "PAYMENT_PROOF" || d.type === "PAYMENT");
    const s = (pObj?.status || (t as any).paymentStatus || "").toString().toUpperCase();
    if (s.includes("APPROV") || s.includes("PAID") || s.includes("VERIF")) return { label: "Paid", cls: "border-[#3CB578] text-[#63CFA0]" };
    if (s.includes("REJECT") || s.includes("UNPAID") || s === "NOT PAID") return { label: "Not Paid", cls: "border-[#E55353] text-[#F08080]" };
    return { label: "Need Review", cls: "border-[#5B8DEF] text-[#7FA7F5]" };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Good Morning, Admin</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Registered Team</h2>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/5" title="Filter">
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
                  const teamName = t.teamName || (t as any).name || "Unnamed Team";
                  const leader = t.members?.find((m) => m.role === "LEADER")?.user?.fullName || (t as any).leader || "-";
                  const rawStatus = paymentStatusLabel(t);
                  const doc = docStatusInfo(t);
                  const pay = payStatusInfo(t);
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-5 pr-4">{teamName}</td>
                      <td className="py-5 pr-4">{leader}</td>
                      <td className="py-5 pr-4">{rawStatus}</td>
                      <td className="py-5 pr-4"><span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${doc.cls}`}>{doc.label}</span></td>
                      <td className="py-5 pr-4"><span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${pay.cls}`}>{pay.label}</span></td>
                      <td className="py-5">
                        <Link href={`/admin/teams/${t.id}`} className="text-white/60 hover:text-white"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></Link>
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
        const pObj =
          approveModalTeam.paymentProof ||
          (approveModalTeam as any).documents?.find(
            (d: any) => d.type === "PAYMENT_PROOF" || d.type === "PAYMENT"
          );
        const stUpper = (pObj?.status || approveModalTeam.status || "").toUpperCase();
        const isPrevRejected = stUpper === "REJECT" || stUpper === "REJECTED";
        const prevReason =
          pObj?.rejectionReason || (approveModalTeam as any).rejectionReason || null;

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
        const pObj =
          rejectModalTeam.paymentProof ||
          (rejectModalTeam as any).documents?.find(
            (d: any) => d.type === "PAYMENT_PROOF" || d.type === "PAYMENT"
          );
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
