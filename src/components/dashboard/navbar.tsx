"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutPanelLeft,
  User,
  Menu,
  X,
  Users,
  FileUp,
  Megaphone,
  CircleQuestionMark,
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
      icon: <LayoutPanelLeft />,
    },
    {
      url: "/peserta/team",
      name: "Team",
      icon: <Users />,
    },
    {
      url: "/peserta/submission",
      name: "Submission",
      icon: <FileUp />,
    },
    {
      url: "/peserta/announcement",
      name: "Announcement",
      icon: <Megaphone />,
    },
  ],
  juri: [
    {
      url: "/juri/dashboard",
      name: "Overview",
      icon: <LayoutPanelLeft />,
    },
    {
      url: "/juri/team",
      name: "Team",
      icon: <Users />,
    },
    {
      url: "/juri/announcement",
      name: "Announcement",
      icon: <Megaphone />,
    },
  ],
  admin: [
    {
      url: "/juri/dashboard",
      name: "Overview",
      icon: <LayoutPanelLeft />,
    },
    {
      url: "/juri/team",
      name: "Team",
      icon: <Users />,
    },
    {
      url: "/juri/announcement",
      name: "Announcement",
      icon: <Megaphone />,
    },
  ],
};

export default function NavbarDashboard({ role, children }: NavbarType) {
  const currentLinks = NAV_ITEMS[role] || [];
  const pathname = usePathname();
  const pageTitle = currentLinks.find((link) => link.url === pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="w-full h-full relative">
      {/* desktop title bar */}
      <header className="hidden fixed z-30 top-0 right-0 left-0 w-auto lg:flex items-center justify-between pl-72 py-3 pr-4 bg-[#08132F] text-white">
        <h1 className="text-2xl font-semibold">{pageTitle?.name}</h1>
        <button className="cursor-pointer hover:bg-[#091636] flex items-center gap-3 p-3 rounded-full outline outline-blue-950 transition-colors">
          <User />
          Aldi Firmansyah
        </button>
      </header>

      {/* desktop sidebar */}
      <aside className="hidden w-64 bg-[#0a0f1d] border-r border-[#1e293b] lg:flex flex-col justify-between p-4 h-screen fixed z-30 top-0">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white tracking-wider">
              7X
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              SEVENT X
            </span>
          </div>
          <nav className="space-y-1">
            {currentLinks.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-[#1e293b] pt-4 space-y-1">
          <Link
            href={"#"}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
          >
            <CircleQuestionMark />
            <span>FAQ</span>
          </Link>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 bg-[#08132F] text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-sm tracking-wider">
            7X
          </div>
          <span className="text-base font-bold tracking-wide">
            {pageTitle?.name ?? "SEVENT X"}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isMobileMenuOpen}
          className="cursor-pointer p-2 rounded-lg hover:bg-[#091636] transition-colors"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* mobile nav overlay */}
      <nav
        className={`lg:hidden fixed inset-0 z-30 h-screen w-full bg-[#08132F] pt-24 px-6 pb-8 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button className="w-full cursor-pointer hover:bg-[#091636] flex items-center gap-3 mb-4 p-4 rounded-lg border border-blue-950 transition-colors">
          <User />
          Aldi Firmansyah
        </button>
        <ul className="flex flex-col gap-2 w-full flex-1 overflow-y-auto">
          {currentLinks.map((link) => {
            const isActive = pathname === link.url;
            return (
              <li key={link.url}>
                <Link
                  href={link.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href={"#"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            >
              <CircleQuestionMark />
              <span>FAQ</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="pt-20 lg:pl-64 lg:pt-16 relative md:min-h-screen  pb-20 px-4 md:px-8 overflow-hidden flex min-h-screen items-center justify-center bg-linear-to-b from-[#1B235E] via-[#10163A] to-[#05070D]  text-text-primary">
        {children}
      </div>
    </div>
  );
}
