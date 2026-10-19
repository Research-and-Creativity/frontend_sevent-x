"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/errors";
import { prefersReducedMotion } from "@/lib/accessibility";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Cukup Fade in Form (Kena lemparan efek transisi memudar dari halaman sebelumnya)
  useGSAP(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) {
      // Class `opacity-0` di JSX hanya ditimpa oleh inline style GSAP, jadi kalau
      // animasi dilewati form harus di-set opacity 1 atau tetap tak terlihat.
      gsap.set(formRef.current, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 },
    );
  }, []);

  const navigateToLogin = () => {
    // Saat kembali ke login, fade out lalu redirect
    gsap.to(formRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => router.push("/login"),
    });
  };

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", data);
      toast.success("Password reset instructions sent to your email!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send reset link."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* background pattern */}
      <Image src="/assets/image/pattern-landing2.svg" alt="" width={1440} height={1712} className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />
      {/* big watermark logos */}
      <Image src="/assets/image/logo-putih.png" alt="" width={1000} height={1262} className="absolute -left-40 bottom-[-15%] w-[620px] h-auto opacity-[0.08] pointer-events-none" />
      <Image src="/assets/image/logo-putih.png" alt="" width={1000} height={1262} className="absolute -right-50 top-[-50%] w-[620px] h-auto opacity-[0.08] pointer-events-none" />
      <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-3">
        <Image src="/assets/image/logo-putih.png" alt="SEVENT X" width={1000} height={1262} className="w-8 h-auto" />
        <span className="font-display text-xl font-extrabold tracking-wide">SEVENT X</span>
      </Link>
      {/* my-auto, bukan flex-1: flex-1 memakai flex-basis 0 sehingga anaknya
          dipatok setinggi viewport — kalau isinya lebih tinggi, isinya meluber
          dan dipotong overflow-hidden tanpa bisa di-scroll. */}
      <div ref={formRef} className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-6 opacity-0">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-center">RESET PASSWORD</h1>
        <p className="text-center text-[0.8rem] text-white/60 mt-1 mb-4">Enter the email associated with your account and we&apos;ll send you instructions to reset your password.</p>
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#111318] p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="text-xs text-white/70">Email</label>
              <input type="email" placeholder="Email" className="mt-1 w-full h-10 rounded-full border border-white/30 bg-transparent px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors" {...register("email")} />
            </div>
            <button type="submit" disabled={isLoading} className="cursor-pointer w-full h-10 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Reset Link"}
            </button>
          </form>
          <div className="text-center pt-4">
            <button type="button" onClick={navigateToLogin} className="cursor-pointer text-xs font-semibold text-white/50 hover:text-white transition-colors">Back to Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
