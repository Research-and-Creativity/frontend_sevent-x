"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const setAuth = useAuthStore((state) => state.setAuth);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const isExecuting = useRef(false);

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMessage("Kode otorisasi Google tidak ditemukan.");
      return;
    }
    if (isExecuting.current) return;
    isExecuting.current = true;

    const processGoogleLogin = async () => {
      try {
        const response = await apiClient.post("/api/auth/google", { code });
        const { user, accessToken } = response.data.data;
        if (!accessToken || !user)
          throw new Error("Respon tidak valid dari server.");

        setAuth(user, accessToken);
        setStatus("success");
        toast.success(`Login berhasil! Selamat datang, ${user.fullName}.`);

        setTimeout(() => {
          if (!user.institution || user.institution.trim() === "") {
            router.push("/complete-profile");
          } else {
            const role = user.role;
            if (role === "ADMIN") router.push("/admin/dashboard");
            else if (role === "JURI") router.push("/juri/dashboard");
            else router.push("/peserta/dashboard");
          }
        }, 800);
      } catch (err: any) {
        setStatus("error");
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Autentikasi Google gagal. Silakan coba kembali.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    };
    processGoogleLogin();
  }, [code, router, setAuth]);

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      {/* Left Content Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 z-50 relative">
        <div className="max-w-md w-full mx-auto space-y-6">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white mb-2">
            Verifikasi <span className="text-accent">Akun Google</span>
          </h1>

          {status === "loading" && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Menghubungkan dan memverifikasi kredensial akun Google kamu...
              </p>
              <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl text-xs text-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" />
                <span className="font-mono">Memproses autentikasi...</span>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Autentikasi berhasil! Mengalihkan ke dashboard...</span>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-5">
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Autentikasi Gagal</span>
                </div>
                <p className="text-text-secondary text-[11px]">{errorMessage}</p>
              </div>

              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium h-12 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Halaman Login</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Right Circle */}
      <div className="hidden lg:flex w-1/2 h-full items-center justify-end relative z-0">
        <div className="w-[110vh] h-[110vh] rounded-full overflow-hidden translate-x-[28%] shrink-0">
          <img
            src="/images/auth-collage.jpg"
            className="w-full h-full object-cover"
            alt="Collage"
          />
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3 text-white/70">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span className="font-mono text-xs tracking-wider uppercase">
              Memuat...
            </span>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
