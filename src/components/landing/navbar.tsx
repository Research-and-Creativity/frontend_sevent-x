"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const scrolledClasses = [
  "bg-black/70",
  "backdrop-blur-xl",
  "border-b",
  "border-white/10",
  "!py-3",
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (
        prefersReducedMotion() ||
        typeof window === "undefined" ||
        !navRef.current
      )
        return;
      ScrollTrigger.create({
        start: "top -50px",
        end: 99999,
        onToggle: (self) => {
          if (!navRef.current) return;
          if (self.isActive) navRef.current.classList.add(...scrolledClasses);
          else navRef.current.classList.remove(...scrolledClasses);
        },
      });
    },
    { scope: navRef },
  );

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Competition", href: "#competitions" },
    { label: "Timeline", href: "#timeline" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-5 px-4 md:px-8 bg-transparent"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl font-extrabold tracking-tight text-white group-hover:opacity-80 transition-opacity flex items-center gap-2">
              <Image
                src="/assets/image/logo_putih.svg"
                alt="SEVENT X"
                width={20}
                height={26}
                className="w-5 h-auto"
              />
              SEVENT <span className="text-white/70">X</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex justify-center items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex justify-end">
          <Link href="/login" tabIndex={-1}>
            <button className="cursor-pointer bg-white text-black text-sm font-semibold px-6 py-2 rounded-full hover:bg-white/90 transition-colors">
              Login
            </button>
          </Link>
        </div>

        <div className="flex md:hidden justify-end">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-white/70 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-white/70 hover:text-white py-2 border-b border-white/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2"
          >
            <button className="w-full bg-white text-black font-bold py-2 rounded-full">
              Login
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
