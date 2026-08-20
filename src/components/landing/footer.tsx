"use client";

import { useRef } from "react";
import Link from "next/link";
import { MessageCircle, Share2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      gsap.from(footerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
      });
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="bg-[#0B1033] border-t border-white/10 py-12 px-6 md:px-16 text-text-secondary"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand & Description matching reference image */}
        <div className="flex flex-col items-start gap-3 max-w-md">
          <Link href="/" className="flex items-center gap-3">
            {/* Custom Logo Badge Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2E5CFF] to-[#00E5FF] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-[#0B1033] rounded-[7px] flex items-center justify-center">
                <span className="font-display font-extrabold text-[#00E5FF] text-lg">Z</span>
              </div>
            </div>
            <span className="font-display text-2xl font-extrabold tracking-wider text-white">
              SEVENT X
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Social Media Icons in Small Outline Circles */}
        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-[#00E5FF] hover:border-[#00E5FF] transition-all"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white/80 hover:text-[#00E5FF] hover:border-[#00E5FF] transition-all"
            aria-label="Instagram"
          >
            <Share2 className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
