"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const response = await apiClient.post("/api/auth/refresh-token");
        const resData = response.data?.data || response.data;
        const user = resData?.user;
        const accessToken = resData?.accessToken;

        if (accessToken) {
          if (user) {
            useAuthStore.getState().setAuth(user, accessToken);
          } else {
            useAuthStore.getState().setAccessToken(accessToken);
          }
        }
      } catch {
        // Refresh token is missing or expired, proceed without active session
      } finally {
        if (isMounted) {
          setIsSessionReady(true);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isSessionReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070D]">
        {/* Pola background yang sama dengan halaman dashboard peserta/juri/admin */}
        <Image
          src="/assets/image/pattern-landing2.svg"
          alt=""
          width={1440}
          height={1712}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
          priority
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="relative h-12 w-auto animate-[pulse_2s_ease-in-out_infinite]">
            <Image
              src="/assets/image/logo-putih.png"
              alt="SEVENT X"
              width={1000}
              height={1262}
              className="h-full w-auto object-contain drop-shadow-[0_0_24px_rgba(125,140,255,0.45)]"
              priority
            />
          </div>

          {/* Glass card */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-10 py-7 backdrop-blur-xl">
            <div className="flex items-center gap-3 text-white/70">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="font-display text-sm font-semibold tracking-wide">
                Verifying your session...
              </span>
            </div>
            <p className="mt-2 text-center text-xs text-text-secondary">
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
