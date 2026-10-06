"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { initiateGoogleLogin } from "@/lib/google-auth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Globe, Share2, MessageCircle } from "lucide-react";

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
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      const res = await apiClient.post("/api/auth/register", payload);
      let user = res.data?.user;
      let accessToken = res.data?.accessToken;
      if (!accessToken || !user) {
        const loginRes = await apiClient.post("/api/auth/login", {
          username,
          password: data.password,
        });
        user = loginRes.data?.user;
        accessToken = loginRes.data?.accessToken;
      }
      if (user && accessToken) setAuth(user, accessToken);
      toast.success("Account created successfully!");
      router.push("/peserta/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed.");
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
      <Image src="/assets/image/logo-putih.png" alt="" width={1000} height={1262} className="absolute -right-40 top-[-10%] w-[620px] h-auto opacity-[0.08] pointer-events-none" />

      {/* top-left brand */}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
        <Image src="/assets/image/logo-putih.png" alt="SEVENT X" width={1000} height={1262} className="w-8 h-auto" />
        <span className="font-display text-xl font-extrabold tracking-wide">SEVENT X</span>
      </div>

      {/* form card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-sm p-8 sm:p-10 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
            CREATE YOUR ACCOUNT
          </h1>
          <p className="text-center text-sm text-white/60 mt-2 mb-8">
            Create your Account and start your journey here!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[
              { id: "fullName", label: "Name", type: "text" },
              { id: "email", label: "Email", type: "email" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="text-sm text-white/70">{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  placeholder={f.label}
                  {...register(f.id as keyof RegisterFormValues)}
                  className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                />
                {errors[f.id as keyof RegisterFormValues] && (
                  <p className="text-xs text-red-400 mt-1">{errors[f.id as keyof RegisterFormValues]?.message}</p>
                )}
              </div>
            ))}

            <div>
              <label htmlFor="password" className="text-sm text-white/70">Password</label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white" aria-label="Toggle password">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm text-white/70">Confirm Password</label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                  className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white" aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-white text-[#7C83BC] font-semibold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-white/90 transition-all disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-transparent px-4 text-xs text-white/40">or</span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <button
            type="button"
            onClick={initiateGoogleLogin}
            className="w-full h-12 rounded-full bg-[#2E5CFF] hover:bg-[#2448D9] text-white font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-white underline underline-offset-4 hover:text-white/80">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* footer */}
      <div className="relative z-10 flex items-center justify-between px-8 pb-6 text-xs text-white/50">
        <span>©2026 SEVENT. All Rights Reserved</span>
        <div className="flex items-center gap-3">
          {[Globe, Share2, MessageCircle].map((Icon, i) => (
            <a key={i} href="#" aria-label="social" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-white/80 transition-colors">
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
