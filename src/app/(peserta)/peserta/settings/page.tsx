"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, FileCheck2, Upload, CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface UserDocItem {
  id: string;
  type: "KTM" | "KTP" | "TWIBBON" | "SHARE_STORY";
  title: string;
  description: string;
  status: "APPROVE" | "REVIEW" | "REJECT" | "NOT_UPLOADED";
  fileName?: string;
  updatedAt?: string;
}

export default function PesertaSettingsPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe } = useUserMe();
  const currentUser = userMe || storeUser;

  // Profile Edit State
  const [fullName, setFullName] = useState(currentUser?.fullName || "Budi Santoso");
  const [institution, setInstitution] = useState(currentUser?.institution || "Universitas Indonesia");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Verification Documents State
  const [documents, setDocuments] = useState<UserDocItem[]>([
    {
      id: "doc-1",
      type: "KTM",
      title: "Kartu Tanda Mahasiswa (KTM)",
      description: "Bukti identitas mahasiswa aktif institusi perguruan tinggi.",
      status: "APPROVE",
      fileName: "KTM_BudiSantoso_UI.pdf",
      updatedAt: "2026-10-10",
    },
    {
      id: "doc-2",
      type: "KTP",
      title: "Kartu Tanda Penduduk (KTP)",
      description: "Bukti kewarganegaraan & tanggal lahir peserta.",
      status: "APPROVE",
      fileName: "KTP_BudiSantoso.pdf",
      updatedAt: "2026-10-10",
    },
    {
      id: "doc-3",
      type: "TWIBBON",
      title: "Bukti Upload Twibbon",
      description: "Tangkapan layar postingan Twibbon resmi SEVENT X 2026.",
      status: "REVIEW",
      fileName: "Twibbon_Post_Screenshot.png",
      updatedAt: "2026-10-12",
    },
    {
      id: "doc-4",
      type: "SHARE_STORY",
      title: "Bukti Share Poster & Story",
      description: "Tangkapan layar membagikan poster acara ke 3 grup WhatsApp.",
      status: "NOT_UPLOADED",
    },
  ]);

  // Handle Profile Update Submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Profil berhasil diperbarui!");
    }, 600);
  };

  // Handle Password Change Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Password lama dan password baru wajib diisi!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok!");
      return;
    }
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password berhasil diubah!");
    }, 600);
  };

  // Handle Document Upload Simulation
  const handleUploadDoc = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: "REVIEW",
              fileName: `Doc_${doc.type}_Updated.pdf`,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : doc
      )
    );
    toast.success("Dokumen berhasil diunggah! Menunggu verifikasi admin.");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
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
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <User className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Profile Information
              </h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                    Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.email || "user@example.com"}
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
                  disabled={isSavingProfile}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 h-9 rounded-xl cursor-pointer"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Card 2: Security & Password Change */}
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <Lock className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Change Password
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Password Baru
                </label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  variant="outline"
                  className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-5 h-9 rounded-xl cursor-pointer"
                >
                  {isChangingPassword ? "Memproses..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column (6 Cols): Verification Documents */}
        <div className="lg:col-span-6">
          <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-accent" />
                <h2 className="font-display text-lg font-bold text-white tracking-tight">
                  Verification Documents
                </h2>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Dokumen administrasi peserta wajib diunggah untuk verifikasi keabsahan tim sebelum babak penjurian.
            </p>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface/50 border border-white/10 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="font-display font-bold text-sm text-white">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-text-secondary">{doc.description}</p>
                    </div>

                    {/* Status Badge */}
                    {doc.status === "APPROVE" && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                    {doc.status === "REVIEW" && (
                      <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
                        <Clock className="w-3 h-3" /> REVIEWING
                      </span>
                    )}
                    {doc.status === "REJECT" && (
                      <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
                        <XCircle className="w-3 h-3" /> REJECTED
                      </span>
                    )}
                    {doc.status === "NOT_UPLOADED" && (
                      <span className="bg-surface text-text-secondary border border-border text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md shrink-0">
                        EMPTY
                      </span>
                    )}
                  </div>

                  {/* Document Info & Upload Button */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs font-mono">
                    <span className="text-text-secondary truncate max-w-50">
                      {doc.fileName || "Belum ada file disubmit"}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => handleUploadDoc(doc.id)}
                      className="bg-card hover:bg-card-hover border-border text-white text-[11px] font-semibold h-8 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-accent" />
                      <span>{doc.fileName ? "Ganti File" : "Upload"}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
