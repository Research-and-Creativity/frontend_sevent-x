"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { initiateGoogleLogin } from "@/lib/google-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  setAuthTransition,
  getAuthTransition,
  clearAuthTransition,
} from "@/lib/auth-transition";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const formRef = useRef<HTMLDivElement>(null);
  const transitionLayerRef = useRef<HTMLDivElement>(null);
  const circleImgRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Animasi Masuk yang Bersih
  useGSAP(() => {
    const form = formRef.current;
    const layer = transitionLayerRef.current;
    const circle = circleImgRef.current;

    if (!form || !layer || !circle) return;

    const incomingTransition = getAuthTransition();

    // --------------------------------------------------
    // NORMAL LOGIN LOAD
    // --------------------------------------------------
    if (!incomingTransition) {
      gsap.set(form, {
        opacity: 0,
        x: -30,
      });

      gsap.to(form, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: 0.1,
        ease: "power3.out",
      });

      return;
    }

    // --------------------------------------------------
    // REGISTER -> LOGIN
    // --------------------------------------------------
    if (incomingTransition === "to-login") {
      gsap.set(layer, {
        display: "flex",
      });

      gsap.set(circle, {
        x: "28%",
        y: 0,
      });

      gsap.set(form, {
        opacity: 0,
        x: -25,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          clearAuthTransition();

          gsap.set(layer, {
            display: "none",
          });
        },
      });

      tl.to(
        form,
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        0.15,
      );

      return;
    }

    // Safety fallback
    clearAuthTransition();

    gsap.set(form, {
      opacity: 0,
      x: -30,
    });

    gsap.to(form, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  // Transisi Mulus ke Register
  const navigateToRegister = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const layer = transitionLayerRef.current;
    const circle = circleImgRef.current;
    const form = formRef.current;

    if (!layer || !circle || !form) return;

    setAuthTransition("to-register");

    const tl = gsap.timeline({
      onComplete: () => {
        router.push("/register");
      },
    });

    tl.set(layer, {
      display: "flex",
    });

    // Posisi awal = posisi lingkaran kanan
    gsap.set(circle, {
      x: "28%",
      y: 0,
    });

    tl.to(
      form,
      {
        opacity: 0,
        x: -20,
        duration: 0.35,
        ease: "power2.out",
      },
      0,
    );

    // KANAN -> TENGAH
    tl.to(
      circle,
      {
        x: "0%",
        duration: 0.9,
        ease: "power3.inOut",
      },
      0,
    );

    // Sedikit hold di tengah
    tl.to({}, { duration: 0.08 });

    // TENGAH -> KIRI
    tl.to(circle, {
      x: "-28%",
      duration: 0.9,
      ease: "power3.inOut",
    });

    // Baru pindah halaman
    tl.to({}, { duration: 0.01 });
  };

  const navigateToForgot = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => router.push("/forgot-password"),
    });
    tl.set(transitionLayerRef.current, { display: "block" })
      .to(formRef.current, { opacity: 0, duration: 0.2 }, 0)
      .fromTo(
        circleImgRef.current,
        { x: "35vw", scale: 1 },
        {
          x: "0vw",
          scale: 2.2,
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0,
      );
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/auth/login", data);
      const { user, accessToken } = response.data;
      if (!accessToken || !user) throw new Error("Invalid response");
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.fullName || user.username}!`);

      const role = user.role;
      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "JURI") router.push("/juri/dashboard");
      else router.push("/peserta/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#05070F] overflow-hidden relative">
      {/* LAYER TRANSISI FIXED (Menghilangkan kedip dan memastikan presisi tengah) */}
      <div
        ref={transitionLayerRef}
        className="fixed inset-0 z-[100] pointer-events-none hidden overflow-hidden items-center justify-center bg-[#05070F]"
      >
        <div
          ref={circleImgRef}
          className="
              absolute
              w-[110vh]
              h-[110vh]
              rounded-full
              overflow-hidden
              shadow-2xl
              shrink-0
              will-change-transform
            "
        >
          <img
            src="/images/auth-collage.jpg"
            className="w-full h-full object-cover"
            alt=""
          />
        </div>
      </div>

      {/* Form Kiri */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 z-10">
        <div ref={formRef} className="max-w-md w-full mx-auto space-y-6">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white mb-8">
            Welcome Back <span className="text-[#00E5FF]">To SEVENT</span>
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Input
                type="text"
                placeholder="username"
                className="bg-transparent border border-white/20 text-white placeholder:text-white/40 h-12 rounded-md focus:border-[#00E5FF] transition-colors"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Password"
                className="bg-transparent border border-white/20 text-white placeholder:text-white/40 h-12 rounded-md focus:border-[#00E5FF] transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={navigateToForgot}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Forget Your password?{" "}
                <span className="text-[#00E5FF] underline underline-offset-2">
                  Reset password
                </span>
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2E5CFF] to-[#1E3BB3] hover:opacity-90 text-white font-medium h-12 rounded-md shadow-lg transition-all mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Logging
                  in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#05070F] px-4 text-xs text-white/40">or</span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <div className="space-y-5">
            <Button
              type="button"
              onClick={initiateGoogleLogin}
              className="w-full bg-white hover:bg-gray-100 text-[#05070F] font-bold h-12 rounded-md flex items-center justify-center gap-2 transition-colors"
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
              <span>Continue with Google</span>
            </Button>

            <div className="text-center">
              <p className="text-sm text-white/50">
                Dont have an account?{" "}
                <button
                  onClick={navigateToRegister}
                  className="font-semibold text-white hover:text-[#00E5FF] transition-colors underline underline-offset-2"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lingkaran Kanan Normal */}
      <div className="hidden lg:flex w-1/2 items-center justify-end relative z-0">
        <div className="w-[110vh] h-[110vh] rounded-full overflow-hidden shadow-2xl translate-x-[28%] shrink-0">
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
