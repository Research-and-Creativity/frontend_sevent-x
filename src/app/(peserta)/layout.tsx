"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import NavbarDashboard from "@/components/dashboard/navbar";
import { toast } from "sonner";

export default function PesertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();

  const currentUser = userMe || storeUser;

  // Protection Guard: Ensure user is logged in as PESERTA or ADMIN
  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role !== "PESERTA" && currentUser.role !== "ADMIN") {
        toast.error("Access denied. Peserta portal is restricted to participant accounts.");
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

  return <NavbarDashboard role="peserta">{children}</NavbarDashboard>;
}
