"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-white/70">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span className="font-mono text-xs tracking-wider uppercase">
            Memverifikasi sesi...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
