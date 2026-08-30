"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  UploadCloud,
  Link as LinkIcon,
  Code2,
  PlayCircle,
  Globe,
  FileUp,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Users,
  Calendar,
  CreditCard,
  UserCheck,
  Loader2,
  FileCheck,
  ShieldAlert,
  PenLine,
  Eye,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import {
  useUserMe,
  useUserTeam,
  useSubmissionEligibility,
  useUserSubmission,
  useCreateOrUpdateSubmission,
} from "@/hooks/use-peserta";
import { toast } from "sonner";

export default function PesertaSubmissionPage() {
  const { data: currentUser, isLoading: isUserLoading } = useUserMe();
  const { data: team, isLoading: isTeamLoading } = useUserTeam();
  const {
    data: eligibility,
    isLoading: isEligibilityLoading,
    refetch: refetchEligibility,
  } = useSubmissionEligibility();
  const {
    data: submissionData,
    isLoading: isSubmissionLoading,
    refetch: refetchSubmission,
  } = useUserSubmission();

  const submitMutation = useCreateOrUpdateSubmission();

  // Form Field States
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  // Field Validation Errors
  const [errors, setErrors] = useState<{
    projectTitle?: string | null;
    description?: string | null;
    githubUrl?: string | null;
    videoUrl?: string | null;
    liveUrl?: string | null;
  }>({});

  // Prefill Form when existing submission data is available
  useEffect(() => {
    if (submissionData) {
      if (submissionData.projectTitle) setProjectTitle(submissionData.projectTitle);
      if (submissionData.description) setDescription(submissionData.description);
      if (submissionData.githubUrl) setGithubUrl(submissionData.githubUrl);
      if (submissionData.demoVideoUrl) setVideoUrl(submissionData.demoVideoUrl);
      if (submissionData.deploymentUrl) setLiveUrl(submissionData.deploymentUrl);
    }
  }, [submissionData]);

  // Helper URL validator
  const isValidUrl = (urlStr: string) => {
    try {
      const u = new URL(urlStr);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      projectTitle?: string | null;
      description?: string | null;
      githubUrl?: string | null;
      videoUrl?: string | null;
      liveUrl?: string | null;
    } = {};

    if (!projectTitle.trim() || projectTitle.trim().length < 2) {
      newErrors.projectTitle = "Judul proyek minimal 2 karakter";
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Deskripsi proyek minimal 10 karakter";
    }

    if (!githubUrl.trim()) {
      newErrors.githubUrl = "Link repositori GitHub wajib diisi";
    } else if (!isValidUrl(githubUrl.trim())) {
      newErrors.githubUrl = "Format URL tidak valid. Gunakan awalan http:// atau https://";
    }

    if (!videoUrl.trim()) {
      newErrors.videoUrl = "Link video demo proyek wajib diisi";
    } else if (!isValidUrl(videoUrl.trim())) {
      newErrors.videoUrl = "Format URL tidak valid. Gunakan awalan http:// atau https://";
    }

    if (liveUrl.trim() && !isValidUrl(liveUrl.trim())) {
      newErrors.liveUrl = "Format URL tidak valid. Gunakan awalan http:// atau https://";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Silakan lengkapi dan periksa kembali data formulir.");
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.append("projectTitle", projectTitle.trim());
    formData.append("description", description.trim());
    formData.append("githubUrl", githubUrl.trim());
    formData.append("demoVideoUrl", videoUrl.trim());
    if (liveUrl.trim()) {
      formData.append("deploymentUrl", liveUrl.trim());
    }
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      await submitMutation.mutateAsync(formData);
      toast.success(
        submissionData
          ? "Karya tim berhasil diperbarui!"
          : "Karya tim berhasil diunggah!"
      );
      setSelectedFile(null);
      refetchSubmission();
      refetchEligibility();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mengunggah karya proyek."
      );
    }
  };

  const isLoading =
    isUserLoading || isTeamLoading || isEligibilityLoading || isSubmissionLoading;

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

  // STATE A: Belum Punya Tim
  if (!team) {
    return (
      <div className="space-y-8 max-w-xl mx-auto py-10">
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Kamu Belum Memiliki Tim
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              Pengumpulan karya hanya dapat dilakukan oleh tim yang terdaftar.
              Silakan buat tim baru atau gabung ke tim yang sudah ada terlebih dahulu.
            </p>
          </div>
          <Link href="/peserta/team" className="inline-block pt-2">
            <Button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-6 h-10 rounded-xl inline-flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Buka Menu Kelola Tim</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isEligible = Boolean(eligibility?.isEligible);
  const requirements = eligibility?.requirements;
  const isTimelineActive = Boolean(requirements?.timelineActive);
  const isTeamApproved = Boolean(requirements?.teamApproved);
  const isPaymentApproved = Boolean(requirements?.paymentApproved);
  const members = requirements?.members || [];
  const memberCount = members.length || team?.members?.length || 1;

  return (
    <div className="space-y-8">
      {/* STATE B: LOCKED (isEligible === false) */}
      {!isEligible ? (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-left max-w-4xl mx-auto shadow-xl">
          {/* Card Header */}
          <div className="flex items-start gap-4 pb-4 border-b border-border/40">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {!isTimelineActive
                  ? "Periode Pengumpulan Karya Belum Dibuka / Telah Berakhir"
                  : "Menunggu Kelengkapan & Verifikasi Dokumen"}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {!isTimelineActive
                  ? "Formulir pengumpulan karya hanya dapat diakses saat fase UPLOAD_KARYA sedang aktif pada timeline kompetisi."
                  : "Formulir pengunggahan karya baru dapat diakses setelah seluruh persyaratan administrasi (status tim, pembayaran, dan berkas seluruh anggota) diverifikasi oleh admin."}
              </p>
            </div>
          </div>

          {/* Checklist 1: Administrasi Tim & Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider block">
              1. Status Administrasi Tim & Jadwal
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Item A: Status Tim */}
              <div className="p-3.5 rounded-xl bg-surface/60 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Status Tim</span>
                  {isTeamApproved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terverifikasi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      <span>Belum Approve</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white font-medium">
                  {team.teamName} ({team.teamCode})
                </p>
              </div>

              {/* Item B: Bukti Pembayaran */}
              <div className="p-3.5 rounded-xl bg-surface/60 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Bukti Pembayaran</span>
                  {isPaymentApproved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terverifikasi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Clock className="w-3 h-3" />
                      <span>Belum Approve</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white font-medium">
                  Rp 150.000 / Tim
                </p>
              </div>

              {/* Item C: Fase Upload Karya */}
              <div className="p-3.5 rounded-xl bg-surface/60 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Fase Upload Karya</span>
                  {isTimelineActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Fase Aktif</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      <Calendar className="w-3 h-3" />
                      <span>Belum Dibuka / Berakhir</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white font-medium truncate">
                  {team.competition?.name || "Kompetisi"}
                </p>
              </div>
            </div>
          </div>

          {/* Checklist 2: Dokumen Administrasi Setiap Anggota */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                2. Kelengkapan Berkas Anggota Tim ({members.length} Anggota)
              </span>
              <span className="text-[11px] text-text-secondary">
                Setiap anggota wajib melengkapi 4 berkas verifikasi
              </span>
            </div>

            <div className="space-y-3">
              {members.map((member, idx) => (
                <div
                  key={member.userId || idx}
                  className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {member.fullName}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          member.role === "LEADER"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-white/10 text-text-secondary"
                        }`}
                      >
                        {member.role === "LEADER" ? "Ketua" : "Anggota"}
                      </span>
                    </div>

                    {member.allDocumentsApproved ? (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Semua Dokumen Lengkap</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Belum Lengkap</span>
                      </span>
                    )}
                  </div>

                  {/* 4 Document Status Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {/* Twibbon */}
                    <div
                      className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                        member.twibbonApproved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-surface border-white/5 text-text-secondary"
                      }`}
                    >
                      <span>Twibbon</span>
                      {member.twibbonApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>

                    {/* Share Story */}
                    <div
                      className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                        member.shareStoryApproved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-surface border-white/5 text-text-secondary"
                      }`}
                    >
                      <span>Share Story</span>
                      {member.shareStoryApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>

                    {/* KTM */}
                    <div
                      className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                        member.ktmApproved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-surface border-white/5 text-text-secondary"
                      }`}
                    >
                      <span>KTM</span>
                      {member.ktmApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>

                    {/* KTP / Paspor */}
                    <div
                      className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                        member.ktpApproved
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : "bg-surface border-white/5 text-text-secondary"
                      }`}
                    >
                      <span>KTP / Identitas</span>
                      {member.ktpApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-3 border-t border-border/40 flex flex-wrap items-center gap-3">
            <Link href="/peserta/team">
              <Button
                variant="outline"
                className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-4 h-9 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Lengkapi Berkas di Halaman Tim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Link href="/peserta/settings">
              <Button
                variant="ghost"
                className="text-text-secondary hover:text-white text-xs font-semibold px-4 h-9 rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Upload KTM & KTP di Pengaturan</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* STATE C: UNLOCKED (Complete Submission Form) */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2/3 Width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Existing Submission Banner if already submitted */}
            {submissionData && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">
                      Karya Tim Telah Terdaftar
                    </p>
                    <p className="text-[11px] text-emerald-300">
                      Anda dapat memperbarui informasi karya dan berkas deliverable kapan saja sebelum batas waktu pengumpulan berakhir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card A: Project Details */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <FileText className="w-5 h-5 text-white" />
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Detail Proyek
                </h2>
              </div>

              {/* Input 1: Project Title */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Judul Proyek <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul atau nama karya proyek tim Anda"
                  value={projectTitle}
                  onChange={(e) => {
                    setProjectTitle(e.target.value);
                    if (errors.projectTitle) setErrors((prev) => ({ ...prev, projectTitle: null }));
                  }}
                  className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-white placeholder-text-secondary/50 focus:outline-none transition-colors ${
                    errors.projectTitle
                      ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                      : "border-border/80 focus:border-accent"
                  }`}
                />
                {errors.projectTitle && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.projectTitle}</span>
                  </p>
                )}
              </div>

              {/* Input 2: Detailed Description with Markdown Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                    Deskripsi Lengkap <span className="text-rose-400">*</span>
                  </label>

                  {/* Markdown Tabs: Tulis & Pratinjau */}
                  <div className="flex items-center gap-1 bg-surface border border-border/80 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setDescTab("write")}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        descTab === "write"
                          ? "bg-card text-white shadow-xs font-semibold"
                          : "text-text-secondary hover:text-white"
                      }`}
                    >
                      <PenLine className="w-3 h-3" />
                      <span>Tulis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab("preview")}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        descTab === "preview"
                          ? "bg-card text-accent shadow-xs font-semibold"
                          : "text-text-secondary hover:text-white"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Pratinjau</span>
                    </button>
                  </div>
                </div>

                {descTab === "write" ? (
                  <>
                    <textarea
                      rows={6}
                      placeholder="Jelaskan latar belakang masalah, solusi yang ditawarkan, fitur utama, dan arsitektur teknologi karya Anda... (Mendukung format Markdown seperti ## Heading, **tebal**, - list, `code`, dan [link](url))"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                      }}
                      className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-white placeholder-text-secondary/50 focus:outline-none transition-colors resize-none leading-relaxed ${
                        errors.description
                          ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                          : "border-border/80 focus:border-accent"
                      }`}
                    />
                    <div className="flex items-center justify-between text-[10px] text-text-secondary/70 font-mono px-1">
                      <span>Mendukung Markdown GFM</span>
                      <span>{description.length} karakter</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full min-h-[160px] max-h-[360px] overflow-y-auto bg-surface/90 border border-border/80 rounded-xl p-4 transition-colors">
                    {description.trim() ? (
                      <MarkdownRenderer content={description} />
                    ) : (
                      <div className="py-8 text-center space-y-1 text-text-secondary/60">
                        <FileText className="w-6 h-6 mx-auto opacity-40 mb-1" />
                        <p className="text-xs italic">Belum ada deskripsi untuk dipratinjau.</p>
                        <p className="text-[11px]">Tulis penjelasan proyek Anda di tab &quot;Tulis&quot;.</p>
                      </div>
                    )}
                  </div>
                )}

                {errors.description && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>
            </Card>

            {/* Card B: Deliverables */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <UploadCloud className="w-5 h-5 text-white" />
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Berkas Deliverable (Opsional)
                </h2>
              </div>

              {/* Current Uploaded File Preview if exists */}
              {submissionData?.fileUrl && (
                <div className="p-3.5 rounded-xl bg-surface border border-white/10 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-text-secondary text-[11px]">Berkas tersimpan saat ini:</p>
                      <a
                        href={submissionData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline font-mono inline-flex items-center gap-1 text-xs"
                      >
                        <span className="truncate max-w-xs sm:max-w-md">
                          {submissionData.fileUrl.split("/").pop() || "Unduh Deliverable Proyek"}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Dropzone Box */}
              <div className="border-2 border-dashed border-border/80 hover:border-accent/60 bg-surface/40 rounded-2xl p-8 sm:p-10 text-center space-y-4 transition-colors relative">
                <input
                  type="file"
                  accept=".zip,.pdf,.png,.jpg,.jpeg,.rar,.7z"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSelectedFile(file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                <div className="w-12 h-12 rounded-xl bg-card border border-border/80 flex items-center justify-center mx-auto text-white shadow-sm">
                  <FileUp className="w-6 h-6 text-accent" />
                </div>

                <div className="space-y-2">
                  <p className="font-display font-bold text-white text-base sm:text-lg">
                    {selectedFile ? selectedFile.name : "Klik atau seret file ke sini"}
                  </p>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    Unggah proposal, presentasi pitch deck, diagram arsitektur, atau arsip kode (PDF, ZIP, RAR, PNG - Maks 10MB)
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="bg-surface border-border text-white text-xs font-mono font-semibold px-6 h-10 rounded-xl transition-all cursor-pointer relative z-20 pointer-events-none"
                >
                  {selectedFile ? "Ganti Berkas" : "Pilih Berkas"}
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (1/3 Width) */}
          <div className="space-y-6">
            {/* Card A: External Links */}
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
              {/* Card Header */}
              <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                <LinkIcon className="w-5 h-5 text-white" />
                <h2 className="font-display text-xl font-bold text-white tracking-tight">
                  Tautan Eksternal
                </h2>
              </div>

              {/* Input 1: GitHub Repository */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Repositori GitHub <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://github.com/username/project"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      if (errors.githubUrl) setErrors((prev) => ({ ...prev, githubUrl: null }));
                    }}
                    className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none transition-colors ${
                      errors.githubUrl
                        ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                        : "border-border/80 focus:border-accent"
                    }`}
                  />
                </div>
                {errors.githubUrl && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.githubUrl}</span>
                  </p>
                )}
              </div>

              {/* Input 2: Demo Video URL */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Video Demo Proyek <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <PlayCircle className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... atau Google Drive"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (errors.videoUrl) setErrors((prev) => ({ ...prev, videoUrl: null }));
                    }}
                    className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none transition-colors ${
                      errors.videoUrl
                        ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                        : "border-border/80 focus:border-accent"
                    }`}
                  />
                </div>
                {errors.videoUrl && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.videoUrl}</span>
                  </p>
                )}
              </div>

              {/* Input 3: Live Deployment (Optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary tracking-wider">
                  Live Demo / Deployment (Opsional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://myproject.vercel.app"
                    value={liveUrl}
                    onChange={(e) => {
                      setLiveUrl(e.target.value);
                      if (errors.liveUrl) setErrors((prev) => ({ ...prev, liveUrl: null }));
                    }}
                    className={`w-full bg-surface border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none transition-colors ${
                      errors.liveUrl
                        ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                        : "border-border/80 focus:border-accent"
                    }`}
                  />
                </div>
                {errors.liveUrl && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.liveUrl}</span>
                  </p>
                )}
              </div>
            </Card>

            {/* Card B: Team Banner ("Submitting as") */}
            <div className="relative overflow-hidden bg-linear-to-r from-[#0C1738] via-[#0F1E4A] to-[#0A122E] border border-white/10 rounded-2xl p-6 space-y-2 shadow-lg">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />

              <span className="font-mono text-xs text-text-secondary/80 uppercase tracking-wider block">
                Mengunggah atas nama
              </span>

              <div className="flex items-center justify-between gap-3 relative z-10 pt-1">
                <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight">
                  {team.teamName}
                </h3>
                <span className="bg-white/10 border border-white/20 text-white font-mono text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {memberCount} Anggota
                </span>
              </div>
              <p className="text-xs text-text-secondary font-medium pt-1">
                {team.competition?.name || "Kompetisi SEVENT X"}
              </p>
            </div>

            {/* Button C: Submit Project */}
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-primary hover:bg-primary-hover text-white text-sm font-display font-semibold h-11 rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Menyimpan Karya...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span>{submissionData ? "Perbarui Karya Proyek" : "Submit Karya Proyek"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
