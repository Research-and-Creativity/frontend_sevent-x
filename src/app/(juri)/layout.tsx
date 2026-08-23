"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import NavbarDashboard from "@/components/dashboard/navbar";
import { toast } from "sonner";

export default function JuriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();

  const currentUser = userMe || storeUser;

  // Protection Guard: Ensure logged in user is JURI or ADMIN
  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role !== "JURI" && currentUser.role !== "ADMIN") {
        toast.error("Access denied. Judge portal is restricted to judge accounts.");
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

  return <NavbarDashboard role="juri">{children}</NavbarDashboard>;
}
