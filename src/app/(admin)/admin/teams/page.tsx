"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
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
import { useCompetitions } from "@/hooks/use-peserta";
import { useUpdatePaymentProofStatus } from "@/hooks/use-admin";

export default function AdminTeamsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");
  const [isManualReloading, setIsManualReloading] = useState(false);

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
        params: selectedCompSlug ? { competitionSlug: selectedCompSlug } : undefined,
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

  // Modal State for Reject
  const [rejectModalTeam, setRejectModalTeam] = useState<Team | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (team: Team) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({
        teamId: team.id,
        status: "APPROVE",
      });
      toast.success(`Bukti pembayaran tim "${team.teamName}" berhasil disetujui!`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menyetujui bukti pembayaran."
      );
    }
  };

  const handleOpenRejectModal = (team: Team) => {
    setRejectModalTeam(team);
    setRejectReason("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTeam || !rejectReason.trim()) return;

    try {
      await updatePaymentStatusMutation.mutateAsync({
        teamId: rejectModalTeam.id,
        status: "REJECT",
        reason: rejectReason.trim(),
      });
      toast.success(
        `Bukti pembayaran tim "${rejectModalTeam.teamName}" berhasil ditolak.`
      );
      setRejectModalTeam(null);
      setRejectReason("");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Teams & Payment Verification
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Verifikasi pendaftaran tim peserta dan bukti pembayaran biaya pendaftaran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Competition Slug Filter Dropdown */}
          <div className="w-56">
            <select
              value={selectedCompSlug}
              onChange={(e) => setSelectedCompSlug(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="" className="bg-card text-white">
                Semua Cabang Kompetisi
              </option>
              {competitions.map((comp) => (
                <option
                  key={comp.id || comp.slug}
                  value={comp.slug}
                  className="bg-card text-white"
                >
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-56">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari tim, ketua, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-white">
              Registered Teams List
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-secondary">
              {filteredTeams.length} Teams Found
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isTeamsLoading || isTeamsFetching || isManualReloading}
              onClick={handleReloadData}
              className="bg-surface border-border text-text-secondary hover:text-white text-xs h-8 px-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isTeamsFetching || isManualReloading
                    ? "animate-spin text-accent"
                    : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isTeamsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl bg-surface/60" />
            <Skeleton className="h-16 w-full rounded-xl bg-surface/60" />
            <Skeleton className="h-16 w-full rounded-xl bg-surface/60" />
          </div>
        ) : isTeamsError ? (
          /* Error State */
          <div className="p-8 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              Gagal memuat data tim
            </p>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Terjadi kendala saat mengambil data pendaftaran tim dari server.
            </p>
            <Button
              size="sm"
              onClick={() => refetchTeams()}
              className="bg-primary text-white text-xs h-8 rounded-lg"
            >
              Coba Lagi
            </Button>
          </div>
        ) : filteredTeams.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-2 bg-surface/30 border border-dashed border-white/10 rounded-xl">
            <Users className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">
              Belum ada data tim yang terdaftar
            </p>
            <p className="text-xs text-text-secondary">
              {searchQuery || selectedCompSlug
                ? "Tidak ada tim yang cocok dengan filter pencarian."
                : "Tim yang dibuat oleh peserta akan muncul di antrean ini."}
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                  <th className="pb-3 font-semibold">Team ID & Name</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Leader</th>
                  <th className="pb-3 font-semibold">Payment Proof</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeams.map((t) => {
                  const teamName = t.teamName || (t as any).name || "Unnamed Team";
                  const leader =
                    t.members?.find((m) => m.role === "LEADER")?.user?.fullName ||
                    (t as any).leader ||
                    "-";
                  const membersCount = t.members?.length || (t as any).membersCount || 1;
                  const category =
                    t.competition?.name || (t as any).category || (t as any).competitionSlug || "-";

                  const paymentProofObj =
                    t.paymentProof ||
                    (t as any).documents?.find(
                      (d: any) => d.type === "PAYMENT_PROOF" || d.type === "PAYMENT"
                    );

                  const fileUrl =
                    typeof paymentProofObj === "string"
                      ? paymentProofObj
                      : paymentProofObj?.fileUrl || null;

                  const rawStatus =
                    paymentProofObj?.status || t.status || "REVIEW";
                  const statusUpper = rawStatus.toUpperCase();

                  const reviewCount =
                    paymentProofObj?.reviewCount ?? (t as any).reviewCount ?? 1;
                  const rejectionReason =
                    paymentProofObj?.rejectionReason ??
                    (t as any).rejectionReason ??
                    null;
                  const isRevision = reviewCount > 1;

                  const isApproved =
                    statusUpper === "APPROVE" ||
                    statusUpper === "APPROVED" ||
                    statusUpper === "VERIFIED";
                  const isRejected =
                    statusUpper === "REJECT" || statusUpper === "REJECTED";

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-surface/50 transition-colors align-top"
                    >
                      {/* Team Name & ID */}
                      <td className="py-4 pr-4">
                        <p className="font-bold text-white text-sm">
                          {teamName}
                        </p>
                        <span className="text-[10px] text-text-secondary font-mono">
                          ID: #{t.id} • {membersCount} Members
                        </span>
                      </td>

                      {/* Competition Category */}
                      <td className="py-4 pr-4 text-text-secondary font-mono">
                        {category}
                      </td>

                      {/* Leader Name */}
                      <td className="py-4 pr-4 text-white font-medium">
                        {leader}
                      </td>

                      {/* Payment Proof File */}
                      <td className="py-4 pr-4">
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            <span className="truncate max-w-[140px]">
                              {fileUrl.split("/").pop() || "Lihat Berkas"}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-text-secondary/60 font-mono text-[11px]">
                            Belum Upload
                          </span>
                        )}
                      </td>

                      {/* Status & Revision History */}
                      <td className="py-4 pr-4 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isApproved ? (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                              Terverifikasi
                            </span>
                          ) : isRejected ? (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                              Ditolak
                            </span>
                          ) : (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                              Menunggu Review
                            </span>
                          )}

                          {isRevision && (
                            <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                              Revisi ke-{reviewCount}
                            </span>
                          )}
                        </div>

                        {/* Previous Rejection Reason */}
                        {rejectionReason && (
                          <p className="text-[10px] text-text-secondary/70 italic max-w-xs leading-relaxed">
                            <span className="text-white/60 not-italic font-medium">
                              Alasan sebelumnya:
                            </span>{" "}
                            {rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          disabled={
                            isApproved ||
                            updatePaymentStatusMutation.isPending
                          }
                          onClick={() => handleApprove(t)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-3 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatePaymentStatusMutation.isPending}
                          onClick={() => handleOpenRejectModal(t)}
                          className="bg-surface text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px] h-7 px-3 rounded-lg cursor-pointer disabled:opacity-40"
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* REJECT PAYMENT PROOF CONFIRMATION MODAL */}
      {rejectModalTeam && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <h3 className="font-display text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>Tolak Bukti Pembayaran</span>
              </h3>
              <button
                onClick={() => setRejectModalTeam(null)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-card border border-white/10 rounded-xl space-y-1">
              <p className="text-xs font-bold text-white">
                {rejectModalTeam.teamName}
              </p>
              <p className="text-[10px] text-text-secondary font-mono">
                Team ID: #{rejectModalTeam.id}
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Alasan Penolakan <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak sesuai nominal, foto buram, dll"
                  className="w-full bg-card border border-border/80 rounded-xl p-3 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
                <p className="text-[10px] text-text-secondary">
                  Alasan ini akan ditampilkan langsung ke peserta di dashboard tim
                  agar mereka dapat melakukan perbaikan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectModalTeam(null)}
                  className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !rejectReason.trim() ||
                    updatePaymentStatusMutation.isPending
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
                >
                  {updatePaymentStatusMutation.isPending ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Tolak Pembayaran"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
