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
  UploadCloud,
  FileCheck,
  X,
  Building2,
  CreditCard,
  FileText,
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
    // Wait a tick for session restoration
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

    // Validate size (max 5MB)
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

    // Validation
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
      setCurrentStep("Mengunggah dokumen KTM / Student Card...");
      try {
        const ktmFormData = new FormData();
        ktmFormData.append("type", "KTM");
        ktmFormData.append("file", ktmFile);

        await apiClient.post("/api/user/documents", ktmFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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

        await apiClient.post("/api/user/documents", ktpFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          "Gagal mengunggah file KTP / Passport / SIM.";
        throw new Error(`[KTP/Passport/SIM] ${msg}`);
      }

      // All 3 succeeded!
      updateUser({ institution: institution.trim() });
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });

      toast.success("Profil dan dokumen identitas berhasil dilengkapi!");

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
      {/* Decorative Left Circle / Collage */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-start relative z-0">
        <div className="w-[110vh] h-[110vh] rounded-full overflow-hidden shadow-2xl translate-x-[-28%] shrink-0 border-r border-white/10">
          <img
            src="/images/auth-collage.jpg"
            className="w-full h-full object-cover"
            alt="SEVENT X Collage"
          />
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-20 z-50 relative py-10 overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Lengkapi Profil <span className="text-[#00E5FF]">Kamu</span>
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Lengkapi data institusi dan unggah dokumen verifikasi identitas
              untuk memenuhi syarat partisipasi kompetisi SEVENT X.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-3 text-danger text-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Terjadi Kesalahan:</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Asal Institusi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00E5FF]" />
                <span>Asal Institusi / Universitas / Sekolah</span>
                <span className="text-rose-400">*</span>
              </label>
              <Input
                id="institution"
                type="text"
                disabled={isLoading}
                placeholder="Contoh: Universitas Indonesia / SMAN 1"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-card/60 border border-white/20 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all"
              />
            </div>

            {/* Field 2: Upload KTM/Student Card */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00E5FF]" />
                <span>Upload KTM / Kartu Pelajar</span>
                <span className="text-rose-400">*</span>
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
                  className="border-2 border-dashed border-white/20 hover:border-[#00E5FF] hover:bg-card-hover/40 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:text-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      Pilih file KTM / Kartu Pelajar
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      JPG, PNG, atau PDF (Maks. 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-[#00E5FF]/40 bg-[#00E5FF]/5 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden text-left">
                      <p className="text-xs font-semibold text-white truncate">
                        {ktmFile.name}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {(ktmFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setKtmFile(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Field 3: Upload KTP/Passport/SIM */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00E5FF]" />
                <span>Upload KTP / Passport / SIM</span>
                <span className="text-rose-400">*</span>
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
                  className="border-2 border-dashed border-white/20 hover:border-[#00E5FF] hover:bg-card-hover/40 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:text-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      Pilih file KTP / Passport / SIM
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      JPG, PNG, atau PDF (Maks. 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-[#00E5FF]/40 bg-[#00E5FF]/5 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden text-left">
                      <p className="text-xs font-semibold text-white truncate">
                        {ktpFile.name}
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        {(ktpFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setKtpFile(null)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-rose-400 transition-colors cursor-pointer"
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
              className="w-full bg-linear-to-r from-[#2E5CFF] to-[#1E3BB3] hover:from-[#2448D9] hover:to-[#172d8a] text-white font-semibold h-12 rounded-xl shadow-lg mt-6 transition-all cursor-pointer"
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
