"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="h-screen flex bg-[#0B1021] overflow-hidden relative">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-2 text-left auth-anim">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Create New <span className="text-[#00E5FF]">Password</span>
            </h1>
            <p className="text-sm text-white/50">
              Enter your new password below to recover your account.
            </p>
          </div>

          {!token ? (
            <div className="bg-[#0E1438]/60 border border-danger/30 rounded-xl p-6 space-y-4 text-center auth-anim">
              <p className="text-sm text-danger font-medium">Invalid or missing reset token.</p>
              <Link href="/forgot-password">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white text-xs px-6 py-2 rounded-lg transition-colors mt-2">
                  Request New Link
                </Button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="bg-[#0E1438]/60 border border-success/30 rounded-xl p-6 space-y-4 text-center auth-anim">
              <div className="w-12 h-12 rounded-full bg-success/20 border border-success/40 flex items-center justify-center mx-auto text-success">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Reset Complete!</h3>
              <p className="text-xs text-white/60">Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1 relative auth-anim">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  className="bg-[#0E1438]/60 border-[#2E5CFF]/40 text-white placeholder:text-white/40 h-12 focus:border-[#00E5FF] rounded-lg transition-colors pr-10"
                  {...register("newPassword")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.newPassword && <p className="text-xs text-danger pt-1">{errors.newPassword.message}</p>}
              </div>

              <div className="space-y-1 relative auth-anim">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="bg-[#0E1438]/60 border-[#2E5CFF]/40 text-white placeholder:text-white/40 h-12 focus:border-[#00E5FF] rounded-lg transition-colors pr-10"
                  {...register("confirmNewPassword")}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.confirmNewPassword && <p className="text-xs text-danger pt-1">{errors.confirmNewPassword.message}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#2E5CFF] to-[#1E3BB3] hover:from-[#2448D9] hover:to-[#172d8a] text-white font-semibold h-12 rounded-lg shadow-lg auth-anim transition-all">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Resetting...</> : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="text-center pt-2 auth-anim">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 h-full items-center justify-end relative z-0">
        <div className="w-[110vh] h-[110vh] rounded-full overflow-hidden shadow-2xl translate-x-[28%] shrink-0">
          <img src="/images/auth-collage.jpg" alt="SEVENT Event Collage" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1021] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" /></div>}>
      <ResetPasswordFormContent />
    </Suspense>
  );
}