"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

/**
 * Logout bersama untuk seluruh role: hapus cookie refresh token di server,
 * reset auth store lokal, bersihkan cache React Query agar akun berikutnya
 * tidak pernah melihat data akun sebelumnya, lalu arahkan ke halaman login.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Tetap bersihkan sesi lokal walau request server gagal.
    } finally {
      clearAuth();
      queryClient.clear();
      router.push("/login");
    }
  };
}

