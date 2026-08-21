"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send reset link.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#B8C4FF]">
      <div
        ref={formRef}
        className="max-w-lg w-full px-6 space-y-6 text-center z-10 opacity-0"
      >
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-extrabold text-[#1B224C]">
            Reset Password
          </h1>
          <p className="text-[#1B224C] font-semibold text-sm px-4 leading-relaxed">
            Enter the email associated with your account. We'll send you
            instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <div className="space-y-2 text-left">
            <Input
              type="email"
              placeholder="Email"
              className="bg-transparent border border-[#3C4A8A]/50 text-[#1B224C] placeholder:text-[#1B224C]/60 font-medium h-14 rounded-md focus:border-[#1B224C] transition-colors"
              {...register("email")}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-b from-[#41518D] to-[#25305B] hover:opacity-90 text-white font-semibold h-14 rounded-md shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={navigateToLogin}
          className="text-[#1B224C] text-sm font-semibold hover:underline pt-4"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
