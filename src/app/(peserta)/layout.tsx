"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  LayoutDashboard,
  Users,
  UploadCloud,
  Megaphone,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function PesertaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: storeUser, clearAuth } = useAuthStore();
  const { data: userMe, isLoading: isUserLoading } = useUserMe();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const currentUser = userMe || storeUser;

  // Protection Guard: Ensure user is logged in as PESERTA
  useEffect(() => {
    if (!isUserLoading && currentUser) {
      if (currentUser.role !== "PESERTA" && currentUser.role !== "ADMIN") {
        toast.error("Access denied. Peserta portal is restricted to participant accounts.");
        router.push("/login");
      }
    }
  }, [currentUser, isUserLoading, router]);

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully.");
    router.push("/login");
  };

  const navItems = [
    {
      label: "Overview",
      href: "/peserta/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Team",
      href: "/peserta/team",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Submission",
      href: "/peserta/submission",
      icon: <UploadCloud className="w-4 h-4" />,
    },
    {
      label: "Announcements",
      href: "/peserta/announcements",
      icon: <Megaphone className="w-4 h-4" />,
    },
  ];

  const bottomNavItems = [
    {
      label: "Settings",
      href: "/peserta/settings",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Help & FAQ",
      href: "/peserta/help",
      icon: <HelpCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex overflow-x-hidden">
      {/* Sidebar Desktop (Fixed Left) */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-surface border-r border-border p-5 fixed top-0 bottom-0 left-0 z-40">
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-accent group-hover:scale-105 transition-transform shadow-md shadow-primary/10">
              <Code2 className="w-5 h-5 text-accent" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              SEVENT <span className="text-primary">X</span>
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-text-secondary mb-2">
              MAIN MENU
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/peserta/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white font-semibold shadow-md shadow-primary/20"
                      : "text-text-secondary hover:text-white hover:bg-card-hover"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>

          {/* View Rules CTA Box */}
          <div className="bg-card/70 border border-white/10 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-accent">
              <BookOpen className="w-4 h-4" />
              <span className="font-display text-xs font-bold text-white">Guidebook & Rules</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Pelajari syarat dan ketentuan komplit kompetisi SEVENT X.
            </p>
            <Link href="/" target="_blank" className="block pt-1">
              <Button
                variant="outline"
                className="w-full bg-surface hover:bg-card border-border text-xs text-accent font-semibold h-8 rounded-lg"
              >
                View Rules
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Secondary Links & User Profile Card */}
        <div className="space-y-4 pt-4 border-t border-border/60">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-card text-white font-semibold"
                      : "text-text-secondary hover:text-white hover:bg-card-hover"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="bg-card border border-border p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="w-9 h-9 rounded-lg border border-border">
                <AvatarImage src={currentUser?.avatar || undefined} alt={currentUser?.name || "User"} />
                <AvatarFallback className="bg-primary/20 text-accent font-bold text-xs">
                  {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "PS"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.name || "Alex Septiadi"}
                </p>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-accent/40 text-accent font-mono">
                  PESERTA
                </Badge>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-surface transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-accent" />
          <span className="font-display text-base font-extrabold text-white">SEVENT X</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-text-secondary hover:text-white border border-border bg-card"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-surface/95 backdrop-blur-xl pt-20 px-6 pb-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <nav className="space-y-2">
              <p className="text-xs font-mono font-semibold uppercase text-text-secondary mb-2">NAVIGASI</p>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    pathname === item.href ? "bg-primary text-white font-bold" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <nav className="space-y-2 pt-4 border-t border-border">
              {bottomNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 rounded-xl border border-border">
                <AvatarImage src={currentUser?.avatar || undefined} />
                <AvatarFallback className="bg-primary/20 text-accent font-bold text-xs">
                  {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "PS"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-white">{currentUser?.name || "Alex Septiadi"}</p>
                <p className="text-xs text-text-secondary">{currentUser?.email || "peserta@seventx.id"}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-danger/40 text-danger hover:bg-danger/10">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Workspace Area */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8 md:p-10 pt-20 md:pt-10 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
