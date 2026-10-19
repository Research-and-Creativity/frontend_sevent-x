"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { getErrorMessageWithDefault } from "@/lib/errors";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

// Style glass yang sama dengan halaman auth lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const setAuth = useAuthStore((state) => state.setAuth);

  const [result, setResult] = useState<{
    status: "loading" | "success" | "error";
    message: string;
  }>({ status: "loading", message: "" });
  const isExecuting = useRef(false);

  // Kode yang tidak ada langsung berstatus error, jadi diturunkan dari `code`
  // alih-alih diset dari dalam effect.
  const status = code ? result.status : "error";
  const errorMessage = code
    ? result.message
    : "Kode otorisasi Google tidak ditemukan.";

  useEffect(() => {
    if (!code) return;
    if (isExecuting.current) return;
    isExecuting.current = true;

    const processGoogleLogin = async () => {
      try {
        const response = await apiClient.post("/api/auth/google", { code });
        const { user, accessToken } = response.data.data;
        if (!accessToken || !user)
          throw new Error("Respon tidak valid dari server.");

        setAuth(user, accessToken);
        setResult({ status: "success", message: "" });
        toast.success(`Login berhasil! Selamat datang, ${user.fullName}.`);

        setTimeout(() => {
          const role = user.role;
          if (role === "ADMIN") router.push("/admin/dashboard");
          else if (role === "JURI") router.push("/juri/dashboard");
          else router.push("/peserta/dashboard");
        }, 800);
      } catch (err: unknown) {
        const msg = getErrorMessageWithDefault(
          err,
          "Autentikasi Google gagal. Silakan coba kembali."
        );
        setResult({ status: "error", message: msg });
        toast.error(msg);
      }
    };
    processGoogleLogin();
  }, [code, router, setAuth]);

  return (
    <div className={`${glass} mx-auto w-full max-w-md p-8 text-center`}>
      {status === "loading" && (
        <div className="relative space-y-4">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
            Verifikasi Akun Google
          </h1>
          <div className="flex items-center justify-center gap-2.5 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-[#7D8CFF]" aria-hidden />
            <span>Menghubungkan dan memverifikasi kredensial...</span>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="relative space-y-4">
          <p className="text-sm text-white">
            Autentikasi berhasil! Mengalihkan ke dashboard...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="relative space-y-5">
          <div className="space-y-1.5">
            <p className="font-semibold text-rose-400">Autentikasi Gagal</p>
            <p className="text-xs text-text-secondary">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 h-10 text-xs font-semibold text-black transition-colors hover:bg-white/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Halaman Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      <Image
        src="/assets/image/pattern-landing2.svg"
        alt=""
        width={1440}
        height={1712}
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
      />
      <Image
        src="/assets/image/logo-putih.png"
        alt=""
        width={1000}
        height={1262}
        className="absolute -left-40 bottom-[-15%] w-[620px] h-auto opacity-[0.08] pointer-events-none"
      />
      <Image
        src="/assets/image/logo-putih.png"
        alt=""
        width={1000}
        height={1262}
        className="absolute -right-50 top-[-50%] w-[620px] h-auto opacity-[0.08] pointer-events-none"
      />
      <Link
        href="/"
        className="absolute top-8 left-8 z-50 flex items-center gap-3"
      >
        <Image
          src="/assets/image/logo-putih.png"
          alt="SEVENT X"
          width={1000}
          height={1262}
          className="w-8 h-auto"
        />
        <span className="font-display text-xl font-extrabold tracking-wide">
          SEVENT X
        </span>
      </Link>

      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="flex items-center gap-3 text-white/70">
              <Loader2 className="h-4 w-4 animate-spin text-[#7D8CFF]" />
              <span className="font-mono text-xs tracking-wider uppercase">
                Memuat...
              </span>
            </div>
          </div>
        }
      >
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
          <GoogleCallbackContent />
        </div>
      </Suspense>
    </div>
  );
}
