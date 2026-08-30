"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleWrapperRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  // Memecah teks judul menjadi array huruf untuk dianimasikan per karakter
  const titleText = "SEVENT X";
  const titleChars = titleText.split("");

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const reduceMotion = prefersReducedMotion();
      if (reduceMotion) return;

      // Bulletproof entrance animation using fromTo
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.8 }
        );
      }

      tl.fromTo(
        ".title-char",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.03 },
        "-=0.6"
      );

      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        );
      }

      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        );
      }

      tl.fromTo(
        ".hero-btn",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        "-=0.6"
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[85vh] md:min-h-screen flex items-center pt-28 pb-20 px-4 md:px-8 bg-transparent overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full z-10">
        <div
          ref={contentRef}
          className="max-w-3xl flex flex-col items-start text-left"
        >
          {/* Badge */}
          <div ref={badgeRef} className="mb-8">
            <Badge className="h-auto bg-white/5 backdrop-blur-2xl border border-[#DCF5FF] text-white font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-3 hover:bg-white/5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>LIVE REGISTRATION NOW OPEN</span>
            </Badge>
          </div>

          {/* Main Title - Dipecah per huruf untuk animasi tipografi */}
          <h1
            ref={titleRef}
            className="font-display text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-none mb-2 overflow-hidden pb-2"
          >
            {titleChars.map((char, index) => (
              <span key={index} className="inline-block title-char">
                {/* Mengganti spasi kosong dengan non-breaking space agar tidak hilang */}
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          {/* Subtitle - Menggunakan Wrapper overflow-hidden untuk efek "Mask Reveal" */}
          <div ref={subtitleWrapperRef} className="overflow-hidden mb-8">
            <p
              ref={subtitleRef}
              className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-white uppercase block"
            >
              TECH COMPETITION NATIONAL
            </p>
          </div>

          {/* Description */}
          <p
            ref={descRef}
            className="text-base sm:text-lg text-white/70 leading-relaxed font-light mb-12 max-w-2xl"
          >
            Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do
            Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.
          </p>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
          >
            <Link href="/login" className="w-full sm:w-auto hero-btn">
              <Button
                variant="outline"
                className="cursor-pointer w-full sm:w-auto border border-[#6ED3D8] bg-[#0E142E] hover:bg-[#6ED3D8]/10 text-[#6ED3D8] hover:text-[#6ED3D8] font-mono text-sm px-10 py-6 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]"
              >
                Register Now
              </Button>
            </Link>
            {process.env.NEXT_PUBLIC_GUIDEBOOK_URL ? (
              <Link
                href={process.env.NEXT_PUBLIC_GUIDEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto hero-btn"
              >
                <Button
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto border border-[#6ED3D8] bg-[#0E142E] hover:bg-[#6ED3D8]/10 text-[#6ED3D8] hover:text-[#6ED3D8] font-mono text-sm px-10 py-6 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]"
                >
                  View Rules
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                disabled
                title="Guidebook belum tersedia"
                className="w-full sm:w-auto border border-[#6ED3D8]/40 bg-[#0E142E] text-text-secondary font-mono text-sm px-10 py-6 rounded-xl cursor-not-allowed opacity-50 hero-btn"
              >
                View Rules
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
