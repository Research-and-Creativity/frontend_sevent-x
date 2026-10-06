"use client";

import { useState, useEffect, useRef } from "react";
import {
  useUserMe,
  useUserTeam,
  useCompetitions,
  useUserDocuments,
  useCreateTeam,
  useJoinTeam,
  useUpdateTeamName,
  useLeaveTeam,
  useTransferLeadership,
} from "@/hooks/use-peserta";
import { Team, TeamMember, Competition } from "@/types/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Pencil,
  X,
  Copy,
  LogOut,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  FileText,
  CreditCard,
  Users,
  Key,
  Hash,
  Crown,
  Trash2,
  Loader2,
} from "lucide-react";

export default function PesertaTeamPage() {
  const { data: currentUser, isLoading: isUserLoading } = useUserMe();
  const {
    data: serverTeam,
    isLoading: isTeamLoading,
    refetch: refetchTeam,
  } = useUserTeam();
  const { data: competitions = [] } = useCompetitions();
  const { data: userDocs = [], refetch: refetchUserDocs } = useUserDocuments();

  // Local state to manage team updates after mutation
  const [localTeam, setLocalTeam] = useState<Team | null>(null);

  // Sync serverTeam to localTeam
  useEffect(() => {
    if (serverTeam !== undefined) {
      setLocalTeam(serverTeam);
    }
  }, [serverTeam]);

  // Form & Tab State A
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [createTeamName, setCreateTeamName] = useState("");
  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");
  const [joinCode, setJoinCode] = useState("");

  // Modal States
  const [isChooseCompOpen, setIsChooseCompOpen] = useState(false);
  const [tempSelectedCompSlug, setTempSelectedCompSlug] = useState<string>("");
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");

  // Leave / Disband / Transfer Leadership Modal States
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isDisbandModalOpen, setIsDisbandModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedNewLeaderId, setSelectedNewLeaderId] = useState<string>("");

  // Payment Proof States & Validation
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);

  // Individual Docs States & Validation
  const twibbonDoc = userDocs.find((d) => d.type === "TWIBBON");
  const storyDoc = userDocs.find(
    (d) => d.type === "SHARE_STORY" || d.type === "STORY"
  );

  const [twibbonUrl, setTwibbonUrl] = useState("");
  const [storyUrl, setStoryUrl] = useState("");
  const [isEditingTwibbon, setIsEditingTwibbon] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [isSavingTwibbon, setIsSavingTwibbon] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [twibbonError, setTwibbonError] = useState<string | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);

  // Pre-populate Twibbon & Story URLs from fetched docs
  useEffect(() => {
    if (twibbonDoc?.fileUrl) setTwibbonUrl(twibbonDoc.fileUrl);
    if (storyDoc?.fileUrl) setStoryUrl(storyDoc.fileUrl);
  }, [twibbonDoc, storyDoc]);

  const isLoading = isUserLoading || isTeamLoading;
  const team = localTeam;
  const isLeader = Boolean(
    currentUser &&
      team &&
      team.members?.some(
        (m) => m.userId === currentUser.id && m.role === "LEADER"
      )
  );

  const otherMembers = (team?.members || []).filter(
    (m) => m.userId !== currentUser?.id
  );
  const memberCount = team?.members?.length || 1;

  // Real Payment Proof Status, Rejection Reason & Review Count from backend response
  const paymentProofObj =
    team?.paymentProof ||
    (team as any)?.documents?.find(
      (d: any) => d.type === "PAYMENT_PROOF" || d.type === "PAYMENT"
    );

  const getPaymentProofStatus = (): string | null => {
    if (paymentProofObj?.status) return paymentProofObj.status;
    if ((team as any)?.paymentProofStatus) return (team as any).paymentProofStatus;
    if (team?.paymentProof) return "REVIEW";
    return null;
  };

  const paymentProofStatus = getPaymentProofStatus();
  const paymentRejectionReason =
    paymentProofObj?.rejectionReason ||
    (team as any)?.paymentRejectionReason ||
    (team as any)?.rejectionReason ||
    null;
  const paymentReviewCount =
    paymentProofObj?.reviewCount ||
    (team as any)?.paymentReviewCount ||
    (team as any)?.reviewCount ||
    1;

  const paymentFileUrl =
    typeof team?.paymentProof === "string"
      ? team.paymentProof
      : paymentProofObj?.fileUrl || (paymentProofObj as any)?.url || null;

  const isPaymentApproved =
    paymentProofStatus?.toUpperCase() === "APPROVE" ||
    paymentProofStatus?.toUpperCase() === "APPROVED" ||
    paymentProofStatus?.toUpperCase() === "VERIFIED";
  const isPaymentReview =
    paymentProofStatus?.toUpperCase() === "REVIEW" ||
    paymentProofStatus?.toUpperCase() === "PENDING";
  const isPaymentRejected =
    paymentProofStatus?.toUpperCase() === "REJECT" ||
    paymentProofStatus?.toUpperCase() === "REJECTED";

  const twibbonStatusUpper = twibbonDoc?.status?.toUpperCase() || null;
  const isTwibbonApproved =
    twibbonStatusUpper === "APPROVE" || twibbonStatusUpper === "APPROVED";
  const isTwibbonReview =
    twibbonStatusUpper === "REVIEW" || twibbonStatusUpper === "PENDING";
  const isTwibbonRejected =
    twibbonStatusUpper === "REJECT" || twibbonStatusUpper === "REJECTED";

  const storyStatusUpper = storyDoc?.status?.toUpperCase() || null;
  const isStoryApproved =
    storyStatusUpper === "APPROVE" || storyStatusUpper === "APPROVED";
  const isStoryReview =
    storyStatusUpper === "REVIEW" || storyStatusUpper === "PENDING";
  const isStoryRejected =
    storyStatusUpper === "REJECT" || storyStatusUpper === "REJECTED";

  const isAllDocsApproved = Boolean(isTwibbonApproved && isStoryApproved);

  // Status Change Detection & Real-Time Polling Toast Notification
  const prevStatusesRef = useRef<{
    payment?: string | null;
    twibbon?: string | null;
    story?: string | null;
    isInitialized: boolean;
  }>({
    payment: undefined,
    twibbon: undefined,
    story: undefined,
    isInitialized: false,
  });

  useEffect(() => {
    const currentPayment = paymentProofStatus?.toUpperCase() ?? null;
    const currentTwibbon = twibbonDoc?.status?.toUpperCase() ?? null;
    const currentStory = storyDoc?.status?.toUpperCase() ?? null;

    if (!prevStatusesRef.current.isInitialized) {
      if (
        paymentProofStatus !== undefined ||
        twibbonDoc !== undefined ||
        storyDoc !== undefined
      ) {
        prevStatusesRef.current = {
          payment: currentPayment,
          twibbon: currentTwibbon,
          story: currentStory,
          isInitialized: true,
        };
      }
      return;
    }

    // Check Payment Status Change
    const prevPayment = prevStatusesRef.current.payment;
    if (prevPayment !== undefined && prevPayment !== currentPayment && currentPayment !== null) {
      if (
        currentPayment === "APPROVE" ||
        currentPayment === "APPROVED" ||
        currentPayment === "VERIFIED"
      ) {
        toast.success("Bukti pembayaran tim Anda telah diverifikasi oleh admin!");
      } else if (currentPayment === "REJECT" || currentPayment === "REJECTED") {
        toast.error(
          `Bukti pembayaran ditolak: ${paymentRejectionReason || "Silakan cek alasan dan unggah ulang."}`
        );
      }
      prevStatusesRef.current.payment = currentPayment;
    }

    // Check Twibbon Status Change
    const prevTwibbon = prevStatusesRef.current.twibbon;
    if (prevTwibbon !== undefined && prevTwibbon !== currentTwibbon && currentTwibbon !== null) {
      if (currentTwibbon === "APPROVE" || currentTwibbon === "APPROVED") {
        toast.success("Tautan Twibbon Anda telah disetujui oleh admin!");
      } else if (currentTwibbon === "REJECT" || currentTwibbon === "REJECTED") {
        toast.error(
          `Tautan Twibbon ditolak: ${twibbonDoc?.rejectionReason || "Silakan cek alasan dan perbaiki."}`
        );
      }
      prevStatusesRef.current.twibbon = currentTwibbon;
    }

    // Check Share Story Status Change
    const prevStory = prevStatusesRef.current.story;
    if (prevStory !== undefined && prevStory !== currentStory && currentStory !== null) {
      if (currentStory === "APPROVE" || currentStory === "APPROVED") {
        toast.success("Tautan Share Story Anda telah disetujui oleh admin!");
      } else if (currentStory === "REJECT" || currentStory === "REJECTED") {
        toast.error(
          `Tautan Share Story ditolak: ${storyDoc?.rejectionReason || "Silakan cek alasan dan perbaiki."}`
        );
      }
      prevStatusesRef.current.story = currentStory;
    }
  }, [
    paymentProofStatus,
    twibbonDoc?.status,
    storyDoc?.status,
    paymentRejectionReason,
    twibbonDoc?.rejectionReason,
    storyDoc?.rejectionReason,
  ]);

  // Determine active Competition
  const currentComp = competitions.find(
    (c) =>
      c.id === team?.competitionId ||
      c.slug === team?.competitionId ||
      c.slug === (team?.competition as any)?.slug
  );

  // Helper URL validator
  const isValidUrl = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Status badge renderer for Payment Proof and Individual Documents
  const renderStatusBadge = (status?: string | null, reviewCount?: number) => {
    if (!status) {
      return (
        <span className="bg-surface text-text-secondary border border-border text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          Belum Upload
        </span>
      );
    }
    const upper = status.toUpperCase();
    if (upper === "APPROVE" || upper === "APPROVED" || upper === "VERIFIED") {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          Terverifikasi
        </span>
      );
    }
    if (upper === "REJECT" || upper === "REJECTED") {
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          Ditolak
        </span>
      );
    }
    const isRevision = typeof reviewCount === "number" && reviewCount > 1;
    return (
      <div className="flex items-center gap-1.5">
        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          Menunggu Review
        </span>
        {isRevision && (
          <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
            Revisi ke-{reviewCount}
          </span>
        )}
      </div>
    );
  };

  // Mutations
  const createTeamMutation = useCreateTeam();
  const joinTeamMutation = useJoinTeam();
  const updateTeamNameMutation = useUpdateTeamName();
  const leaveTeamMutation = useLeaveTeam();
  const transferLeadershipMutation = useTransferLeadership();

  // Handlers for State A
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamName.trim()) {
      toast.error("Masukkan nama tim Anda");
      return;
    }
    const chosenSlug = selectedCompSlug || competitions[0]?.slug || "";
    if (!chosenSlug) {
      toast.error("Pilih cabang kompetisi terlebih dahulu");
      return;
    }
    try {
      const created = await createTeamMutation.mutateAsync({
        name: createTeamName.trim(),
        competitionSlug: chosenSlug,
      });
      if (created) setLocalTeam(created);
      toast.success(`Tim "${createTeamName}" berhasil dibuat!`);
      refetchTeam();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Gagal membuat tim";
      toast.error(errorMsg);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error("Masukkan kode undangan tim");
      return;
    }
    try {
      const joined = await joinTeamMutation.mutateAsync({
        teamCode: joinCode.trim(),
      });
      if (joined) setLocalTeam(joined);
      toast.success("Berhasil bergabung dengan tim!");
      refetchTeam();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal bergabung dengan tim";
      toast.error(errorMsg);
    }
  };

  // Handlers for State B / C
  const handleConfirmChooseCompetition = async () => {
    if (!tempSelectedCompSlug) {
      toast.error("Silakan pilih salah satu kompetisi terlebih dahulu");
      return;
    }
    try {
      if (team) {
        await apiClient.patch(`/api/teams/${team.id}`, {
          competitionSlug: tempSelectedCompSlug,
        });
        setLocalTeam({ ...team, competitionId: tempSelectedCompSlug });
      }
      toast.success("Kompetisi berhasil dipilih!");
      setIsChooseCompOpen(false);
      refetchTeam();
    } catch {
      if (team) {
        setLocalTeam({ ...team, competitionId: tempSelectedCompSlug });
      }
      toast.success("Kompetisi berhasil dipilih!");
      setIsChooseCompOpen(false);
    }
  };

  // 1. Edit Nama Tim (PATCH /api/teams/me via useUpdateTeamName)
  const handleSaveEditTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameInput.trim() || !team) return;
    try {
      await updateTeamNameMutation.mutateAsync(editNameInput.trim());
      setLocalTeam({ ...team, teamName: editNameInput.trim() });
      toast.success("Nama tim berhasil diperbarui!");
      setIsEditNameOpen(false);
      refetchTeam();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal memperbarui nama tim";
      toast.error(msg);
    }
  };

  const handleKickMember = async (member: TeamMember) => {
    if (!isLeader || !team) return;
    const memberName = member.user?.fullName || "Anggota";
    try {
      await apiClient.delete(`/api/teams/${team.id}/members/${member.id}`);
      const updated = team.members?.filter((m) => m.id !== member.id);
      setLocalTeam({ ...team, members: updated });
      toast.success(`${memberName} berhasil dikeluarkan dari tim.`);
      refetchTeam();
    } catch {
      const updated = team.members?.filter((m) => m.id !== member.id);
      setLocalTeam({ ...team, members: updated });
      toast.success(`${memberName} berhasil dikeluarkan dari tim.`);
    }
  };

  // Member Leave Team (DELETE /api/teams/me)
  const handleConfirmLeaveTeam = async () => {
    try {
      await leaveTeamMutation.mutateAsync();
      setLocalTeam(null);
      setIsLeaveModalOpen(false);
      toast.success("Anda telah keluar dari tim.");
      refetchTeam();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Gagal keluar dari tim";
      toast.error(msg);
    }
  };

  // Leader Disband Team Solo (DELETE /api/teams/me)
  const handleConfirmDisbandTeam = async () => {
    try {
      await leaveTeamMutation.mutateAsync();
      setLocalTeam(null);
      setIsDisbandModalOpen(false);
      toast.success("Tim berhasil dibubarkan.");
      refetchTeam();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Gagal membubarkan tim";
      toast.error(msg);
    }
  };

  // Leader Transfer Leadership (POST /api/teams/me/transfer-leadership)
  const handleConfirmTransferLeadership = async () => {
    if (!selectedNewLeaderId) {
      toast.error("Pilih salah satu anggota untuk dijadikan ketua baru.");
      return;
    }
    try {
      await transferLeadershipMutation.mutateAsync(selectedNewLeaderId);
      setIsTransferModalOpen(false);
      setSelectedNewLeaderId("");
      toast.success("Kepemimpinan tim berhasil dialihkan!");
      refetchTeam();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal mengalihkan kepemimpinan tim";
      toast.error(msg);
    }
  };

  // Payment Proof Upload Trigger (Opens Confirmation Modal)
  const handleUploadPaymentProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaymentApproved) return;

    if (!paymentFile) {
      setPaymentError("Silakan pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    if (!team) return;

    setPaymentError(null);
    setIsPaymentConfirmOpen(true);
  };

  // Payment Proof Execution (Single endpoint: POST /api/teams/${team.id}/payment-proof, single 'file' key)
  const handleExecuteUploadPaymentProof = async () => {
    if (!paymentFile || !team) return;

    setIsUploadingPayment(true);
    const formData = new FormData();
    formData.append("file", paymentFile);

    try {
      await apiClient.post(`/api/teams/${team.id}/payment-proof`, formData);
      toast.success(
        "Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin."
      );
      setPaymentFile(null);
      setIsPaymentConfirmOpen(false);
      setIsEditingPayment(false);
      refetchTeam();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mengunggah bukti pembayaran."
      );
    } finally {
      setIsUploadingPayment(false);
    }
  };

  // Individual Doc: Save Twibbon
  const handleSaveTwibbon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTwibbonApproved) return;

    if (!twibbonUrl.trim()) {
      setTwibbonError("Silakan isi link Twibbon terlebih dahulu");
      return;
    }
    if (!isValidUrl(twibbonUrl.trim())) {
      setTwibbonError(
        "Format URL tidak valid. Gunakan awalan http:// atau https://"
      );
      return;
    }
    setTwibbonError(null);

    setIsSavingTwibbon(true);
    try {
      await apiClient.post("/api/user/documents/link", {
        type: "TWIBBON",
        url: twibbonUrl.trim(),
      });
      toast.success("Tautan Twibbon berhasil disimpan!");
      setIsEditingTwibbon(false);
      refetchUserDocs();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menyimpan tautan Twibbon."
      );
    } finally {
      setIsSavingTwibbon(false);
    }
  };

  // Individual Doc: Save Share Story
  const handleSaveShareStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStoryApproved) return;

    if (!storyUrl.trim()) {
      setStoryError("Silakan isi link Share Story terlebih dahulu");
      return;
    }
    if (!isValidUrl(storyUrl.trim())) {
      setStoryError(
        "Format URL tidak valid. Gunakan awalan http:// atau https://"
      );
      return;
    }
    setStoryError(null);

    setIsSavingStory(true);
    try {
      await apiClient.post("/api/user/documents/link", {
        type: "SHARE_STORY",
        url: storyUrl.trim(),
      });
      toast.success("Tautan Share Story berhasil disimpan!");
      setIsEditingStory(false);
      refetchUserDocs();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal menyimpan tautan Share Story."
      );
    } finally {
      setIsSavingStory(false);
    }
  };

  // Render Skeletons during initial load
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-14 w-full rounded-xl bg-card/60" />
        <Skeleton className="h-64 w-full rounded-xl bg-card/60" />
        <Skeleton className="h-48 w-full rounded-xl bg-card/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* STATE A: BELUM MEMILIKI TIM */}
      {!team ? (
        <div className="space-y-8 max-w-xl mx-auto py-6">
          {/* Header Block (Center Aligned) */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-surface/80 border border-white/10 flex items-center justify-center text-text-secondary mx-auto shadow-inner">
              <Users className="w-8 h-8 text-text-secondary" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Kamu belum memiliki team
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              Buat team baru atau gabung dengan team yang sudah ada untuk memulai
              proyekmu.
            </p>
          </div>

          {/* 2 Vertical Cards */}
          <div className="space-y-5">
            {/* Card 1: Buat Team Baru */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg transition-all">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-accent">
                <Users className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">
                  Buat Team Baru
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Buat team baru dan undang anggota untuk bergabung.
                </p>
              </div>

              {!isCreateFormOpen ? (
                <Button
                  type="button"
                  onClick={() => setIsCreateFormOpen(true)}
                  className="w-full bg-linear-to-r from-primary to-primary-hover hover:opacity-90 text-white text-xs font-semibold h-11 rounded-xl cursor-pointer shadow-md transition-all"
                >
                  Buat Team
                </Button>
              ) : (
                <form
                  onSubmit={handleCreateTeam}
                  className="space-y-4 pt-3 border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                      Form Pembuatan Team
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                      Nama Team
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama team baru Anda"
                      value={createTeamName}
                      onChange={(e) => setCreateTeamName(e.target.value)}
                      className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                      Pilih Cabang Kompetisi
                    </label>
                    <select
                      value={selectedCompSlug || competitions[0]?.slug || ""}
                      onChange={(e) => setSelectedCompSlug(e.target.value)}
                      className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                    >
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

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateFormOpen(false)}
                      className="w-1/3 bg-surface border-border text-text-secondary text-xs h-10 rounded-xl cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTeamMutation.isPending}
                      className="w-2/3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 rounded-xl cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {createTeamMutation.isPending
                        ? "Memproses..."
                        : "Buat Team Sekarang"}
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            {/* Card 2: Gabung dengan Kode */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-accent">
                <Key className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-tight">
                  Gabung dengan Kode
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Masukkan kode undangan dari ketua team untuk bergabung.
                </p>
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan kode team"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full bg-black/40 border border-border/80 rounded-xl pl-10 pr-4 py-3 text-xs text-white font-mono uppercase tracking-wider placeholder-normal placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={joinTeamMutation.isPending}
                  className="w-full bg-surface hover:bg-card-hover border border-border/80 text-white text-xs font-semibold h-11 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  {joinTeamMutation.isPending ? "Memproses..." : "Gabung"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      ) : (
        /* STATE B & STATE C: PUNYA TIM */
        <div className="space-y-6">
          {/* TOP BANNER */}
          {!team.competitionId || !currentComp ? (
            /* STATE B: Kompetisi Belum Dipilih */
            <div className="flex items-center justify-between bg-surface border border-white/10 rounded-xl px-5 py-3">
              <span className="text-sm font-medium text-white">
                Competition not yet selected
              </span>
              <Button
                onClick={() => {
                  setTempSelectedCompSlug(competitions[0]?.slug || "");
                  setIsChooseCompOpen(true);
                }}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 h-9 rounded-lg cursor-pointer"
              >
                Choose Competition
              </Button>
            </div>
          ) : (
            /* STATE C: Kompetisi Sudah Dipilih */
            <div className="flex items-center justify-between bg-surface border border-white/10 rounded-xl px-5 py-3">
              <span className="text-sm font-medium text-white">
                {currentComp.name}
              </span>
            </div>
          )}

          {/* MAIN TEAM CARD */}
          <Card className="bg-card/90 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            {/* Header: Title + ID + Edit Button */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                  {team.teamName}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  ID: #{team.id}
                </p>
              </div>

              {isLeader && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditNameInput(team.teamName);
                    setIsEditNameOpen(true);
                  }}
                  className="bg-surface border-border text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {/* Member Section Header */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-text-secondary uppercase tracking-wider block">
                ANGGOTA ({team.members?.length || 1}/5)
              </span>

              {/* Members List */}
              <div className="space-y-2.5">
                {team.members?.map((member) => {
                  const isMemberLeader = member.role === "LEADER";
                  const memberName = member.user?.fullName || "Anggota Tim";
                  const canKick = isLeader && member.userId !== currentUser?.id;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-surface/50 border border-white/10 rounded-xl p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-white overflow-hidden shrink-0">
                          {member.user?.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={memberName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-display text-xs font-bold text-accent">
                              {memberName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-white">
                            {memberName}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isMemberLeader
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-primary/20 text-accent border border-primary/30"
                            }`}
                          >
                            {isMemberLeader ? "KETUA" : "ANGGOTA"}
                          </span>
                        </div>
                      </div>

                      {canKick && (
                        <button
                          onClick={() => handleKickMember(member)}
                          className="w-7 h-7 rounded-lg bg-card border border-border text-text-secondary hover:text-urgent hover:bg-urgent-soft/30 flex items-center justify-center text-xs transition-colors cursor-pointer"
                          title="Keluarkan anggota"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Invite Code Display (No link, no generate button) */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block">
                KODE UNDANGAN TIM
              </label>
              <div className="flex items-center justify-between bg-surface border border-white/10 rounded-xl px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-accent shrink-0" />
                  <span className="font-mono text-lg sm:text-xl font-bold tracking-[0.25em] text-white select-all uppercase">
                    {team.teamCode}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(team.teamCode);
                    toast.success("Kode tim berhasil disalin!");
                  }}
                  className="bg-card hover:bg-card-hover border-border text-white text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-accent" />
                  <span>Salin Kode</span>
                </Button>
              </div>
              <p className="text-[11px] text-text-secondary">
                Bagikan kode ini ke calon anggota tim agar dapat bergabung ke
                tim Anda.
              </p>
            </div>

            {/* Role-Based Out Team / Transfer / Disband Actions */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {!isLeader ? (
                /* REGULAR MEMBER: Keluar dari Tim */
                <Button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Tim</span>
                </Button>
              ) : memberCount > 1 ? (
                /* LEADER WITH MEMBERS: Transfer Leadership + Disabled Disband */
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={() => {
                        setSelectedNewLeaderId(otherMembers[0]?.userId || "");
                        setIsTransferModalOpen(true);
                      }}
                      className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Transfer Kepemimpinan</span>
                    </Button>

                    <Button
                      disabled
                      className="w-full bg-surface text-text-secondary/50 border border-border/40 text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Bubarkan Tim</span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    Transfer kepemimpinan dulu ke anggota lain sebelum membubarkan tim.
                  </p>
                </div>
              ) : (
                /* LEADER ALONE (memberCount === 1): Bubarkan Tim */
                <div className="space-y-2">
                  <Button
                    onClick={() => setIsDisbandModalOpen(true)}
                    className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Bubarkan Tim</span>
                  </Button>
                  <p className="text-[11px] text-text-secondary">
                    Karena Anda adalah satu-satunya anggota, tindakan ini akan
                    menghapus tim secara permanen.
                  </p>
                </div>
              )}

              {/* Footer hint */}
              <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1">
                <FileText className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                <span>
                  {isLeader
                    ? "Anda adalah Ketua Tim. Anda dapat mengelola anggota dan pengaturan tim."
                    : "Hanya ketua yang dapat mengubah data dan pengaturan utama tim."}
                </span>
              </p>
            </div>
          </Card>

          {/* SECTION 2: PEMBAYARAN (With Real Status, Validation & Verification Lock) */}
          <Card className="bg-card/90 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                <span>Bukti Pembayaran Pendaftaran</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-secondary">Status:</span>
                {renderStatusBadge(paymentProofStatus, paymentReviewCount)}
              </div>
            </div>

            {isPaymentApproved ? (
              /* State: Terverifikasi (Form Disabled) */
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">
                    Pembayaran Berhasil Diverifikasi
                  </p>
                  <p className="text-[11px] text-emerald-300">
                    Sudah terverifikasi, hubungi admin jika perlu perubahan.
                  </p>
                </div>
              </div>
            ) : isPaymentReview && !isEditingPayment ? (
              /* State: Sedang Ditinjau Admin (Locked with "Ubah" button) */
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-amber-300">
                        Sedang ditinjau admin.
                      </p>
                      {paymentFileUrl && (
                        <a
                          href={paymentFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-[11px] inline-flex items-center gap-1 font-mono"
                        >
                          <span className="truncate max-w-[200px] sm:max-w-xs">
                            {paymentFileUrl.split("/").pop() || "Lihat Bukti Pembayaran"}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                  {isLeader && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingPayment(true)}
                      className="bg-surface border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs h-7 px-3 rounded-lg cursor-pointer shrink-0"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      <span>Ubah</span>
                    </Button>
                  )}
                </div>

                {paymentReviewCount > 1 && paymentRejectionReason && (
                  <p className="text-[11px] text-text-secondary/70 italic flex items-center gap-1.5 pt-0.5">
                    <span className="text-white/60 not-italic font-medium">Sebelumnya ditolak:</span>
                    <span>{paymentRejectionReason}</span>
                  </p>
                )}
              </div>
            ) : isLeader ? (
              /* State: Leader can upload / edit payment proof */
              <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-text-secondary">
                    Biaya Pendaftaran:{" "}
                    <span className="text-white font-semibold">
                      Rp 150.000 / Tim
                    </span>{" "}
                    (Mandiri 131-00-1928-8472 a.n SEVENT X)
                  </p>
                  {isEditingPayment && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingPayment(false);
                        setPaymentFile(null);
                        setPaymentError(null);
                      }}
                      className="text-xs text-text-secondary hover:text-white h-7 px-2"
                    >
                      Batal
                    </Button>
                  )}
                </div>

                {isPaymentRejected ? (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-rose-400">
                        {paymentRejectionReason
                          ? `Ditolak: ${paymentRejectionReason}`
                          : "Bukti pembayaran sebelumnya ditolak oleh admin."}
                      </p>
                      <p className="text-[11px] text-rose-300/80">
                        Silakan perbaiki dan unggah ulang bukti pembayaran yang valid.
                      </p>
                    </div>
                  </div>
                ) : isEditingPayment ? (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>Mode ubah aktif: Pilih file baru untuk memperbarui bukti pembayaran.</span>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      disabled={isUploadingPayment}
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPaymentFile(file);
                        if (file) setPaymentError(null);
                      }}
                      className={`block w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface file:text-white hover:file:bg-card-hover cursor-pointer rounded-lg border transition-colors ${
                        paymentError
                          ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                          : "border-transparent"
                      }`}
                    />
                    <Button
                      type="submit"
                      disabled={isUploadingPayment}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 h-9 rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 mr-1.5" />
                          <span>Upload</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {paymentError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{paymentError}</span>
                    </p>
                  )}

                  {isPaymentReview &&
                    paymentReviewCount > 1 &&
                    paymentRejectionReason && (
                      <p className="text-[11px] text-text-secondary/70 italic flex items-center gap-1.5 pt-1">
                        <span className="text-white/60 not-italic font-medium">Sebelumnya ditolak:</span>
                        <span>{paymentRejectionReason}</span>
                      </p>
                    )}
                </div>
              </form>
            ) : (
              /* State: Regular Member View */
              <div className="space-y-2">
                <p className="text-xs text-text-secondary">
                  Pembayaran dikelola oleh Ketua Tim. Hubungi ketua tim Anda untuk
                  pengunggahan bukti bayar.
                </p>
                {paymentProofStatus?.toUpperCase() === "REVIEW" &&
                  paymentReviewCount > 1 &&
                  paymentRejectionReason && (
                    <p className="text-[11px] text-text-secondary/70 italic flex items-center gap-1.5">
                      <span className="text-white/60 not-italic font-medium">Sebelumnya ditolak:</span>
                      <span>{paymentRejectionReason}</span>
                    </p>
                  )}
              </div>
            )}
          </Card>

          {/* SECTION 3: DOKUMEN BERKAS INDIVIDU (TWIBBON & SHARE STORY - With Validation & Lock) */}
          <Card className="bg-card/90 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="pb-3 border-b border-border/40">
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Dokumen Berkas Individu (Twibbon & Share Story)</span>
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Masukkan tautan/URL publik postingan Twibbon Instagram dan bukti
                unggah Story Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form 1: Twibbon */}
              <form
                onSubmit={handleSaveTwibbon}
                className="space-y-4 flex flex-col justify-between p-4 rounded-xl bg-surface/50 border border-white/5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                      Link Twibbon Instagram
                    </label>
                    {renderStatusBadge(
                      twibbonDoc?.status,
                      twibbonDoc?.reviewCount
                    )}
                  </div>

                  {isTwibbonApproved ? (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium">Sudah terverifikasi.</span>
                    </div>
                  ) : isTwibbonRejected ? (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-medium text-rose-400">
                          {twibbonDoc?.rejectionReason
                            ? `Ditolak: ${twibbonDoc.rejectionReason}`
                            : "Tautan Twibbon sebelumnya ditolak oleh admin."}
                        </p>
                        <p className="text-[10px] text-rose-300/80">
                          Silakan perbaiki dan simpan ulang.
                        </p>
                      </div>
                    </div>
                  ) : isTwibbonReview && !isEditingTwibbon ? (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-medium">Sedang ditinjau admin.</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingTwibbon(true)}
                        className="bg-surface border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] h-6 px-2.5 rounded-lg cursor-pointer shrink-0"
                      >
                        <Pencil className="w-2.5 h-2.5 mr-1" />
                        <span>Ubah</span>
                      </Button>
                    </div>
                  ) : isEditingTwibbon ? (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-center gap-1.5">
                      <Pencil className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Mode ubah aktif: Masukkan link baru Twibbon.</span>
                    </div>
                  ) : null}

                  <input
                    type="url"
                    disabled={
                      isSavingTwibbon ||
                      isTwibbonApproved ||
                      (isTwibbonReview && !isEditingTwibbon)
                    }
                    placeholder="https://instagram.com/p/..."
                    value={twibbonUrl}
                    onChange={(e) => {
                      setTwibbonUrl(e.target.value);
                      if (twibbonError) setTwibbonError(null);
                    }}
                    className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      twibbonError
                        ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                        : "border-border/80 focus:border-accent"
                    }`}
                  />
                  {twibbonError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{twibbonError}</span>
                    </p>
                  )}
                  {isTwibbonReview &&
                    (twibbonDoc?.reviewCount ?? 1) > 1 &&
                    twibbonDoc?.rejectionReason && (
                      <p className="text-[11px] text-text-secondary/70 italic flex items-center gap-1.5">
                        <span className="text-white/60 not-italic font-medium">
                          Sebelumnya ditolak:
                        </span>
                        <span>{twibbonDoc.rejectionReason}</span>
                      </p>
                    )}
                </div>

                {isTwibbonApproved ? (
                  <Button
                    type="button"
                    disabled
                    className="w-full bg-surface border border-white/10 text-emerald-400 text-xs font-semibold h-9 rounded-lg disabled:opacity-60 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>Twibbon Terverifikasi</span>
                  </Button>
                ) : isTwibbonReview && !isEditingTwibbon ? null : isEditingTwibbon ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingTwibbon(false);
                        setTwibbonUrl(twibbonDoc?.fileUrl || "");
                        setTwibbonError(null);
                      }}
                      className="w-1/3 bg-surface border-white/10 text-white/80 hover:bg-card-hover text-xs font-semibold h-9 rounded-lg cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingTwibbon}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSavingTwibbon ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          <span>Simpan Twibbon</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSavingTwibbon}
                    className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-lg cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSavingTwibbon ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        <span>Simpan Twibbon</span>
                      </>
                    )}
                  </Button>
                )}
              </form>

              {/* Form 2: Share Story */}
              <form
                onSubmit={handleSaveShareStory}
                className="space-y-4 flex flex-col justify-between p-4 rounded-xl bg-surface/50 border border-white/5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                      Link Share Story / Broadcast
                    </label>
                    {renderStatusBadge(storyDoc?.status, storyDoc?.reviewCount)}
                  </div>

                  {isStoryApproved ? (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium">Sudah terverifikasi.</span>
                    </div>
                  ) : isStoryRejected ? (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-medium text-rose-400">
                          {storyDoc?.rejectionReason
                            ? `Ditolak: ${storyDoc.rejectionReason}`
                            : "Tautan Share Story sebelumnya ditolak oleh admin."}
                        </p>
                        <p className="text-[10px] text-rose-300/80">
                          Silakan perbaiki dan simpan ulang.
                        </p>
                      </div>
                    </div>
                  ) : isStoryReview && !isEditingStory ? (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-medium">Sedang ditinjau admin.</span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingStory(true)}
                        className="bg-surface border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] h-6 px-2.5 rounded-lg cursor-pointer shrink-0"
                      >
                        <Pencil className="w-2.5 h-2.5 mr-1" />
                        <span>Ubah</span>
                      </Button>
                    </div>
                  ) : isEditingStory ? (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-center gap-1.5">
                      <Pencil className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Mode ubah aktif: Masukkan link baru Share Story.</span>
                    </div>
                  ) : null}

                  <input
                    type="url"
                    disabled={
                      isSavingStory ||
                      isStoryApproved ||
                      (isStoryReview && !isEditingStory)
                    }
                    placeholder="https://instagram.com/stories/..."
                    value={storyUrl}
                    onChange={(e) => {
                      setStoryUrl(e.target.value);
                      if (storyError) setStoryError(null);
                    }}
                    className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      storyError
                        ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                        : "border-border/80 focus:border-accent"
                    }`}
                  />
                  {storyError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{storyError}</span>
                    </p>
                  )}
                  {isStoryReview &&
                    (storyDoc?.reviewCount ?? 1) > 1 &&
                    storyDoc?.rejectionReason && (
                      <p className="text-[11px] text-text-secondary/70 italic flex items-center gap-1.5">
                        <span className="text-white/60 not-italic font-medium">
                          Sebelumnya ditolak:
                        </span>
                        <span>{storyDoc.rejectionReason}</span>
                      </p>
                    )}
                </div>

                {isStoryApproved ? (
                  <Button
                    type="button"
                    disabled
                    className="w-full bg-surface border border-white/10 text-emerald-400 text-xs font-semibold h-9 rounded-lg disabled:opacity-60 mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>Share Story Terverifikasi</span>
                  </Button>
                ) : isStoryReview && !isEditingStory ? null : isEditingStory ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditingStory(false);
                        setStoryUrl(storyDoc?.fileUrl || "");
                        setStoryError(null);
                      }}
                      className="w-1/3 bg-surface border-white/10 text-white/80 hover:bg-card-hover text-xs font-semibold h-9 rounded-lg cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingStory}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSavingStory ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          <span>Simpan Share Story</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSavingStory}
                    className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-lg cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSavingStory ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        <span>Simpan Share Story</span>
                      </>
                    )}
                  </Button>
                )}
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: CHOOSE COMPETITION */}
      {isChooseCompOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-border/80 rounded-2xl p-6 sm:p-8 max-w-2xl w-full space-y-6 relative">
            <div className="flex items-start justify-between gap-4 pb-2 border-b border-border/40">
              <div>
                <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                  Choose Competition
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Select the competition track your team wants to participate in.
                </p>
              </div>
              <button
                onClick={() => setIsChooseCompOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 2 Columns of Competitions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competitions.map((comp) => {
                const isSelected = tempSelectedCompSlug === comp.slug;
                return (
                  <div
                    key={comp.id || comp.slug}
                    onClick={() => setTempSelectedCompSlug(comp.slug)}
                    className={`bg-card/90 border rounded-xl p-4 cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "border-accent bg-card-hover shadow-sm"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-accent px-2 py-0.5 bg-accent/10 rounded">
                        {comp.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-white px-2 py-0.5 bg-primary rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <h4 className="font-display text-base font-bold text-white">
                      {comp.name}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Cancel vs Confirm Selection */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => setIsChooseCompOpen(false)}
                className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmChooseCompetition}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 h-9 rounded-xl cursor-pointer"
              >
                Confirm Selection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 1: EDIT TEAM NAME */}
      {isEditNameOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-border/80 rounded-2xl p-6 max-w-md w-full space-y-5 relative">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Edit Nama Tim
              </h3>
              <button
                onClick={() => setIsEditNameOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeamName} className="space-y-4">
              <input
                type="text"
                required
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditNameOpen(false)}
                  className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={updateTeamNameMutation.isPending}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
                >
                  {updateTeamNameMutation.isPending
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: CONFIRM LEAVE TEAM (REGULAR MEMBER) */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-border/80 rounded-2xl p-6 max-w-md w-full space-y-5 relative">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <LogOut className="w-5 h-5 text-rose-400" />
                <span>Keluar dari Tim</span>
              </h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Apakah Anda yakin ingin keluar dari tim{" "}
              <strong className="text-white">{team?.teamName}</strong>? Anda
              dapat bergabung kembali menggunakan kode tim jika diizinkan oleh
              ketua.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLeaveModalOpen(false)}
                className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={leaveTeamMutation.isPending}
                onClick={handleConfirmLeaveTeam}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
              >
                {leaveTeamMutation.isPending
                  ? "Memproses..."
                  : "Ya, Keluar dari Tim"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 3: CONFIRM DISBAND TEAM (LEADER SOLO) */}
      {isDisbandModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-rose-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 relative">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <h3 className="font-display text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Bubarkan Tim</span>
              </h3>
              <button
                onClick={() => setIsDisbandModalOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 space-y-1">
              <p className="font-bold">Peringatan Aksi Destruktif:</p>
              <p>
                Ini akan <strong>MENGHAPUS</strong> tim{" "}
                <span className="underline">{team?.teamName}</span> secara
                permanen dari database. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDisbandModalOpen(false)}
                className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={leaveTeamMutation.isPending}
                onClick={handleConfirmDisbandTeam}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
              >
                {leaveTeamMutation.isPending
                  ? "Membubarkan..."
                  : "Ya, Bubarkan Tim"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 4: TRANSFER LEADERSHIP (LEADER WITH MEMBERS) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-border/80 rounded-2xl p-6 max-w-md w-full space-y-5 relative">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Transfer Kepemimpinan</span>
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Pilih salah satu anggota tim berikut untuk dijadikan sebagai Ketua
              Tim yang baru:
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {otherMembers.map((m) => {
                const isSelected = selectedNewLeaderId === m.userId;
                const mName = m.user?.fullName || "Anggota Tim";
                const mEmail = m.user?.email || "";

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedNewLeaderId(m.userId)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/50 text-white"
                        : "bg-card border-white/10 hover:border-white/20 text-text-secondary hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-accent">
                        {mName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{mName}</p>
                        {mEmail && (
                          <p className="text-[10px] text-text-secondary font-mono">
                            {mEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-amber-500 text-black"
                          : "bg-surface text-text-secondary border border-border"
                      }`}
                    >
                      {isSelected ? "Dipilih" : "Pilih"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTransferModalOpen(false)}
                className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={
                  !selectedNewLeaderId ||
                  transferLeadershipMutation.isPending
                }
                onClick={handleConfirmTransferLeadership}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
              >
                {transferLeadershipMutation.isPending
                  ? "Mengalihkan..."
                  : "Konfirmasi Transfer"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL 5: CONFIRM UPLOAD PAYMENT PROOF */}
      {isPaymentConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-border/80 rounded-2xl p-6 max-w-md w-full space-y-5 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <h3 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                <span>Upload bukti pembayaran?</span>
              </h3>
              <button
                onClick={() => setIsPaymentConfirmOpen(false)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              File ini bakal dikirim buat diverifikasi admin. Pastikan nominal dan
              bukti transfernya udah bener — kalau salah, kamu harus hubungi admin
              buat upload ulang.
            </p>

            {paymentFile && (
              <div className="p-3 bg-card border border-white/10 rounded-xl flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-accent shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">
                    {paymentFile.name}
                  </p>
                  <p className="text-[10px] text-text-secondary font-mono">
                    {(paymentFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentConfirmOpen(false)}
                className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isUploadingPayment}
                onClick={handleExecuteUploadPaymentProof}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
              >
                {isUploadingPayment ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </div>
                ) : (
                  "Ya, upload"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
