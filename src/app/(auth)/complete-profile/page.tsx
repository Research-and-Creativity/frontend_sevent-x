"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  FileCheck,
  X,
  AlertCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function CompleteProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [institution, setInstitution] = useState("");
  const [ktmFile, setKtmFile] = useState<File | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ktmInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);

  // If user is not logged in, redirect to login
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && !user) {
        toast.error("Silakan login terlebih dahulu.");
        router.push("/login");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "KTM" | "KTP"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    if (type === "KTM") {
      setKtmFile(file);
    } else {
      setKtpFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!institution.trim()) {
      toast.error("Asal institusi / sekolah / universitas wajib diisi.");
      return;
    }
    if (!ktmFile) {
      toast.error("Dokumen KTM / Kartu Pelajar wajib diunggah.");
      return;
    }
    if (!ktpFile) {
      toast.error("Dokumen KTP / Passport / SIM wajib diunggah.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. PATCH /api/user/me with { institution }
      setCurrentStep("Menyimpan data institusi...");
      try {
        await apiClient.patch("/api/user/me", { institution: institution.trim() });
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          "Gagal menyimpan data institusi. Silakan periksa koneksi Anda.";
        throw new Error(`[Institusi] ${msg}`);
      }

      // 2. POST /api/user/documents with type=KTM
      setCurrentStep("Mengunggah dokumen KTM...");
      try {
        const ktmFormData = new FormData();
        ktmFormData.append("type", "KTM");
        ktmFormData.append("file", ktmFile);

        await apiClient.post("/api/user/documents", ktmFormData);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          "Gagal mengunggah file KTM. Pastikan format file sesuai.";
        throw new Error(`[KTM] ${msg}`);
      }

      // 3. POST /api/user/documents with type=KTP_PASSPORT_SIM
      setCurrentStep("Mengunggah dokumen KTP / Passport / SIM...");
      try {
        const ktpFormData = new FormData();
        ktpFormData.append("type", "KTP_PASSPORT_SIM");
        ktpFormData.append("file", ktpFile);

        await apiClient.post("/api/user/documents", ktpFormData);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          "Gagal mengunggah file KTP / Passport / SIM.";
        throw new Error(`[KTP/Passport/SIM] ${msg}`);
      }

      updateUser({ institution: institution.trim() });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });

      toast.success("Profil dan dokumen verifikasi berhasil dilengkapi!");

      const role = user?.role;
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "JURI") {
        router.push("/juri/dashboard");
      } else {
        router.push("/peserta/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
      setCurrentStep("");
    }
  };

  return (
    <div className="h-screen flex justify-end bg-background overflow-hidden relative">
      {/* Decorative Left Circle (Identical to Register / Login Split Screen) */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-start relative z-0">
        <div className="w-[110vh] h-[110vh] rounded-full overflow-hidden shadow-2xl translate-x-[-28%] shrink-0">
          <img
            src="/images/auth-collage.jpg"
            className="w-full h-full object-cover"
            alt="Collage"
          />
        </div>
      </div>

      {/* Right Form Container (Left-aligned form matching Login / Register) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 z-50 relative py-10 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white mb-2">
              Complete Your <span className="text-[#00E5FF]">Profile</span>
            </h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Lengkapi informasi institusi dan unggah dokumen verifikasi identitas
              untuk melanjutkan ke dashboard peserta.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-md bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Terjadi Kesalahan:</p>
                <p className="text-[11px] text-white/70 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Asal Institusi */}
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-medium">
                Asal Institusi / Universitas / Sekolah <span className="text-rose-400">*</span>
              </label>
              <Input
                id="institution"
                type="text"
                disabled={isLoading}
                placeholder="Contoh: Universitas Indonesia"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-transparent border border-white/20 text-white placeholder:text-white/40 h-12 rounded-md focus:border-[#00E5FF] transition-colors"
              />
            </div>

            {/* Field 2: Upload KTM/Student Card */}
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-medium">
                KTM / Kartu Pelajar <span className="text-rose-400">*</span>
              </label>

              <input
                ref={ktmInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={isLoading}
                onChange={(e) => handleFileChange(e, "KTM")}
              />

              {!ktmFile ? (
                <div
                  onClick={() => ktmInputRef.current?.click()}
                  className="border border-dashed border-white/20 hover:border-[#00E5FF] rounded-md p-3.5 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 group"
                >
                  <Upload className="w-4 h-4 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
                  <span className="text-xs text-white/60">
                    Upload KTM / Kartu Pelajar (Maks. 5MB)
                  </span>
                </div>
              ) : (
                <div className="border border-white/20 rounded-md p-3 flex items-center justify-between gap-3 bg-surface/40">
                  <div className="flex items-center gap-2.5 overflow-hidden text-left">
                    <FileCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-white truncate">
                        {ktmFile.name}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono">
                        {(ktmFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setKtmFile(null)}
                    className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Field 3: Upload KTP/Passport/SIM */}
            <div className="space-y-1">
              <label className="text-xs text-white/70 font-medium">
                KTP / Passport / SIM <span className="text-rose-400">*</span>
              </label>

              <input
                ref={ktpInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={isLoading}
                onChange={(e) => handleFileChange(e, "KTP")}
              />

              {!ktpFile ? (
                <div
                  onClick={() => ktpInputRef.current?.click()}
                  className="border border-dashed border-white/20 hover:border-[#00E5FF] rounded-md p-3.5 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 group"
                >
                  <Upload className="w-4 h-4 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
                  <span className="text-xs text-white/60">
                    Upload KTP / Passport / SIM (Maks. 5MB)
                  </span>
                </div>
              ) : (
                <div className="border border-white/20 rounded-md p-3 flex items-center justify-between gap-3 bg-surface/40">
                  <div className="flex items-center gap-2.5 overflow-hidden text-left">
                    <FileCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-white truncate">
                        {ktpFile.name}
                      </p>
                      <p className="text-[10px] text-white/40 font-mono">
                        {(ktpFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setKtpFile(null)}
                    className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-[#2E5CFF] to-[#1E3BB3] hover:opacity-90 text-white font-medium h-12 rounded-md shadow-lg mt-4 transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
                  <span>{currentStep || "Memproses..."}</span>
                </div>
              ) : (
                "Lengkapi Profil & Lanjutkan"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
