"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";

export default function DashboardRootRedirect() {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading } = useUserMe();
  const currentUser = userMe || storeUser;

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const role = currentUser.role?.toUpperCase();
      if (role === "JURI" || role === "JUDGE") {
        router.replace("/juri/dashboard");
      } else if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/peserta/dashboard");
      }
    }
  }, [currentUser, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#05070D] flex items-center justify-center p-6 text-center text-text-secondary text-xs">
      Loading dashboard...
    </div>
  );
}
