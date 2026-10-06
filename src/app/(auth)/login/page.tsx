"use client";

import { useState } from "react";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaGlobe } from "react-icons/fa6";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/auth/login", data);
      const { user, accessToken } = response.data.data;
      if (!accessToken || !user) throw new Error("Invalid response");
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName}!`);

      const role = user.role?.toUpperCase();
      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "JURI" || role === "JUDGE")
        router.push("/juri/dashboard");
      else router.push("/peserta/dashboard");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
          WELCOME BACK!
        </h1>
        <p className="text-center text-xs text-white/60 mt-1 mb-4">
          Input your email and password, let's continue your journey!
        </p>

        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_60px_rgba(255,255,255,0.08)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label htmlFor="email" className="text-xs text-white/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
                className="mt-1 w-full h-10 rounded-full border border-white/30 bg-transparent px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-xs text-white/70">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="w-full h-10 rounded-full border border-white/30 bg-transparent px-5 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/70 transition-colors"
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

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Forgot password?{" "}
                <span className="underline underline-offset-2 text-white/80">
                  Click here
                </span>
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full h-10 rounded-full bg-white text-[#7C83BC] text-sm font-semibold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-white/90 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Login"
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
            className="cursor-pointer w-full h-10 rounded-full bg-[#2E5CFF] hover:bg-[#2448D9] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
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
            Doesn't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-white underline underline-offset-4 hover:text-white/80"
            >
              Register
            </Link>
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-24 pb-6 text-xs text-white/50">
        <span>©2026 SEVENT. All Rights Reserved</span>
        <div className="flex items-center gap-3">
          {[FaWhatsapp, FaInstagram, FaGlobe].map((Icon, i) => (
            <a
              key={i}
              href="#"
              aria-label="social"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:bg-white/80 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
