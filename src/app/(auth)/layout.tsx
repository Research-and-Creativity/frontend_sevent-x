"use client";

import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isForgotOrReset =
    pathname.includes("forgot") || pathname.includes("reset");

  const bgClass = isForgotOrReset ? "bg-[#B8C4FF]" : "bg-[#091024]";

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${bgClass}`}>
      {children}
    </div>
  );
}
