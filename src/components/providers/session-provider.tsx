"use client";

import { useEffect, useState } from "react";
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-accent/30 flex items-center justify-center shadow-lg shadow-accent/10 animate-pulse">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="font-mono text-xs text-text-secondary tracking-widest uppercase animate-pulse">
            Loading SEVENT X...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
