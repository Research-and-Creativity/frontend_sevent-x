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
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Memecah teks judul menjadi array huruf untuk dianimasikan per karakter
  const titleText = "SEVENT X";
  const titleChars = titleText.split("");

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      const reduceMotion = prefersReducedMotion();

      if (reduceMotion) {
        gsap.set(
          [
            badgeRef.current,
            titleRef.current,
            subtitleRef.current,
            descRef.current,
            ".hero-btn",
          ],
          { opacity: 1, y: 0 },
        );
        return;
      }

      // 1. SETUP INITIAL STATE (Kondisi sebelum animasi dimulai)
      // Menggeser elemen sedikit ke bawah dan membuatnya transparan
      gsap.set(badgeRef.current, { opacity: 0, x: -20 });
      gsap.set(".title-char", { opacity: 0, y: 40 });
      gsap.set(subtitleRef.current, { y: "100%" }); // Bersembunyi di balik overflow-hidden
      gsap.set(descRef.current, { opacity: 0, y: 20 });
      gsap.set(".hero-btn", { opacity: 0, y: 20 });

      // 2. ENTRANCE TIMELINE (Koreografi Animasi Premium)
      // Menggunakan expo.out untuk pergerakan yang cepat di awal lalu melambat sangat halus
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.to(badgeRef.current, { opacity: 1, x: 0, duration: 1.2 })
        // Animasi per huruf dengan jeda (stagger) 0.04 detik
        .to(
          ".title-char",
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.04 },
          "-=0.8",
        )
        // Mask reveal untuk subjudul (muncul dari bawah)
        .to(subtitleRef.current, { y: "0%", duration: 1.2 }, "-=0.9")
        // Deskripsi muncul
        .to(descRef.current, { opacity: 1, y: 0, duration: 1.2 }, "-=1")
        // Tombol muncul berurutan
        .to(
          ".hero-btn",
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 },
          "-=1.1",
        );

      // 3. PARALLAX SCROLL (Tetap dipertahankan agar tidak kaku saat di-scroll)
      gsap.to(contentRef.current, {
        y: -120,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[90vh] md:min-h-screen flex items-center pt-28 pb-20 px-4 md:px-8 bg-transparent overflow-hidden"
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
            ref={buttonsRef}
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
            <Link href="#competitions" className="w-full sm:w-auto hero-btn">
              <Button
                variant="outline"
                className="cursor-pointer w-full sm:w-auto border border-[#6ED3D8] bg-[#0E142E] hover:bg-[#6ED3D8]/10 text-[#6ED3D8] hover:text-[#6ED3D8] font-mono text-sm px-10 py-6 rounded-xl transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]"
              >
                View Rules
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
