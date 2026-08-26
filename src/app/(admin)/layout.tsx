"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import NavbarDashboard from "@/components/dashboard/navbar";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();

  const currentUser = userMe || storeUser;

  // Protection Guard: Ensure logged in user is ADMIN
  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role !== "ADMIN") {
        toast.error("Access denied. Admin portal is restricted to administrator accounts.");
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

  return <NavbarDashboard role="admin">{children}</NavbarDashboard>;
}
