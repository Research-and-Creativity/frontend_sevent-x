"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  useUserMe,
  useUserDocuments,
  useUpdateProfile,
  useChangePassword,
  useUploadUserDocument,
} from "@/hooks/use-peserta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Lock,
  FileCheck2,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PesertaSettingsPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();
  const currentUser = userMe || storeUser;

  const { data: userDocuments = [], isLoading: isDocsLoading } =
    useUserDocuments();

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadDocMutation = useUploadUserDocument();

  // Profile Edit State
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  // Sync state when currentUser is loaded
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setInstitution(currentUser.institution || "");
    }
  }, [currentUser]);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string | null;
    newPassword?: string | null;
    confirmPassword?: string | null;
  }>({});

  // File Upload State for KTM & KTP
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const ktmInputRef = useRef<HTMLInputElement | null>(null);
  const ktpInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Profile Update Submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileError("Nama lengkap tidak boleh kosong");
      return;
    }
    setProfileError(null);

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        institution: institution.trim() || undefined,
      });
      toast.success("Profil berhasil diperbarui!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal memperbarui profil pengguna."
      );
    }
  };

  // Handle Password Change Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      currentPassword?: string | null;
      newPassword?: string | null;
      confirmPassword?: string | null;
    } = {};

    if (!currentPassword) {
      errors.currentPassword = "Password saat ini wajib diisi";
    }

    if (!newPassword) {
      errors.newPassword = "Password baru wajib diisi";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password baru minimal 8 karakter";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Konfirmasi password baru wajib diisi";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Konfirmasi password tidak cocok dengan password baru";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success("Password berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal memperbarui password akun.";
      toast.error(msg);
      if (msg.toLowerCase().includes("saat ini") || msg.toLowerCase().includes("lama") || msg.toLowerCase().includes("current")) {
        setPasswordErrors({ currentPassword: msg });
      }
    }
  };

  // Handle Document File Selection and Upload
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "KTM" | "KTP_PASSPORT_SIM",
    docTitle: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so user can re-select same file name if needed
    e.target.value = "";

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingDocType(type);
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file);

    try {
      await uploadDocMutation.mutateAsync(formData);
      toast.success(
        `${docTitle} berhasil diunggah! Dokumen sedang ditinjau admin.`
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Gagal mengunggah berkas ${docTitle}.`
      );
    } finally {
      setUploadingDocType(null);
    }
  };

  // Find user docs by type
  const ktmDoc = userDocuments.find((d) => d.type === "KTM");
  const ktpDoc = userDocuments.find(
    (d) => d.type === "KTP_PASSPORT_SIM" || d.type === "KTP"
  );
  const twibbonDoc = userDocuments.find((d) => d.type === "TWIBBON");
  const storyDoc = userDocuments.find((d) => d.type === "SHARE_STORY");

  const renderDocBadge = (status?: string) => {
    const upper = status?.toUpperCase();
    if (upper === "APPROVE" || upper === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
          <CheckCircle2 className="w-3 h-3" /> VERIFIED
        </span>
      );
    }
    if (upper === "REVIEW" || upper === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
          <Clock className="w-3 h-3" /> REVIEWING
        </span>
      );
    }
    if (upper === "REJECT" || upper === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
          <XCircle className="w-3 h-3" /> REJECTED
        </span>
      );
    }
    return (
      <span className="bg-surface text-text-secondary border border-border text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
        EMPTY
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Kelola informasi profil akun, keamanan kata sandi, dan status verifikasi berkas administrasi.
        </p>
      </div>

      {/* Grid 2 Column: Left Profile & Password, Right Verification Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (6 Cols): Profile & Password Forms */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Profile Information */}
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <User className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Informasi Profil
              </h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (profileError) setProfileError(null);
                  }}
                  className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                    profileError
                      ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                      : "border-border focus:border-accent"
                  }`}
                />
                {profileError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{profileError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Institusi / Universitas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Universitas Indonesia / Institut Teknologi Bandung"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-text-secondary/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                    Alamat Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.email || ""}
                    className="w-full bg-surface/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-text-secondary cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                    Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.role || "PESERTA"}
                    className="w-full bg-surface/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-text-secondary cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 h-9 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Profil</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Card 2: Security & Password Change */}
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <Lock className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Ganti Kata Sandi
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Password Saat Ini <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrors.currentPassword)
                      setPasswordErrors((prev) => ({ ...prev, currentPassword: null }));
                  }}
                  className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                    passwordErrors.currentPassword
                      ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                      : "border-border focus:border-accent"
                  }`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordErrors.currentPassword}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Password Baru <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword)
                      setPasswordErrors((prev) => ({ ...prev, newPassword: null }));
                  }}
                  className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                    passwordErrors.newPassword
                      ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                      : "border-border focus:border-accent"
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordErrors.newPassword}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Konfirmasi Password Baru <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword)
                      setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                    passwordErrors.confirmPassword
                      ? "border-rose-500/60 bg-rose-500/5 focus:border-rose-500"
                      : "border-border focus:border-accent"
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  variant="outline"
                  className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-5 h-9 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column (6 Cols): Verification Documents */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-accent" />
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Dokumen Verifikasi Akun
                </h2>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Unggah berkas identitas Anda untuk validasi kelayakan pendaftaran dan verifikasi status mahasiswa aktif.
            </p>

            {/* Hidden Real File Inputs */}
            <input
              type="file"
              ref={ktmInputRef}
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) =>
                handleFileChange(e, "KTM", "Kartu Tanda Mahasiswa (KTM)")
              }
            />
            <input
              type="file"
              ref={ktpInputRef}
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) =>
                handleFileChange(e, "KTP_PASSPORT_SIM", "KTP / Identitas Diri")
              }
            />

            <div className="space-y-4">
              {/* Document 1: KTM */}
              <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <span>Kartu Tanda Mahasiswa (KTM)</span>
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Bukti identitas mahasiswa aktif perguruan tinggi (JPG, PNG, PDF maks 5MB).
                    </p>
                  </div>

                  {renderDocBadge(ktmDoc?.status)}
                </div>

                {/* Rejection Reason */}
                {(ktmDoc?.status?.toUpperCase() === "REJECT" ||
                  ktmDoc?.status?.toUpperCase() === "REJECTED") &&
                  ktmDoc?.rejectionReason && (
                    <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        <strong>Ditolak:</strong> {ktmDoc.rejectionReason}
                      </span>
                    </p>
                  )}

                {/* File Info & Upload Action */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs font-mono">
                  {ktmDoc?.fileUrl ? (
                    <a
                      href={ktmDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline inline-flex items-center gap-1 truncate max-w-[180px] sm:max-w-[220px]"
                    >
                      <span className="truncate">
                        {ktmDoc.fileUrl.split("/").pop() || "Lihat KTM"}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-text-secondary">Belum ada file diunggah</span>
                  )}

                  {ktmDoc?.status?.toUpperCase() === "APPROVE" ||
                  ktmDoc?.status?.toUpperCase() === "APPROVED" ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terverifikasi</span>
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingDocType === "KTM"}
                      onClick={() => ktmInputRef.current?.click()}
                      className="bg-card hover:bg-card-hover border-border text-white text-[11px] font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {uploadingDocType === "KTM" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-accent" />
                          <span>{ktmDoc?.fileUrl ? "Ganti File" : "Upload KTM"}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Document 2: KTP / Paspor / SIM */}
              <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      <span>KTP / Identitas Diri (Paspor / SIM)</span>
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Bukti kewarganegaraan & identitas resmi peserta (JPG, PNG, PDF maks 5MB).
                    </p>
                  </div>

                  {renderDocBadge(ktpDoc?.status)}
                </div>

                {/* Rejection Reason */}
                {(ktpDoc?.status?.toUpperCase() === "REJECT" ||
                  ktpDoc?.status?.toUpperCase() === "REJECTED") &&
                  ktpDoc?.rejectionReason && (
                    <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        <strong>Ditolak:</strong> {ktpDoc.rejectionReason}
                      </span>
                    </p>
                  )}

                {/* File Info & Upload Action */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs font-mono">
                  {ktpDoc?.fileUrl ? (
                    <a
                      href={ktpDoc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline inline-flex items-center gap-1 truncate max-w-[180px] sm:max-w-[220px]"
                    >
                      <span className="truncate">
                        {ktpDoc.fileUrl.split("/").pop() || "Lihat Identitas"}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-text-secondary">Belum ada file diunggah</span>
                  )}

                  {ktpDoc?.status?.toUpperCase() === "APPROVE" ||
                  ktpDoc?.status?.toUpperCase() === "APPROVED" ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terverifikasi</span>
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingDocType === "KTP_PASSPORT_SIM"}
                      onClick={() => ktpInputRef.current?.click()}
                      className="bg-card hover:bg-card-hover border-border text-white text-[11px] font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {uploadingDocType === "KTP_PASSPORT_SIM" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-accent" />
                          <span>{ktpDoc?.fileUrl ? "Ganti File" : "Upload KTP"}</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Twibbon & Share Story Sync Box */}
              <div className="p-4 rounded-xl bg-surface/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-text-secondary flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-accent" />
                    <span>Tautan Twibbon & Share Story</span>
                  </span>
                  <Link
                    href="/peserta/team"
                    className="text-[11px] text-accent hover:underline font-mono"
                  >
                    Buka Halaman Tim →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface/60 border border-white/5 flex items-center justify-between">
                    <span className="text-text-secondary text-[11px]">Twibbon</span>
                    {renderDocBadge(twibbonDoc?.status)}
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface/60 border border-white/5 flex items-center justify-between">
                    <span className="text-text-secondary text-[11px]">Share Story</span>
                    {renderDocBadge(storyDoc?.status)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
