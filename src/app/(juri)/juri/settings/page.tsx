"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Lock, Award, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function JuriSettingsPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe } = useUserMe();
  const currentUser = userMe || storeUser;

  const defaultName = currentUser?.name
    ? currentUser.name.startsWith("Dr.")
      ? currentUser.name
      : `Dr. ${currentUser.name}`
    : "Dr. Abed Nego";

  // Profile Edit State (fullName only for Juri)
  const [fullName, setFullName] = useState(defaultName);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      toast.error("Nama lengkap wajib diisi.");
      return;
    }
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Profil juri berhasil diperbarui!");
    }, 600);
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Password lama dan password baru wajib diisi.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok.");
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Judge Account Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Kelola informasi profil dewan juri dan keamanan kata sandi akun Anda.
        </p>
      </div>

      {/* 2 Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Profile Information */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Profile Information
              </h2>
            </div>
            <span className="border border-primary/40 text-accent font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md">
              SENIOR JUDGE
            </span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Full Name & Title
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
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.email || "judge@seventx.id"}
                className="w-full bg-surface/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-text-secondary cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Assigned Category Track
              </label>
              <input
                type="text"
                disabled
                value="Advanced AI & Engineering / Web Development"
                className="w-full bg-surface/50 border border-border/50 rounded-xl px-4 py-2.5 text-xs text-text-secondary cursor-not-allowed font-mono"
              />
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

        {/* Card 2: Security & Change Password */}
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
    </div>
  );
}
