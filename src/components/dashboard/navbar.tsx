"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Code2,
  LayoutPanelLeft,
  Users,
  FileUp,
  Megaphone,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
  UploadCloud,
  FileCheck,
  Trophy,
  Calendar,
  Newspaper,
} from "lucide-react";

type Role = "juri" | "admin" | "peserta";

type NavbarType = {
  role: Role;
  children: ReactNode;
};

const NAV_ITEMS: Record<
  Role,
  { url: string; name: string; icon: React.ReactElement }[]
> = {
  peserta: [
    {
      url: "/peserta/dashboard",
      name: "Overview",
      icon: <LayoutPanelLeft className="w-5 h-5" />,
    },
    {
      url: "/peserta/team",
      name: "Team",
      icon: <Users className="w-5 h-5" />,
    },
    {
      url: "/peserta/submission",
      name: "Submission",
      icon: <FileUp className="w-5 h-5" />,
    },
    {
      url: "/peserta/announcements",
      name: "Announcements",
      icon: <Megaphone className="w-5 h-5" />,
    },
  ],
  juri: [
    {
      url: "/juri/dashboard",
      name: "Overview",
      icon: <LayoutPanelLeft className="w-5 h-5" />,
    },
    {
      url: "/juri/team",
      name: "Team",
      icon: <Users className="w-5 h-5" />,
    },
    {
      url: "/juri/announcements",
      name: "Announcements",
      icon: <Megaphone className="w-5 h-5" />,
    },
  ],
  admin: [
    {
      url: "/admin/dashboard",
      name: "Overview",
      icon: <LayoutPanelLeft className="w-5 h-5" />,
    },
    {
      url: "/admin/teams",
      name: "Teams & Payment",
      icon: <Users className="w-5 h-5" />,
    },
    {
      url: "/admin/documents",
      name: "User Documents",
      icon: <FileCheck className="w-5 h-5" />,
    },
    {
      url: "/admin/competitions",
      name: "Competitions",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      url: "/admin/timeline",
      name: "Timeline",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      url: "/admin/news",
      name: "News & Articles",
      icon: <Newspaper className="w-5 h-5" />,
    },
    {
      url: "/admin/results",
      name: "Publish Results",
      icon: <Megaphone className="w-5 h-5" />,
    },
  ],
};

export default function NavbarDashboard({ role, children }: NavbarType) {
  const currentLinks = NAV_ITEMS[role] || NAV_ITEMS.peserta;
  const pathname = usePathname();
  const pageTitle = currentLinks.find((link) => link.url === pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user: storeUser } = useAuthStore();
  const { data: userMe } = useUserMe();
  const currentUser = userMe || storeUser;
  const userName = currentUser?.name || currentUser?.email || "name user";

  // tutup menu mobile otomatis tiap kali pindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // kunci scroll body selama menu mobile terbuka
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="w-full min-h-screen bg-background text-text-primary flex relative">
      {/* Desktop Top Title Bar (Fixed Right of Sidebar) */}
      <header className="hidden lg:flex fixed z-30 top-0 right-0 left-64 items-center justify-between px-8 py-4 bg-[#040E21]/90 backdrop-blur-md border-b border-border/80 text-white shadow-sm">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">
          {pageTitle?.name || (role === "admin" ? "Admin Control Panel" : "Competition Dashboard")}
        </h1>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          {role !== "admin" && (
            <Link href={role === "juri" ? "/juri/help" : "/peserta/help"}>
              <button
                className="p-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white transition-colors cursor-pointer"
                title="Help & FAQ"
                aria-label="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </Link>
          )}

          {role === "peserta" && (
            <Link href="/peserta/submission">
              <Button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 h-9 rounded-lg flex items-center gap-2 shadow-sm cursor-pointer">
                <UploadCloud className="w-4 h-4" />
                <span>Submit Project</span>
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-border/40">
            <Avatar className="w-8 h-8 rounded-lg border border-border">
              <AvatarImage src={currentUser?.avatar || undefined} />
              <AvatarFallback className="bg-primary/30 text-accent font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">
                {role === "juri" && !userName.startsWith("Dr.") ? `Dr. ${userName}` : userName}
              </p>
              <span className="text-[10px] font-mono text-text-secondary uppercase block">
                {role === "juri" ? "SENIOR JUDGE" : role === "admin" ? "ADMINISTRATOR" : "PARTICIPANT"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex w-64 bg-[#040E21] border-r border-border/80 flex-col justify-between p-5 h-screen fixed z-40 top-0 left-0">
        <div className="space-y-6">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white tracking-wider">
              7X
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Sevent <span className="text-primary">X</span>
            </span>
          </Link>

          {/* Main Nav Items */}
          <nav className="space-y-1">
            {currentLinks.map((item) => {
              const isActive =
                pathname === item.url ||
                (item.url !== "/peserta/dashboard" &&
                  item.url !== "/juri/dashboard" &&
                  item.url !== "/admin/dashboard" &&
                  pathname.startsWith(item.url));
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/25 text-accent font-semibold shadow-sm"
                      : "text-text-secondary hover:text-white hover:bg-card-hover"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: View Rules Button, Settings/FAQ & User Card */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          {/* View Rules Button */}
          <Link href="/guidebook.pdf" target="_blank" className="block">
            <Button
              variant="outline"
              className="cursor-pointer w-full bg-[#040E21] hover:bg-[#1B235E] border border-border text-white text-xs font-semibold h-10 rounded-xl transition-all"
            >
              View Rules
            </Button>
          </Link>

          {/* Secondary Links: Settings & FAQ (Hidden for Admin) */}
          {role !== "admin" && (
            <nav className="space-y-1 pt-1 border-t border-border/40">
              <Link
                href={role === "juri" ? "/juri/settings" : "/peserta/settings"}
                className={`flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname.endsWith("/settings")
                    ? "text-accent bg-card font-semibold"
                    : "text-text-secondary hover:text-white hover:bg-card-hover"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <Link
                href={role === "juri" ? "/juri/help" : "/peserta/help"}
                className={`flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  pathname.endsWith("/help")
                    ? "text-accent bg-card font-semibold"
                    : "text-text-secondary hover:text-white hover:bg-card-hover"
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span>FAQ</span>
              </Link>
            </nav>
          )}

          {/* User Profile Card */}
          <div className="bg-[#040E21] border border-border/80 p-3 rounded-xl flex items-center gap-3">
            <Avatar className="w-8 h-8 rounded-lg border border-border shrink-0">
              <AvatarImage
                src={currentUser?.avatar || undefined}
                alt={userName}
              />
              <AvatarFallback className="bg-primary/30 text-accent font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-white truncate">
                {role === "juri" && !userName.startsWith("Dr.") ? `Dr. ${userName}` : userName}
              </p>
              {role === "juri" && (
                <span className="text-[10px] font-mono font-bold text-accent block">
                  SENIOR JUDGE
                </span>
              )}
              {role === "admin" && (
                <span className="text-[10px] font-mono font-bold text-rose-400 block">
                  SYSTEM ADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3 bg-[#040E21] backdrop-blur-md border-b border-border text-white">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-accent" />
          <span className="font-display text-base font-bold text-white">
            Sevent X
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          className="p-2 rounded-xl bg-card border border-border text-text-secondary hover:text-white"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden fixed inset-0 z-30 h-screen w-full bg-surface/95 backdrop-blur-xl pt-20 px-6 pb-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-card border border-border/80 p-3.5 rounded-xl flex items-center gap-3">
              <Avatar className="w-9 h-9 rounded-lg border border-border shrink-0">
                <AvatarImage src={currentUser?.avatar || undefined} />
                <AvatarFallback className="bg-primary/30 text-accent font-bold text-xs">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden text-left">
                <p className="text-sm font-bold text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {currentUser?.email || ""}
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5 w-full">
              {currentLinks.map((link) => {
                const isActive = pathname === link.url;
                return (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive
                          ? "bg-primary/25 text-accent font-bold"
                          : "text-text-secondary hover:text-white hover:bg-card-hover"
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {role !== "admin" && (
              <div className="space-y-2 pt-4 border-t border-border">
                <Link
                  href={role === "juri" ? "/juri/settings" : "/peserta/settings"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <Link
                  href={role === "juri" ? "/juri/help" : "/peserta/help"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>FAQ</span>
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <Link href="/guidebook.pdf" target="_blank" className="block">
              <Button
                variant="outline"
                className="w-full bg-surface border-border text-white text-xs font-semibold h-10 rounded-xl"
              >
                View Rules
              </Button>
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content Workspace Container */}
      <main className="flex-1 lg:ml-64 pt-20 lg:pt-24 p-6 sm:p-8 md:p-10 lg:px-12 pb-16 min-h-screen bg-linear-to-b from-[#1B235E] via-[#10163A] to-[#05070D]">
        <div className="max-w-[1500px] mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
