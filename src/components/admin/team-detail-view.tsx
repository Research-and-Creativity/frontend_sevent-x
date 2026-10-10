"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, ChevronDown, FileText, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  fileNameFromUrl,
  REQUIRED_DOC_LABELS,
  useTeamDetail,
  useUpdatePaymentProofStatus,
  useUpdateUserDocumentStatus,
  type TeamDetailMember,
} from "@/hooks/use-admin";
import { getErrorMessage } from "@/lib/errors";

const card = "bg-[#15161A] border border-white/10 rounded-2xl p-6";

interface TeamDetailViewProps {
  /** "registered" menampilkan aksi verifikasi dokumen & pembayaran. */
  mode: "registered" | "verified";
}

export function TeamDetailView({ mode }: TeamDetailViewProps) {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading, isError, refetch } = useTeamDetail(id);
  const updateDoc = useUpdateUserDocumentStatus();
  const updatePay = useUpdatePaymentProofStatus();

  const [openMember, setOpenMember] = useState<number | null>(0);
  const [reviseTarget, setReviseTarget] = useState<TeamDetailMember | null>(null);
  const [reviseNote, setReviseNote] = useState("");
  const [confirmRevise, setConfirmRevise] = useState(false);
  const [verifyDocTarget, setVerifyDocTarget] = useState<TeamDetailMember | null>(null);
  const [verifyPay, setVerifyPay] = useState(false);

  if (isLoading) {
    return (
      <div className={`${card} flex items-center justify-center gap-3 text-white/70`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Memuat detail tim...</span>
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className={`${card} text-center space-y-4`}>
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <p className="text-sm font-semibold text-white">Gagal memuat detail tim</p>
        <Button size="sm" onClick={() => refetch()} className="bg-primary text-white text-xs h-8 rounded-lg">
          Coba Lagi
        </Button>
      </div>
    );
  }

  const totalRequired = team.members.length * REQUIRED_DOC_LABELS.length;
  const approvedDocs = team.members.reduce(
    (acc, m) => acc + m.user.documents.filter((d) => d.status === "APPROVE").length,
    0
  );
  const docPercent = totalRequired === 0 ? 0 : Math.round((approvedDocs / totalRequired) * 100);

  const docStatusLabel =
    team.documentStatus === "APPROVE"
      ? "Verified"
      : team.documentStatus === "REJECT"
      ? "Revise"
      : "On Review";
  const payStatus = team.paymentProof?.status;
  const payStatusLabel = !team.paymentProof
    ? "Belum ada"
    : payStatus === "APPROVE"
    ? "Verified"
    : payStatus === "REJECT"
    ? "Rejected"
    : "On Review";

  const backHref = mode === "registered" ? "/admin/teams" : "/admin/documents";

  // Hanya dokumen yang masih menunggu review yang bisa diputuskan.
  const pendingDocs = (m: TeamDetailMember) => m.user.documents.filter((d) => d.status === "REVIEW");

  const runAction = async (fn: () => Promise<unknown>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan perubahan status."));
    }
  };

  const handleVerifyDocs = (member: TeamDetailMember) => {
    const pending = pendingDocs(member);
    if (pending.length === 0) return;
    setVerifyDocTarget(null);
    void runAction(async () => {
      for (const doc of pending) {
        await updateDoc.mutateAsync({ documentId: doc.id, status: "APPROVE" });
      }
    }, `Dokumen ${member.user.fullName} diverifikasi.`);
  };

  const handleReviseDocs = () => {
    const member = reviseTarget;
    const note = reviseNote.trim();
    setConfirmRevise(false);
    if (!member || !note) return;
    setReviseTarget(null);
    void runAction(async () => {
      for (const doc of pendingDocs(member)) {
        await updateDoc.mutateAsync({ documentId: doc.id, status: "REJECT", reason: note });
      }
      setReviseNote("");
    }, `Catatan revisi dikirim ke ${member.user.fullName}.`);
  };

  const handleVerifyPayment = () => {
    setVerifyPay(false);
    if (!team.paymentProof) return;
    void runAction(
      () => updatePay.mutateAsync({ teamId: team.id, status: "APPROVE" }),
      "Bukti pembayaran tim berhasil diverifikasi."
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="text-sm text-white/60 hover:text-white transition-colors">
          ← {mode === "registered" ? "Back to Registered Team" : "Back to Verified Team"}
        </Link>
      </div>

      <div className={card}>
        <h1 className="font-display text-3xl font-bold">{team.teamName}</h1>
        <p className="text-xs text-white/60 mt-1">
          {team.competition?.name} • Team Code • {team.teamCode}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={card}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">TEAM DOCUMENT VERIFICATION</span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">
            {approvedDocs}{" "}
            <span className="text-lg text-white/40 font-normal">/ {totalRequired}</span>
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-[#2A3568] overflow-hidden">
            <div className="h-full rounded-full bg-[#7D8CFF]" style={{ width: `${docPercent}%` }} />
          </div>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">DOCUMENT STATUS</span>
            <FileText className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-3xl font-bold text-[#7D8CFF]">{docStatusLabel}</p>
        </div>
        <div className={card}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">PAYMENT STATUS</span>
            <FileText className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-3xl font-bold text-[#7D8CFF]">{payStatusLabel}</p>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Team Information</h2>
          <span className="text-xs text-white/60">
            {team.members.length} / {team.competition?.maxMember ?? "-"} anggota
          </span>
        </div>

        <div className="space-y-3">
          {team.members.length === 0 && (
            <p className="text-sm text-white/60">Belum ada anggota tim.</p>
          )}

          {team.members.map((member, i) => (
            <div key={member.id} className="border border-white/15 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenMember(openMember === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold"
              >
                <span>
                  {member.user.fullName}
                  {member.role === "LEADER" && (
                    <span className="ml-2 text-xs text-[#7D8CFF]">Leader</span>
                  )}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${openMember === i ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  openMember === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className={`overflow-hidden min-h-0 px-5 space-y-5 ${openMember === i ? "pb-5" : "pb-0"}`}>
                  <h3 className="font-display text-lg font-bold">General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ["Institution/University/School", member.user.institution],
                      ["Phone Number", member.user.phone],
                      ["Discord ID", member.user.discordId],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-white/50 mb-1">{label}</p>
                        <p className="text-sm">{value || "-"}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-display text-lg font-bold">Document</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {REQUIRED_DOC_LABELS.map(({ type, label }) => {
                      const doc = member.user.documents.find((d) => d.type === type);
                      if (!doc) {
                        return (
                          <div key={type}>
                            <p className="text-xs text-white/70 mb-2">{label}</p>
                            <p className="border border-white/10 rounded-lg p-3 text-xs text-white/40">
                              Belum diunggah
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div key={type}>
                          <p className="text-xs text-white/70 mb-2">{label}</p>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 border border-white/20 rounded-lg p-3 hover:bg-white/5 transition-colors"
                          >
                            <span className="w-9 h-9 rounded bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </span>
                            <span className="min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {fileNameFromUrl(doc.fileUrl)}
                              </p>
                              <p className={`text-[10px] ${docStatusColor(doc.status)}`}>
                                {docStatusLabelFor(doc.status)}
                              </p>
                            </span>
                          </a>
                          {doc.status === "REJECT" && doc.rejectionReason && (
                            <p className="mt-1 text-[10px] text-[#F0C969]">
                              Catatan: {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {mode === "registered" && (
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        disabled={pendingDocs(member).length === 0 || updateDoc.isPending}
                        onClick={() => setReviseTarget(member)}
                        className="cursor-pointer px-8 py-2.5 rounded-full border border-[#3B5BFF] text-[#7D8CFF] text-sm font-semibold hover:bg-[#3B5BFF]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Revise
                      </button>
                      <button
                        disabled={pendingDocs(member).length === 0 || updateDoc.isPending}
                        onClick={() => setVerifyDocTarget(member)}
                        className="cursor-pointer px-8 py-2.5 rounded-full bg-white text-[#7C83BC] text-sm font-semibold shadow-[0_0_20px_rgba(180,190,255,0.5)] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Verification
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <h2 className="font-display text-2xl font-bold mb-6">Payment Information</h2>
        <p className="text-xs text-white/70 mb-2">Payment Evidence</p>
        {team.paymentProof ? (
          <a
            href={team.paymentProof.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 border border-white/20 rounded-lg p-3 hover:bg-white/5 transition-colors min-w-[180px]"
          >
            <span className="w-9 h-9 rounded bg-red-500/20 text-red-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </span>
            <span>
              <p className="text-sm font-semibold">{fileNameFromUrl(team.paymentProof.fileUrl)}</p>
              <p className={`text-[10px] ${docStatusColor(team.paymentProof.status)}`}>
                {docStatusLabelFor(team.paymentProof.status)}
              </p>
            </span>
          </a>
        ) : (
          <p className="text-sm text-white/50">Bukti pembayaran belum diunggah tim.</p>
        )}

        {mode === "registered" && (
          <div className="flex justify-end mt-6">
            <button
              disabled={!team.paymentProof || payStatus === "APPROVE" || updatePay.isPending}
              onClick={() => setVerifyPay(true)}
              className="cursor-pointer px-8 py-2.5 rounded-full bg-white text-[#7C83BC] text-sm font-semibold shadow-[0_0_20px_rgba(180,190,255,0.5)] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Verification
            </button>
          </div>
        )}
      </div>

      {/* Catatan revisi */}
      <Dialog open={!!reviseTarget} onOpenChange={(open) => !open && setReviseTarget(null)}>
        <DialogContent className="bg-[#1A1D24]/80 backdrop-blur-xl border border-white/20 text-white max-w-lg rounded-2xl p-8">
          <DialogTitle className="text-white text-2xl font-extrabold tracking-tight">
            Revise Notes
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Catatan revisi dikirim ke {reviseTarget?.user.fullName} untuk dokumen yang masih
            menunggu review.
          </DialogDescription>
          <label className="block text-sm text-white/70 mt-4 mb-2">Catatan Revisi</label>
          <Textarea
            value={reviseNote}
            onChange={(e) => setReviseNote(e.target.value)}
            placeholder="Contoh: Twibbon tidak jelas, mohon upload ulang."
            className="w-full h-32 rounded-2xl border border-white/30 bg-transparent p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 resize-none"
          />
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-white/10">
            <button
              onClick={() => setReviseTarget(null)}
              className="cursor-pointer px-8 py-3 rounded-full border border-white/20 text-white/70 text-sm font-semibold hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!reviseNote.trim()}
              onClick={() => setConfirmRevise(true)}
              className="cursor-pointer px-10 py-3 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={confirmRevise}
        onOpenChange={setConfirmRevise}
        title="Submit revision note?"
        description="Dokumen akan ditandai Revise dan catatan dikirim ke peserta."
        confirmText="Submit"
        cancelText="Cancel"
        onConfirm={handleReviseDocs}
      />

      <ConfirmModal
        open={!!verifyDocTarget}
        onOpenChange={(open) => !open && setVerifyDocTarget(null)}
        title="Verify document?"
        description={`Seluruh dokumen ${verifyDocTarget?.user.fullName} yang menunggu review akan ditandai Approved.`}
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={() => verifyDocTarget && handleVerifyDocs(verifyDocTarget)}
      />

      <ConfirmModal
        open={verifyPay}
        onOpenChange={setVerifyPay}
        title="Verify payment?"
        description="Bukti pembayaran tim akan ditandai Approved."
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={handleVerifyPayment}
      />
    </div>
  );
}

function docStatusColor(status: string): string {
  if (status === "APPROVE") return "text-[#63CFA0]";
  if (status === "REJECT") return "text-[#F0C969]";
  return "text-white/40";
}

function docStatusLabelFor(status: string): string {
  if (status === "APPROVE") return "Approved";
  if (status === "REJECT") return "Revise";
  return "Need Review";
}
