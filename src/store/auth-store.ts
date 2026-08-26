import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user: User, accessToken: string) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),
      setAccessToken: (accessToken: string) =>
        set({
          accessToken,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "seventx-auth-user",
      storage: createJSONStorage(() => localStorage),
      // Persist ONLY user profile (non-sensitive), NEVER accessToken (XSS protection)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
