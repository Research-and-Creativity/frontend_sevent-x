"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
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
        className="absolute -right-40 top-[-10%] w-[620px] h-auto opacity-[0.08] pointer-events-none"
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
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
          EMAIL VERIFICATION
        </h1>
        <p className="text-center text-xs text-white/60 mt-1 mb-4">
          Confirming your SEVENT X account
        </p>

        <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_60px_rgba(255,255,255,0.08)] text-center auth-anim">
          {isInvalid || status === "error" ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-400/20 border border-red-400/40 flex items-center justify-center mx-auto text-red-400">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                Verification Failed
              </h3>
              <p className="text-xs text-white/60">{shownError}</p>
              <p className="text-[11px] text-white/40">
                The link may have expired. You can request a new one from the
                register page, and remember to check your Spam/Promotions
                folder.
              </p>
              <Link href="/login">
                <button className="w-full h-10 rounded-full border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                  Back to Login
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full h-10 rounded-full text-white/50 text-xs font-semibold hover:text-white transition-colors">
                  Request new link
                </button>
              </Link>
            </div>
          ) : status === "success" ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-400/20 border border-green-400/40 flex items-center justify-center mx-auto text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                Email Verified!
              </h3>
              <p className="text-xs text-white/60">
                Your account is now active. You can log in to continue.
              </p>
              <Link href="/login">
                <button className="w-full h-10 rounded-full bg-white text-background text-sm font-semibold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-white/90 transition-all">
                  Go to Login
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-white/70" />
              <p className="text-sm text-white/60">Verifying your email...</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-8 pb-6 text-xs text-white/50">
        <span>©2026 SEVENT. All Rights Reserved</span>
        <div className="flex items-center gap-3">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1021] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
