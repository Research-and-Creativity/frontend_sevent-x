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

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    institution: z.string().min(2, "Institution / school name is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useGSAP(() => {
    const form = formRef.current;
    const layer = transitionLayerRef.current;
    const circle = circleImgRef.current;

    if (!form || !layer || !circle) return;

    const transition = getAuthTransition();

    if (transition === "to-register") {
      gsap.set(layer, {
        display: "flex",
      });

      // HARUS sama dengan posisi terakhir
      gsap.set(circle, {
        x: "-28%",
        y: 0,
      });

      gsap.set(form, {
        opacity: 0,
        x: 25,
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

    // normal register
    gsap.fromTo(
      form,
      {
        opacity: 0,
        x: 30,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
      },
    );
  }, []);

  const navigateToLogin = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const layer = transitionLayerRef.current;
    const circle = circleImgRef.current;
    const form = formRef.current;

    if (!layer || !circle || !form) return;

    setAuthTransition("to-login");

    const tl = gsap.timeline({
      onComplete: () => {
        router.push("/login");
      },
    });

    tl.set(layer, {
      display: "flex",
    });

    // Posisi awal = lingkaran kiri
    gsap.set(circle, {
      x: "-28%",
      y: 0,
    });

    // Form keluar
    tl.to(
      form,
      {
        opacity: 0,
        x: 20,
        duration: 0.35,
        ease: "power2.out",
      },
      0,
    );

    // KIRI -> TENGAH
    tl.to(
      circle,
      {
        x: "0%",
        duration: 0.9,
        ease: "power3.inOut",
      },
      0,
    );

    // Hold
    tl.to({}, { duration: 0.08 });

    // TENGAH -> KANAN
    tl.to(circle, {
      x: "28%",
      duration: 0.9,
      ease: "power3.inOut",
    });
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const regPayload = {
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        institution: data.institution,
      };
      const res = await apiClient.post("/api/auth/register", regPayload);
      let user = res.data?.user;
      let accessToken = res.data?.accessToken;
      if (!accessToken || !user) {
        const loginRes = await apiClient.post("/api/auth/login", {
          username: data.username,
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
    <div className="min-h-screen flex justify-end bg-[#05070F] overflow-hidden relative">
      {/* LAYER TRANSISI FIXED */}
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

      {/* Lingkaran Kiri Normal */}
      <div className="hidden lg:flex w-1/2 items-center justify-start relative z-0">
        <div className="w-[110vh] h-[110vh] rounded-full overflow-hidden shadow-2xl -translate-x-[28%] shrink-0">
          <img
            src="/images/auth-collage.jpg"
            className="w-full h-full object-cover"
            alt="Collage"
          />
        </div>
      </div>

      {/* Form Kanan */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 z-10 py-10 overflow-y-auto">
        <div ref={formRef} className="max-w-md w-full mx-auto space-y-6">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white mb-6">
            Create Your <span className="text-[#00E5FF]">Account</span>
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {[
              { id: "fullName", placeholder: "name" },
              { id: "email", type: "email", placeholder: "email" },
              { id: "username", placeholder: "username" },
              { id: "password", type: "password", placeholder: "password" },
              {
                id: "confirmPassword",
                type: "password",
                placeholder: "comfirm password",
              },
              { id: "institution", placeholder: "from institute" },
            ].map((field) => (
              <div key={field.id} className="w-full">
                <Input
                  id={field.id}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  className="bg-transparent border border-white/20 text-white placeholder:text-white/40 h-12 rounded-md focus:border-[#00E5FF] transition-colors"
                  {...register(field.id as keyof RegisterFormValues)}
                />
                {errors[field.id as keyof RegisterFormValues] && (
                  <p className="text-[10px] text-red-400 mt-1">
                    {errors[field.id as keyof RegisterFormValues]?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="relative border border-white/20 rounded-md p-3 text-center hover:border-[#00E5FF] transition-colors cursor-pointer">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-xs text-white/50">
                  upload ktm/student card
                </span>
              </div>
              <div className="relative border border-white/20 rounded-md p-3 text-center hover:border-[#00E5FF] transition-colors cursor-pointer">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-xs text-white/50">upload id card</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2E5CFF] hover:bg-[#2448D9] text-white font-medium h-12 rounded-md shadow-lg mt-4 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#05070F] px-4 text-xs text-white/40">or</span>
            <div className="border-t border-white/10 w-full" />
          </div>

          <div className="space-y-4">
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
                Already have an account?{" "}
                <button
                  onClick={navigateToLogin}
                  className="font-semibold text-[#00E5FF] hover:text-white transition-colors underline underline-offset-2"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
