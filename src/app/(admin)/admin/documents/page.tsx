"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Loader2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminUserDocumentItem,
  useAdminUserDocuments,
  useUpdateUserDocumentStatus,
} from "@/hooks/use-admin";

export default function AdminDocumentsPage() {
  const queryClient = useQueryClient();

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState<string>("REVIEW");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualReloading, setIsManualReloading] = useState(false);

  // 1. Fetch User Documents
  const {
    data: userDocs = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useAdminUserDocuments(selectedStatus, selectedType);

  const updateDocMutation = useUpdateUserDocumentStatus();

  // Modal State for Reject
  const [rejectModalDoc, setRejectModalDoc] =
    useState<AdminUserDocumentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleReloadData = async () => {
    setIsManualReloading(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["adminUserDocuments"] });
      await refetch();
      toast.success("Daftar dokumen berhasil dimuat ulang!");
    } catch {
      toast.error("Gagal memuat ulang dokumen.");
    } finally {
      setTimeout(() => setIsManualReloading(false), 400);
    }
  };

  const handleApprove = async (doc: AdminUserDocumentItem) => {
    try {
      await updateDocMutation.mutateAsync({
        documentId: doc.id,
        status: "APPROVE",
      });
      toast.success(
        `Dokumen ${doc.type} milik ${doc.user?.fullName || "peserta"} berhasil disetujui!`
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menyetujui dokumen peserta."
      );
    }
  };

  const handleOpenRejectModal = (doc: AdminUserDocumentItem) => {
    setRejectModalDoc(doc);
    setRejectReason("");
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalDoc || !rejectReason.trim()) return;

    try {
      await updateDocMutation.mutateAsync({
        documentId: rejectModalDoc.id,
        status: "REJECT",
        reason: rejectReason.trim(),
      });
      toast.success(
        `Dokumen ${rejectModalDoc.type} milik ${rejectModalDoc.user?.fullName || "peserta"} berhasil ditolak.`
      );
      setRejectModalDoc(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menolak dokumen peserta."
      );
    }
  };

  // Client-side search filtering
  const filteredDocs = userDocs.filter((d) => {
    const userName = d.user?.fullName || "";
    const email = d.user?.email || "";
    const institution = d.user?.institution || "";
    const teamName = d.user?.teamMember?.team?.teamName || "";
    const teamCode = d.user?.teamMember?.team?.teamCode || "";
    const compName = d.user?.teamMember?.team?.competition?.name || "";
    const docType = d.type || "";
    const docId = d.id || "";

    const query = searchQuery.toLowerCase();
    return (
      userName.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      institution.toLowerCase().includes(query) ||
      teamName.toLowerCase().includes(query) ||
      teamCode.toLowerCase().includes(query) ||
      compName.toLowerCase().includes(query) ||
      docType.toLowerCase().includes(query) ||
      docId.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            User Documents Verification
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Verifikasi berkas administrasi dan kelengkapan peserta (Twibbon, Share Story, KTM, KTP).
          </p>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="ALL" className="bg-card text-white">
                Semua Status
              </option>
              <option value="REVIEW" className="bg-card text-white">
                Menunggu Review
              </option>
              <option value="APPROVE" className="bg-card text-white">
                Disetujui
              </option>
              <option value="REJECT" className="bg-card text-white">
                Ditolak
              </option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-44">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="ALL" className="bg-card text-white">
                Semua Jenis Berkas
              </option>
              <option value="TWIBBON" className="bg-card text-white">
                Twibbon
              </option>
              <option value="SHARE_STORY" className="bg-card text-white">
                Share Story
              </option>
              <option value="KTM" className="bg-card text-white">
                KTM
              </option>
              <option value="KTP" className="bg-card text-white">
                KTP
              </option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-56">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, tim, berkas..."
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
            <FileCheck className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-white">
              User Documents Queue
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-secondary">
              {filteredDocs.length} Documents Listed
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading || isFetching || isManualReloading}
              onClick={handleReloadData}
              className="bg-surface border-border text-text-secondary hover:text-white text-xs h-8 px-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isFetching || isManualReloading ? "animate-spin text-accent" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl bg-surface/60" />
            <Skeleton className="h-16 w-full rounded-xl bg-surface/60" />
            <Skeleton className="h-16 w-full rounded-xl bg-surface/60" />
          </div>
        ) : isError ? (
          /* Error State */
          <div className="p-8 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              Gagal memuat dokumen peserta
            </p>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Terjadi kendala saat mengambil data antrean dokumen dari server.
            </p>
            <Button
              size="sm"
              onClick={() => refetch()}
              className="bg-primary text-white text-xs h-8 rounded-lg"
            >
              Coba Lagi
            </Button>
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-2 bg-surface/30 border border-dashed border-white/10 rounded-xl">
            <FileCheck className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">
              Tidak ada dokumen ditemukan
            </p>
            <p className="text-xs text-text-secondary">
              {searchQuery || selectedStatus !== "REVIEW" || selectedType !== "ALL"
                ? "Tidak ada dokumen yang cocok dengan kombinasi filter dan kata kunci saat ini."
                : "Dokumen yang diunggah oleh peserta akan muncul di antrean ini untuk diverifikasi."}
            </p>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                  <th className="pb-3 font-semibold">Peserta</th>
                  <th className="pb-3 font-semibold">Tim & Kompetisi</th>
                  <th className="pb-3 font-semibold">Jenis Berkas</th>
                  <th className="pb-3 font-semibold">Tautan Berkas</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((d) => {
                  const userName = d.user?.fullName || "Unnamed User";
                  const userEmail = d.user?.email || "-";
                  const institution = d.user?.institution || null;

                  const team = d.user?.teamMember?.team;
                  const teamName = team?.teamName || "-";
                  const teamCode = team?.teamCode || null;
                  const compName = team?.competition?.name || "-";
                  const role = d.user?.teamMember?.role || null;

                  const statusUpper = d.status?.toUpperCase() || "REVIEW";
                  const isApproved =
                    statusUpper === "APPROVE" ||
                    statusUpper === "APPROVED" ||
                    statusUpper === "VERIFIED";
                  const isRejected =
                    statusUpper === "REJECT" || statusUpper === "REJECTED";

                  const reviewCount = d.reviewCount ?? 1;
                  const isRevision = reviewCount > 1;
                  const rejectionReason = d.rejectionReason || null;

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-surface/50 transition-colors align-top"
                    >
                      {/* Participant Column */}
                      <td className="py-4 pr-4">
                        <p className="font-bold text-white text-sm">{userName}</p>
                        <p className="text-[10px] text-text-secondary font-mono">
                          {userEmail}
                        </p>
                        {institution && (
                          <span className="text-[10px] text-accent/80 font-medium block mt-0.5">
                            {institution}
                          </span>
                        )}
                      </td>

                      {/* Team & Competition Column */}
                      <td className="py-4 pr-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-white">
                            <Users className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{teamName}</span>
                            {role && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-surface text-text-secondary rounded border border-white/10">
                                {role}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-text-secondary font-mono">
                            {compName}
                            {teamCode && ` • #${teamCode}`}
                          </p>
                        </div>
                      </td>

                      {/* Document Type Column */}
                      <td className="py-4 pr-4">
                        <span className="font-mono font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[10px]">
                          {d.type}
                        </span>
                      </td>

                      {/* Submitted File / Link Column */}
                      <td className="py-4 pr-4">
                        {d.fileUrl ? (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            <span className="truncate max-w-[150px]">
                              {d.fileUrl.split("/").pop() || "Buka Dokumen"}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-text-secondary/60 font-mono text-[11px]">
                            Tidak ada tautan
                          </span>
                        )}
                      </td>

                      {/* Status & Revision Column */}
                      <td className="py-4 pr-4 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isApproved ? (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                              Disetujui
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
                          disabled={isApproved || updateDocMutation.isPending}
                          onClick={() => handleApprove(d)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-3 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateDocMutation.isPending}
                          onClick={() => handleOpenRejectModal(d)}
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

      {/* REJECT USER DOCUMENT MODAL */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <h3 className="font-display text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>Tolak Dokumen Peserta</span>
              </h3>
              <button
                onClick={() => setRejectModalDoc(null)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-card border border-white/10 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white">
                  {rejectModalDoc.user?.fullName || "Peserta"}
                </p>
                <span className="font-mono text-[10px] text-accent font-bold">
                  {rejectModalDoc.type}
                </span>
              </div>
              <p className="text-[10px] text-text-secondary font-mono">
                {rejectModalDoc.user?.teamMember?.team?.teamName
                  ? `Tim: ${rejectModalDoc.user.teamMember.team.teamName}`
                  : "Belum bergabung tim"}{" "}
                • ID: #{rejectModalDoc.id}
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
                  placeholder="Contoh: Akun Instagram di-private sehingga bukti twibbon tidak dapat dicek, foto buram, dll"
                  className="w-full bg-card border border-border/80 rounded-xl p-3 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
                <p className="text-[10px] text-text-secondary">
                  Alasan ini akan ditampilkan langsung ke peserta di dashboard tim
                  agar mereka dapat melakukan perbaikan & unggah ulang.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectModalDoc(null)}
                  className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !rejectReason.trim() || updateDocMutation.isPending
                  }
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
                >
                  {updateDocMutation.isPending ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Tolak Dokumen"
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
