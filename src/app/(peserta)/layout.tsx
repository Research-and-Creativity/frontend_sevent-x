"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useUserDocuments, useUserMe, useUserTeam } from "@/hooks/use-peserta";
import { toast } from "sonner";
import { LayoutGrid, LogOut, Medal, User, Menu, X } from "lucide-react";
import { useAnnouncementNotifications } from "@/hooks/use-peserta";

const mainLinks = [
  { href: "/peserta/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/peserta/profile", label: "Profile", icon: User },
  { href: "/peserta/competition", label: "Competition", icon: Medal },
];

// Navigasi sidebar yang dipakai dua kali: sidebar desktop (sticky) dan drawer
// mobile. Tautan aktif memakai pathname, sama seperti perilaku sidebar.
function SidebarContent({
  pathname,
  onNavigate,
  onLogout,
  unreadAnnouncements = 0,
  paymentRejected = false,
}: {
  pathname?: string;
  onNavigate?: () => void;
  onLogout: () => void;
  unreadAnnouncements?: number;
  paymentRejected?: boolean;
}) {
  return (
    <>
      <Link href="/peserta/dashboard" onClick={onNavigate} className="flex items-center gap-3 mb-10">
        <Image src="/assets/image/logo-putih.png" alt="SEVENT X" width={1000} height={1262} className="w-8 h-auto" />
        <span className="font-display text-xl font-extrabold">SEVENT X</span>
      </Link>
      <div className="flex flex-col justify-between h-full">
        <nav className="space-y-1">
          {mainLinks.map((l) => {
            // Pengumuman kini digabung ke Overview (menu Announcements sudah
            // dihapus), jadi badge unread menempel di menu Overview.
            const badge =
              l.href === "/peserta/dashboard" ? unreadAnnouncements : 0;
            // Badge merah tambahan saat bukti pembayaran perlu direvisi — supaya
            // leader/anggota notice tanpa harus buka halaman team dulu.
            const showPaymentDot =
              l.href === "/peserta/dashboard" && paymentRejected;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onNavigate}
                className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname?.startsWith(l.href) ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                <l.icon className="w-5 h-5" />
                <span className="flex-1">{l.label}</span>
                {badge > 0 && (
                  <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                {showPaymentDot && (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={onLogout}
          className="cursor-pointer flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </>
  );
}

export default function PesertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe, isLoading: isUserLoading } = useUserMe();
  const { unreadCount: unreadAnnouncements } = useAnnouncementNotifications();
  const {
    data: userTeam,
    isSuccess: isUserTeamLoaded,
    isFetching: isUserTeamFetching,
  } = useUserTeam();
  const {
    data: userDocuments = [],
    isSuccess: areUserDocumentsLoaded,
    isFetching: areUserDocumentsFetching,
  } = useUserDocuments();
  const previousDocumentRevisions = useRef<Set<string> | null>(null);
  const previousPaymentRevision = useRef<string | null | undefined>(undefined);
  const paymentRejected =
    userTeam?.paymentProof?.status?.toUpperCase() === "REJECT";
  const [isNavOpen, setIsNavOpen] = useState(false);
  const currentUser = userMe || storeUser;

  useEffect(() => {
    if (
      areUserDocumentsLoaded &&
      (!areUserDocumentsFetching || previousDocumentRevisions.current !== null)
    ) {
      const currentRevisions = new Set(
        userDocuments
          .filter((document) => document.status.toUpperCase() === "REJECT")
          .map(
            (document) =>
              `${document.id}:${document.lastRejectedAt ?? document.reviewCount ?? ""}`,
          ),
      );

      if (previousDocumentRevisions.current === null) {
        previousDocumentRevisions.current = currentRevisions;
      } else {
        const newRevisionCount = [...currentRevisions].filter(
          (revision) => !previousDocumentRevisions.current?.has(revision),
        ).length;

        if (newRevisionCount > 0) {
          toast.info(
            `Ada revisi baru pada ${newRevisionCount} dokumen. Cek Overview untuk detail.`,
          );
        }
        previousDocumentRevisions.current = currentRevisions;
      }
    }

    if (
      isUserTeamLoaded &&
      (!isUserTeamFetching || previousPaymentRevision.current !== undefined)
    ) {
      const paymentRevision =
        userTeam?.paymentProof?.status?.toUpperCase() === "REJECT"
          ? `${userTeam.paymentProof.id}:${userTeam.paymentProof.lastRejectedAt ?? userTeam.paymentProof.reviewCount ?? ""}`
          : null;

      if (previousPaymentRevision.current === undefined) {
        previousPaymentRevision.current = paymentRevision;
      } else {
        if (paymentRevision && paymentRevision !== previousPaymentRevision.current) {
          toast.info(
            "Ada revisi baru pada bukti pembayaran. Cek Overview untuk detail.",
          );
        }
        previousPaymentRevision.current = paymentRevision;
      }
    }
  }, [
    areUserDocumentsLoaded,
    areUserDocumentsFetching,
    isUserTeamLoaded,
    isUserTeamFetching,
    userDocuments,
    userTeam,
  ]);

  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role?.toUpperCase() !== "PESERTA") {
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
            <Image
              src="/assets/image/pattern-landing2.svg"
              alt=""
              width={1440}
              height={1712}
              className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
            />
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
                unreadAnnouncements={unreadAnnouncements}
                paymentRejected={paymentRejected}
              />
            </div>
          </div>
        </div>

      {/* Sidebar ditempel setinggi viewport supaya tidak ikut ter-scroll saat
          halaman konten panjang. min-h-0 wajib: tanpa itu flex item tidak mau
          menyusut sehingga nav yang panjang malah terpotong. */}
      <aside className="hidden md:flex md:sticky top-0 h-screen w-64 shrink-0 border-r border-white/10 p-6 flex flex-col bg-black shadow-[0_0_50px_rgba(125,140,255,0.4)] overflow-hidden">
        <Image
          src="/assets/image/pattern-landing2.svg"
          alt=""
          width={1440}
          height={1712}
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SidebarContent
            pathname={pathname}
            onLogout={() => router.push("/login")}
            unreadAnnouncements={unreadAnnouncements}
            paymentRejected={paymentRejected}
          />
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
