"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/accessibility";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const containerRef = useRef<HTMLDivElement>(null);
  const requestedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useGSAP(
    () => {
      if (typeof window === "undefined" || prefersReducedMotion()) return;
      gsap.from(".auth-anim", {
        y: 20,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
      });
    },
    { scope: containerRef }
  );

  useEffect(() => {
    // Guard against React StrictMode double-invoke: the token is single-use.
    if (!token || requestedRef.current) return;
    requestedRef.current = true;

    apiClient
      .get("/api/auth/verify-email", { params: { token } })
      .then(() => {
        setStatus("success");
        toast.success("Email verified successfully!");
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(getErrorMessage(error, "Failed to verify email."));
      });
  }, [token]);

  const isInvalid = !token;
  const shownError = isInvalid
    ? "Invalid or missing verification link."
    : errorMessage;

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

      {/* my-auto, bukan flex-1: flex-1 memakai flex-basis 0 sehingga anaknya
          dipatok setinggi viewport — kalau isinya lebih tinggi, isinya meluber
          dan dipotong overflow-hidden tanpa bisa di-scroll. */}
      <div
        ref={containerRef}
        className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-6"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-center">
          {isInvalid || status === "error"
            ? "VERIFIKASI GAGAL"
            : status === "success"
              ? "EMAIL TERVERIFIKASI"
              : "VERIFIKASI EMAIL"}
        </h1>
        <p className="text-center text-[0.8rem] text-white/60 mt-1 mb-4">
          {isInvalid || status === "error"
            ? "Link verifikasinya tidak bisa dipakai."
            : status === "success"
              ? "Akunmu sudah aktif. Silakan masuk untuk lanjut."
              : "Sebentar, link verifikasimu sedang diperiksa."}
        </p>

        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#111318] p-6 sm:p-8 auth-anim">
          {isInvalid || status === "error" ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-white/70">{shownError}</p>
              <Link href="/login">
                <button className="w-full h-10 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
                  Masuk ke Login
                </button>
              </Link>
              <Link
                href="/register"
                className="block text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                Kirim ulang link verifikasi
              </Link>
            </div>
          ) : status === "success" ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-white/70">
                Akunmu sudah aktif. Silakan masuk untuk lanjut ke dashboard.
              </p>
              <Link href="/login">
                <button className="w-full h-10 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
                  Masuk ke Login
                </button>
              </Link>
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-2.5 py-4 text-sm text-white/60"
              role="status"
              aria-live="polite"
            >
              <Loader2
                className="h-4 w-4 animate-spin text-white/60"
                aria-hidden
              />
              <span>Memverifikasi email kamu...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-black"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-8 w-8 animate-spin text-white/60" aria-hidden />
          <span className="sr-only">Memuat halaman verifikasi...</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
