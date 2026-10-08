"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { toast } from "sonner";
import { LayoutGrid, LogOut, Medal, User } from "lucide-react";

export default function PesertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();
  const currentUser = userMe || storeUser;

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role?.toUpperCase() !== "ADMIN") {
        toast.error("Access denied.");
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

  const mainLinks = [
    { href: "/peserta/dashboard", label: "Overview", icon: LayoutGrid },
    { href: "/peserta/profile", label: "Profile", icon: User },
    { href: "/peserta/competition", label: "Competition", icon: Medal },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-white/10 p-6 flex flex-col bg-black shadow-[0_0_50px_rgba(125,140,255,0.4)] overflow-hidden">
        <Image
          src="/assets/image/pattern-landing2.svg"
          alt=""
          width={1440}
          height={1712}
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
        />
        <div className="relative z-10 flex flex-col flex-1">
          <Link href="/" className="flex items-center gap-3 mb-10">
            <Image
              src="/assets/image/logo-putih.png"
              alt="SEVENT X"
              width={1000}
              height={1262}
              className="w-8 h-auto"
            />
            <span className="font-display text-xl font-extrabold">
              SEVENT X
            </span>
          </Link>
          <div className="flex flex-col justify-between h-full">
            <nav className="space-y-1">
              {mainLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname?.startsWith(l.href) ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                >
                  <l.icon className="w-5 h-5" />
                  {l.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => router.push("/login")}
              className="cursor-pointer flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 relative p-8 overflow-x-hidden">
        <Image
          src="/assets/image/pattern-landing2.svg"
          alt=""
          width={1440}
          height={1712}
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
        />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
