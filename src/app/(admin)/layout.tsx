"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { toast } from "sonner";
import {
  LayoutGrid,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Megaphone,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const mainLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/admin/teams", label: "Registered Team", icon: FileText },
  { href: "/admin/documents", label: "Verified Team", icon: CheckCircle2 },
];

const webLinks = [
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/announcement", label: "Announcement", icon: Megaphone },
];

// Navigasi sidebar yang dipakai dua kali: sidebar desktop (sticky) dan drawer
// mobile. Tautan aktif memakai pathname, sama seperti perilaku sidebar.
function SidebarContent({
  pathname,
  onNavigate,
  onLogout,
}: {
  pathname?: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3 mb-10">
        <Image src="/assets/image/logo-putih.png" alt="SEVENT X" width={1000} height={1262} className="w-8 h-auto" />
        <span className="font-display text-xl font-extrabold">SEVENT X</span>
      </Link>

      <nav className="space-y-1">
        {mainLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname?.startsWith(l.href) ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            <l.icon className="w-5 h-5" />
            {l.label}
          </Link>
        ))}
      </nav>

      <p className="mt-8 mb-2 text-[10px] tracking-widest text-white/40">
        WEB INFORMATION
      </p>
      <nav className="space-y-1">
        {webLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname?.startsWith(l.href) ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            <l.icon className="w-5 h-5" />
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log out
      </button>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const currentUser = userMe || storeUser;

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role?.toUpperCase() !== "ADMIN") {
        toast.error("Access denied.");
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Navigasi mobile: hamburger melayang + drawer slide-over dengan backdrop.
          Sidebar desktop (md ke atas) tetap sticky dan tidak berubah. */}
      <button
        onClick={() => setIsNavOpen(true)}
        aria-label={isNavOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className="fixed top-4 left-4 z-40 rounded-full border border-white/10 bg-black/70 p-2 text-white/80 backdrop-blur transition-colors hover:text-white md:hidden"
      >
        {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-out ${isNavOpen ? "visible" : "invisible"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
      >
        <div
          className={`absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm transition-all duration-300 ease-out ${isNavOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsNavOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 flex h-full w-64 flex-col overflow-hidden border-r border-white/10 bg-black p-6 shadow-[0_0_50px_rgba(125,140,255,0.4)] transition-all duration-300 ease-out ${isNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <Image src="/assets/image/pattern-landing2.svg" alt="" width={1440} height={1712} className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none" />
            <button
              onClick={() => setIsNavOpen(false)}
              aria-label="Tutup menu navigasi"
              className="absolute right-4 top-4 z-20 text-white/60 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
              <SidebarContent
                pathname={pathname}
                onNavigate={() => setIsNavOpen(false)}
                onLogout={() => router.push("/login")}
              />
            </div>
          </div>
        </div>

      {/* Sidebar ditempel setinggi viewport supaya tidak ikut ter-scroll saat
          halaman konten panjang. min-h-0 wajib: tanpa itu flex item tidak mau
          menyusut sehingga nav yang panjang malah terpotong. */}
      <aside className="hidden md:flex md:sticky top-0 h-screen w-64 shrink-0 border-r border-white/10 p-6 flex flex-col bg-black shadow-[0_0_50px_rgba(125,140,255,0.4)] overflow-hidden">
        <Image src="/assets/image/pattern-landing2.svg" alt="" width={1440} height={1712} className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SidebarContent
            pathname={pathname}
            onLogout={() => router.push("/login")}
          />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 relative p-8 overflow-x-hidden">
        <Image src="/assets/image/pattern-landing2.svg" alt="" width={1440} height={1712} className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
