"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const setAuth = useAuthStore((state) => state.setAuth);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const isExecuting = useRef(false);

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code provided by Google.");
      return;
    }
    if (isExecuting.current) return;
    isExecuting.current = true;

    const processGoogleLogin = async () => {
      try {
        const response = await apiClient.post("/api/auth/google", { code });
        const { user, accessToken } = response.data;
        if (!accessToken || !user)
          throw new Error("Invalid response from Google auth endpoint");

        setAuth(user, accessToken);
        setStatus("success");
        toast.success(
          `Google auth successful! Welcome, ${user.fullName || user.username}.`,
        );

        const role = user.role;
        setTimeout(() => {
          if (role === "ADMIN") router.push("/admin/dashboard");
          else if (role === "JURI") router.push("/juri/dashboard");
          else router.push("/peserta/dashboard");
        }, 1200);
      } catch (err: any) {
        setStatus("error");
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Google authentication failed. Please try again.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    };
    processGoogleLogin();
  }, [code, router, setAuth]);

  return (
    <div className="min-h-screen flex bg-[#0B1021] overflow-hidden relative">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative z-10 text-center">
        <div className="max-w-md w-full mx-auto space-y-6">
          {status === "loading" && (
            <div className="space-y-6 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-[#0E1438] border border-[#00E5FF]/40 flex items-center justify-center mx-auto shadow-lg shadow-[#00E5FF]/10">
                <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-white">
                  Authenticating...
                </h2>
                <p className="text-sm text-white/50">
                  Verifying your credentials with Google
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-success/20 border border-success/40 flex items-center justify-center mx-auto text-success shadow-lg shadow-success/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-white">
                  Authentication Successful
                </h2>
                <p className="text-sm text-white/50">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 bg-[#0E1438]/60 border border-danger/30 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center mx-auto text-danger">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold text-white">
                  Login Failed
                </h3>
                <p className="text-sm text-danger">{errorMessage}</p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-[#2E5CFF] to-[#1E3BB3] hover:from-[#2448D9] hover:to-[#172d8a] text-white font-semibold h-11 rounded-lg"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 absolute right-0 top-0 bottom-0 pointer-events-none z-0 overflow-hidden items-center">
        <div className="w-[140%] aspect-square absolute right-[-40%] rounded-full overflow-hidden border-l-[12px] border-white/5 shadow-2xl">
          <img
            src="/images/auth-collage.jpg"
            alt="SEVENT Event Collage"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1021] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
