"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// PERBAIKAN KONTRAS:
// Background dihitamkan dengan opacity 85% dan blur ditingkatkan ke 'xl'
// agar warna terang dari card di bawahnya tidak menembus dan merusak teks.
const scrolledClasses = [
  "bg-[#0B0F19]/85",
  "backdrop-blur-xl",
  "border-b",
  "border-white/10", // Border halus, bukan border solid tebal
  "shadow-[0_10px_40px_rgba(0,0,0,0.2)]", // Shadow lembut untuk kedalaman
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
          if (navRef.current) {
            if (self.isActive) {
              navRef.current.classList.add(...scrolledClasses);
            } else {
              navRef.current.classList.remove(...scrolledClasses);
            }
          }
        },
      });
    },
    { scope: navRef },
  );

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Competitions", href: "#competitions" },
    { label: "Timeline", href: "#timeline" },
    { label: "Appraisers", href: "#appraisers" },
  ];

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-5 px-4 md:px-8 bg-transparent"
    >
      {/* 
        IMPROVEMENT LAYOUT: Menggunakan grid-cols-3 agar posisi Nav Links 
        benar-benar berada di tengah (center) dan seimbang kiri-kanan.
      */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 items-center">
        {/* Kiri: Logo */}
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl font-extrabold tracking-tight text-white transition-opacity group-hover:opacity-80">
              SEVENT <span className="text-[#00E5FF]">X</span>
            </span>
          </Link>
        </div>

        {/* Tengah: Desktop Navigation Links */}
        <nav className="hidden md:flex justify-center items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Kanan: Action Button */}
        <div className="hidden md:flex justify-end items-center">
          <Link href="/login" tabIndex={-1}>
            <Button className="cursor-pointer bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#0B0F19] font-semibold transition-all duration-200 px-6 rounded-lg">
              Login
            </Button>
          </Link>
        </div>

        {/* Kanan (Mobile): Hamburger Button */}
        <div className="flex md:hidden justify-end">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2 text-white/70 hover:text-white transition-colors"
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

      {/* Mobile Drawer Menu (Dirapikan tampilannya) */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-white/70 hover:text-white transition-colors py-2 border-b border-white/5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2"
          >
            <Button className="w-full cursor-pointer bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#0B0F19] font-bold">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
