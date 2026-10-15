"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { initiateGoogleLogin } from "@/lib/google-auth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { SocialLinks } from "@/components/social-links";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const username = data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      const payload = {
        fullName: data.fullName,
        email: data.email,
        username,
        password: data.password,
        institution: "SEVENT X",
      };
      await apiClient.post("/api/auth/register", payload);
      setRegisteredEmail(data.email);
      toast.success("Account created! Please check your email to verify.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Registration failed."));
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    try {
      await apiClient.post("/api/auth/resend-verification", {
        email: registeredEmail,
      });
      toast.success("Verification email sent again.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not send email."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* background pattern */}
      <Image
        src="/assets/image/pattern-landing2.svg"
        alt=""
        width={1440}
        height={1712}
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
      />
      {/* big watermark logos */}
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

      {/* top-left brand */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-20 flex items-center gap-3"
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

      {/* form area */}
      {/* my-auto, bukan flex-1: flex-1 memakai flex-basis 0 sehingga anaknya
          dipatok setinggi viewport — kalau isinya lebih tinggi, isinya meluber
          dan dipotong overflow-hidden tanpa bisa di-scroll. */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
          {registeredEmail ? "CEK EMAIL KAMU" : "CREATE YOUR ACCOUNT"}
        </h1>
        <p className="text-center text-xs text-white/60 mt-1 mb-4">
          {registeredEmail
            ? "Satu langkah lagi untuk mengaktifkan akunmu."
            : "Create your Account and start your journey here!"}
        </p>

        {registeredEmail ? (
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_60px_rgba(255,255,255,0.08)] text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
              <MailCheck className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Link verifikasi sudah dikirim
            </h2>
            <p className="mx-auto mt-4 w-fit max-w-full truncate rounded-full border border-border bg-surface px-4 py-2 font-mono text-xs text-accent">
              {registeredEmail}
            </p>
            <p className="mt-3 text-xs text-white/60">
              Buka emailnya dan klik link di dalamnya untuk mengaktifkan akun —
              sebelum itu akunmu belum aktif. Kalau emailnya tidak ada, cek
              folder Spam atau Promosi.
            </p>
            <Link href="/login" className="mt-6 block">
              <button className="cursor-pointer w-full h-10 rounded-full bg-white text-background font-semibold hover:bg-white/90 transition-all">
                Masuk ke Login
              </button>
            </Link>
            <button
              type="button"
              onClick={onResend}
              disabled={isResending}
              className="cursor-pointer mt-4 text-xs font-semibold text-white/70 underline underline-offset-4 hover:text-white transition-colors disabled:opacity-60"
            >
              {isResending ? "Mengirim ulang..." : "Kirim ulang email verifikasi"}
            </button>
            <button
              type="button"
              onClick={() => setRegisteredEmail(null)}
              className="cursor-pointer mt-3 text-xs font-semibold text-white/50 hover:text-white transition-colors"
            >
              Ganti alamat email
            </button>
          </div>
        ) : (
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {[
              { id: "fullName", label: "Name", type: "text" },
              { id: "email", label: "Email", type: "email" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="text-xs text-white/70">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  placeholder={f.label}
                  {...register(f.id as keyof RegisterFormValues)}
                  className="mt-2 w-full h-10 rounded-full border border-white/30 bg-transparent px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                />
                {errors[f.id as keyof RegisterFormValues] && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors[f.id as keyof RegisterFormValues]?.message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label htmlFor="password" className="text-xs text-white/70">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="w-full h-10 rounded-full border border-white/30 bg-transparent px-5 text-sm pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-xs text-white/70"
              >
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                  className="w-full h-10 rounded-full border border-white/30 bg-transparent px-5 text-sm pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label="Toggle confirm password"
                >
                  {showConfirm ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full h-10 mt-2 rounded-full bg-white text-background font-semibold  hover:bg-white/90 shadow-[0_0_20px_rgba(36,72,217,0.5)] transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-transparent px-4 text-xs text-white/40">
              or
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <button
            type="button"
            onClick={initiateGoogleLogin}
            className="cursor-pointer w-full h-10 rounded-full bg-[#2E5CFF] shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:bg-[rgb(36,72,217)] text-white font-semibold flex items-center justify-center gap-2 transition-colors "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-white/50 mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
            >
              Login
            </Link>
          </p>
        </div>
        )}
      </div>

      {/* footer */}
      <div className="relative z-10 flex items-center justify-between px-4 md:px-8 pb-6 text-xs text-white/50">
        <span>©2026 SEVENT. All Rights Reserved</span>
        <div className="flex items-center gap-3">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}
