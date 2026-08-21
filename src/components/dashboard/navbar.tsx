"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutPanelLeft,
  User,
  Bell,
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
      name: "Overiew",
      icon: <LayoutPanelLeft />,
    },
    {
      url: "/juri/team",
      name: "Team",
      icon: <Users />,
    },
    {
      url: "/juri/announcement",
      name: "Overiew",
      icon: <Megaphone />,
    },
  ],
  admin: [
    {
      url: "/juri/dashboard",
      name: "Overiew",
      icon: <LayoutPanelLeft />,
    },
    {
      url: "/juri/team",
      name: "Team",
      icon: <Users />,
    },
    {
      url: "/juri/announcement",
      name: "Overiew",
      icon: <Megaphone />,
    },
  ],
};

export default function NavbarDashboard({ role, children }: NavbarType) {
  const currentLinks = NAV_ITEMS[role] || [];
  const pathname = usePathname();
  const pageTitle = currentLinks.find((link) => link.url === pathname);

  return (
    <div className="w-full h-full relative">
      <header className="fixed z-50 top-0 right-0 left-0 w-auto flex items-center justify-between pl-72 py-3 pr-4 bg-[#08132F] text-white">
        <h1 className="text-2xl font-semibold">{pageTitle?.name}</h1>
        <button className="cursor-pointer hover:bg-[#091636] flex items-center gap-3 p-3 rounded-full outline outline-blue-950 transition-colors">
          <User />
          Aldi Firmansyah
        </button>
      </header>
      {/*sidebar*/}
      <aside className=" w-64 bg-[#0a0f1d] border-r border-[#1e293b] flex flex-col justify-between p-4 h-screen fixed z-50 top-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white tracking-wider">
              7X
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              SEVENT X
            </span>
          </div>

          {/* Main Navigation Links */}
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

        {/* Bottom Menu (Settings & FAQ) */}
        <div className="border-t border-[#1e293b] pt-4 space-y-1">
          <Link
            href={""}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
          >
            <CircleQuestionMark />
            <span>FAQ</span>
          </Link>
        </div>
      </aside>
      <div className="pl-64 pt-16">{children}</div>
    </div>
  );
}
