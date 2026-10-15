"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/accessibility";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const containerRef = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useGSAP(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;
    gsap.from(".auth-anim", {
      y: 20, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out",
    });
  }, { scope: containerRef });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Reset token is missing. Please request a new link.");
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/reset-password", { token, newPassword: data.newPassword });
      setIsSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => router.push("/login"), 2500);
    } catch (error: unknown) {
      const fallback =
        error instanceof Error && error.message
          ? error.message
          : "Failed to reset password.";
      toast.error(getErrorMessage(error, fallback));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      <Image src="/assets/image/pattern-landing2.svg" alt="" width={1440} height={1712} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
      <Image src="/assets/image/logo-putih.png" alt="" width={1000} height={1262} className="absolute -left-40 bottom-[-15%] w-[620px] h-auto opacity-[0.08] pointer-events-none" />
      <Image src="/assets/image/logo-putih.png" alt="" width={1000} height={1262} className="absolute -right-40 top-[-10%] w-[620px] h-auto opacity-[0.08] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-3">
        <Image src="/assets/image/logo-putih.png" alt="SEVENT X" width={1000} height={1262} className="w-8 h-auto" />
        <span className="font-display text-xl font-extrabold tracking-wide">SEVENT X</span>
      </Link>

      {/* my-auto, bukan flex-1: flex-1 memakai flex-basis 0 sehingga anaknya
          dipatok setinggi viewport — kalau isinya lebih tinggi, isinya meluber
          dan dipotong overflow-hidden tanpa bisa di-scroll. */}
      <div ref={containerRef} className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
          {!token
            ? "LINK TIDAK VALID"
            : isSuccess
              ? "PASSWORD TERSIMPAN"
              : "CREATE NEW PASSWORD"}
        </h1>
        <p className="text-center text-xs text-white/60 mt-1 mb-4">
          {!token
            ? "Link reset password ini tidak bisa dipakai."
            : isSuccess
              ? "Kamu akan diarahkan ke halaman login."
              : "Create your new password and make sure you remember it"}
        </p>

        <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
          {!token ? (
            <div className="space-y-4 text-center auth-anim">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
                <XCircle className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="font-display text-lg font-bold text-white">
                Link reset tidak valid
              </h2>
              <p className="text-xs text-white/60">
                Token reset tidak ada atau sudah kedaluwarsa. Minta link baru
                dari halaman lupa password.
              </p>
              <Link href="/forgot-password" className="block">
                <button className="w-full h-10 rounded-full bg-white text-background text-sm font-semibold hover:bg-white/90 transition-all">
                  Minta link baru
                </button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4 text-center auth-anim">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="font-display text-lg font-bold text-white">
                Password berhasil diganti
              </h2>
              <p className="text-xs text-white/60">
                Kamu akan diarahkan ke halaman login. Kalau tidak pindah, klik
                tombol di bawah.
              </p>
              <Link href="/login" className="block">
                <button className="w-full h-10 rounded-full bg-white text-background text-sm font-semibold hover:bg-white/90 transition-all">
                  Masuk sekarang
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="auth-anim">
                <label htmlFor="newPassword" className="text-xs text-white/70">New Password</label>
                <div className="relative mt-1">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className="w-full h-10 rounded-full border border-white/30 bg-transparent px-5 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                    {...register("newPassword")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-xs text-red-400 mt-1">{errors.newPassword.message}</p>}
              </div>

              <div className="auth-anim">
                <label htmlFor="confirmNewPassword" className="text-xs text-white/70">Confirm Password</label>
                <div className="relative mt-1">
                  <input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full h-10 rounded-full border border-white/30 bg-transparent px-5 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                    {...register("confirmNewPassword")}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmNewPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmNewPassword.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="w-full h-10 rounded-full bg-white text-background text-sm font-semibold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-white/90 transition-all auth-anim disabled:opacity-60">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save and Login"}
              </button>
            </form>
          )}

          <div className="text-center pt-4 auth-anim">
            <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> <span>Back to Login</span>
            </Link>
          </div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-black"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
          <span className="sr-only">Memuat halaman reset password…</span>
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}