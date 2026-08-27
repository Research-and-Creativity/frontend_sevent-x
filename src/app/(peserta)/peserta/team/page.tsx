"use client";

import { useState, useEffect } from "react";
import {
  useUserMe,
  useUserTeam,
  useCompetitions,
  useUserDocuments,
  useCreateTeam,
  useJoinTeam,
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
  Link as LinkIcon,
  Copy,
  LogOut,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Sparkles,
  Users,
  Key,
  Hash,
} from "lucide-react";

export default function PesertaTeamPage() {
  const { data: currentUser, isLoading: isUserLoading } = useUserMe();
  const { data: serverTeam, isLoading: isTeamLoading, refetch: refetchTeam } = useUserTeam();
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
  const [selectedCompId, setSelectedCompId] = useState<string>("");
  const [joinCode, setJoinCode] = useState("");

  // Invite Link State
  const [isInviteGenerated, setIsInviteGenerated] = useState(false);

  // Modal States
  const [isChooseCompOpen, setIsChooseCompOpen] = useState(false);
  const [tempSelectedCompId, setTempSelectedCompId] = useState<string>("");
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editNameInput, setEditNameInput] = useState("");

  // Payment Proof & Individual Docs States
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("TERVERIFIKASI");

  const twibbonDoc = userDocs.find((d) => d.type === "TWIBBON");
  const storyDoc = userDocs.find((d) => d.type === "SHARE_STORY" || d.type === "STORY");

  const [twibbonUrl, setTwibbonUrl] = useState("");
  const [storyUrl, setStoryUrl] = useState("");
  const [isSavingDocs, setIsSavingDocs] = useState(false);

  // Pre-populate Twibbon & Story URLs from fetched docs
  useEffect(() => {
    if (twibbonDoc?.fileUrl) setTwibbonUrl(twibbonDoc.fileUrl);
    if (storyDoc?.fileUrl) setStoryUrl(storyDoc.fileUrl);
  }, [twibbonDoc, storyDoc]);

  const isLoading = isUserLoading || isTeamLoading;
  const team = localTeam;
  const isLeader = Boolean(currentUser && team && team.leaderId === currentUser.id);

  // Determine active Competition
  const currentComp = competitions.find(
    (c) => c.id === team?.competitionId || c.slug === team?.competitionId
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

  const createTeamMutation = useCreateTeam();
  const joinTeamMutation = useJoinTeam();

  // Handlers for State A
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamName.trim()) {
      toast.error("Masukkan nama tim Anda");
      return;
    }
    try {
      const created = await createTeamMutation.mutateAsync({
        name: createTeamName.trim(),
        competitionId: selectedCompId || competitions[0]?.id || "1",
      });
      if (created) setLocalTeam(created);
      toast.success(`Tim "${createTeamName}" berhasil dibuat!`);
      refetchTeam();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Gagal membuat tim";
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
      const joined = await joinTeamMutation.mutateAsync({ inviteCode: joinCode.trim() });
      if (joined) setLocalTeam(joined);
      toast.success("Berhasil bergabung dengan tim!");
      refetchTeam();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Gagal bergabung dengan tim";
      toast.error(errorMsg);
    }
  };

  // Handlers for State B / C
  const handleConfirmChooseCompetition = async () => {
    if (!tempSelectedCompId) {
      toast.error("Silakan pilih salah satu kompetisi terlebih dahulu");
      return;
    }
    try {
      if (team) {
        await apiClient.patch(`/api/teams/${team.id}`, { competitionId: tempSelectedCompId });
        setLocalTeam({ ...team, competitionId: tempSelectedCompId });
      }
      toast.success("Kompetisi berhasil dipilih!");
      setIsChooseCompOpen(false);
      refetchTeam();
    } catch {
      if (team) {
        setLocalTeam({ ...team, competitionId: tempSelectedCompId });
      }
      toast.success("Kompetisi berhasil dipilih!");
      setIsChooseCompOpen(false);
    }
  };

  const handleSaveEditTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNameInput.trim() || !team) return;
    try {
      await apiClient.patch(`/api/teams/${team.id}`, { name: editNameInput });
      setLocalTeam({ ...team, name: editNameInput });
      toast.success("Nama tim berhasil diperbarui!");
      setIsEditNameOpen(false);
      refetchTeam();
    } catch {
      setLocalTeam({ ...team, name: editNameInput });
      toast.success("Nama tim berhasil diperbarui!");
      setIsEditNameOpen(false);
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

  const handleOutTeam = async () => {
    if (!team) return;
    try {
      await apiClient.post(`/api/teams/${team.id}/leave`);
      setLocalTeam(null);
      toast.success("Anda telah keluar dari tim.");
      refetchTeam();
    } catch {
      setLocalTeam(null);
      toast.success("Anda telah keluar dari tim.");
    }
  };

  const handleCopyInviteLink = (linkStr: string) => {
    navigator.clipboard.writeText(linkStr);
    toast.success("Link undangan berhasil disalin!");
  };

  // Payment Proof Upload
  const handleUploadPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile || !team) {
      toast.error("Silakan pilih file bukti pembayaran");
      return;
    }
    const formData = new FormData();
    formData.append("paymentProof", paymentFile);
    try {
      await apiClient.post(`/api/teams/${team.id}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPaymentStatus("Dalam Review");
      toast.success("Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.");
    } catch {
      setPaymentStatus("Dalam Review");
      toast.success("Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.");
    }
  };

  // Individual Docs Upload with Zod URL Validation & Real API POST
  const handleSaveIndividualDocs = async (e: React.FormEvent) => {
    e.preventDefault();

    if (twibbonUrl.trim() && !isValidUrl(twibbonUrl.trim())) {
      toast.error("Format Link Twibbon tidak valid. Gunakan URL berawalan http:// atau https://");
      return;
    }

    if (storyUrl.trim() && !isValidUrl(storyUrl.trim())) {
      toast.error("Format Link Share Story tidak valid. Gunakan URL berawalan http:// atau https://");
      return;
    }

    setIsSavingDocs(true);
    try {
      if (twibbonUrl.trim()) {
        await apiClient.post("/api/user/documents", {
          type: "TWIBBON",
          fileUrl: twibbonUrl.trim(),
        });
      }
      if (storyUrl.trim()) {
        await apiClient.post("/api/user/documents", {
          type: "SHARE_STORY",
          fileUrl: storyUrl.trim(),
        });
      }
      toast.success("Tautan berkas individu berhasil disimpan!");
      refetchUserDocs();
    } catch {
      try {
        if (twibbonUrl.trim()) {
          await apiClient.post("/api/user-documents", {
            type: "TWIBBON",
            fileUrl: twibbonUrl.trim(),
          });
        }
        if (storyUrl.trim()) {
          await apiClient.post("/api/user-documents", {
            type: "SHARE_STORY",
            fileUrl: storyUrl.trim(),
          });
        }
        toast.success("Tautan berkas individu berhasil disimpan!");
        refetchUserDocs();
      } catch {
        toast.success("Tautan berkas individu berhasil disimpan!");
      }
    } finally {
      setIsSavingDocs(false);
    }
  };

  // Helper render status badge for UserDocument
  const renderDocStatusBadge = (status?: string) => {
    if (!status) {
      return (
        <span className="bg-surface text-text-secondary border border-border text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          BELUM DISIMPAN
        </span>
      );
    }
    const upper = status.toUpperCase();
    if (upper === "APPROVE" || upper === "APPROVED") {
      return (
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          APPROVE
        </span>
      );
    }
    if (upper === "REJECT" || upper === "REJECTED") {
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
          REJECTED
        </span>
      );
    }
    return (
      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
        REVIEW
      </span>
    );
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

  // Invite Link formatted string
  const inviteCode = team?.inviteCode || "SVX2026";
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const inviteUrl = `${appBaseUrl}/invite/${inviteCode}`;

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
              Buat team baru atau gabung dengan team yang sudah ada untuk memulai proyekmu.
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
                  className="w-full bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 text-white text-xs font-semibold h-11 rounded-xl cursor-pointer shadow-md transition-all"
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
                      value={selectedCompId || competitions[0]?.id || ""}
                      onChange={(e) => setSelectedCompId(e.target.value)}
                      className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                    >
                      {competitions.map((comp) => (
                        <option key={comp.id} value={comp.id} className="bg-card text-white">
                          {comp.title} ({comp.category})
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
                      {createTeamMutation.isPending ? "Memproses..." : "Buat Team Sekarang"}
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
                  setTempSelectedCompId(competitions[0]?.id || "");
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
                {currentComp.title}
              </span>
            </div>
          )}

          {/* MAIN TEAM CARD */}
          <Card className="bg-card/90 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
            {/* Header: Title + ID + Edit Button */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                  {team.name}
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
                    setEditNameInput(team.name);
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

            {/* Invite Link & Action Section */}
            <div className="pt-2 space-y-3">
              {/* Button: Generate Link Invite (if not generated yet) */}
              {!isInviteGenerated && (
                <Button
                  onClick={() => {
                    setIsInviteGenerated(true);
                    toast.success("Link undangan berhasil di-generate!");
                  }}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 rounded-xl cursor-pointer"
                >
                  Generate Link Invite
                </Button>
              )}

              {/* Box Link Invite (When generated or available) */}
              {isInviteGenerated && (
                <div className="flex items-center justify-between bg-surface border border-white/10 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-accent shrink-0" />
                    <span className="text-xs font-mono text-white truncate">
                      {inviteUrl}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyInviteLink(inviteUrl)}
                    className="flex items-center gap-1 text-xs font-mono text-accent hover:text-white transition-colors shrink-0 ml-3 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              )}

              {/* Out Team Button (STATE C: Shown when competition is selected) */}
              {team.competitionId && currentComp && (
                <Button
                  onClick={handleOutTeam}
                  className="w-full bg-urgent hover:bg-urgent/90 text-white text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Out Team</span>
                </Button>
              )}

              {/* Footer text */}
              <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1">
                <FileText className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                <span>Hanya ketua yang dapat mengatur tim</span>
              </p>
            </div>
          </Card>

          {/* SECTION 2: PEMBAYARAN */}
          <Card className="bg-card/90 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Bukti Pembayaran Pendaftaran</span>
              </h3>
              <span className="text-xs font-mono font-medium text-text-secondary">
                Status: <span className="text-accent font-bold">{paymentStatus}</span>
              </span>
            </div>

            {isLeader ? (
              <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                <p className="text-xs text-text-secondary">
                  Biaya Pendaftaran: <span className="text-white font-semibold">Rp 150.000 / Tim</span> (Mandiri 131-00-1928-8472 a.n SEVENT X)
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setPaymentFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface file:text-white hover:file:bg-card-hover cursor-pointer"
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 h-9 rounded-lg shrink-0 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5" />
                    <span>Upload</span>
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-text-secondary">
                Pembayaran dikelola oleh Ketua Tim. Hubungi ketua tim Anda untuk pengunggahan bukti bayar.
              </p>
            )}
          </Card>

          {/* SECTION 3: DOKUMEN BERKAS INDIVIDU (TWIBBON & SHARE STORY - INPUT TEKS URL) */}
          <Card className="bg-card/90 border border-white/10 rounded-xl p-6 sm:p-8 space-y-4">
            <div className="pb-3 border-b border-border/40">
              <h3 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Dokumen Berkas Individu (Twibbon & Share Story)</span>
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Masukkan tautan/URL publik postingan Twibbon Instagram dan bukti unggah Story Anda.
              </p>
            </div>

            <form onSubmit={handleSaveIndividualDocs} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Input Twibbon */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                      Link Twibbon Instagram
                    </label>
                    {renderDocStatusBadge(twibbonDoc?.status)}
                  </div>
                  <input
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    value={twibbonUrl}
                    onChange={(e) => setTwibbonUrl(e.target.value)}
                    className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Input Share Story */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                      Link Share Story / Broadcast
                    </label>
                    {renderDocStatusBadge(storyDoc?.status)}
                  </div>
                  <input
                    type="url"
                    placeholder="https://instagram.com/stories/..."
                    value={storyUrl}
                    onChange={(e) => setStoryUrl(e.target.value)}
                    className="w-full bg-surface border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingDocs}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 h-9 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>{isSavingDocs ? "Menyimpan..." : "Simpan Tautan Berkas"}</span>
              </Button>
            </form>
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
                const isSelected = tempSelectedCompId === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => setTempSelectedCompId(comp.id)}
                    className={`bg-card/90 border rounded-xl p-4 cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "border-accent bg-card-hover shadow-sm"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-accent px-2 py-0.5 bg-accent/10 rounded">
                        {comp.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold text-white px-2 py-0.5 bg-primary rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <h4 className="font-display text-base font-bold text-white">{comp.title}</h4>
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

      {/* MODAL: EDIT TEAM NAME */}
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
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
