"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SponsorItem {
  code: string;
  name: string;
}

const goldSponsors: SponsorItem[] = [
  { code: "TC", name: "TechCorp" },
  { code: "IL", name: "InnovateLab" },
  { code: "CB", name: "CloudBase" },
];

const silverSponsors: SponsorItem[] = [
  { code: "DS", name: "DevStack" },
  { code: "BF", name: "ByteFlow" },
  { code: "CN", name: "CodeNest" },
  { code: "DS", name: "DataSync" },
];

export function SponsorshipSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const goldGridRef = useRef<HTMLDivElement>(null);
  const silverGridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      // 1. Header Animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // 2. Gold Cards Animation
      const goldCards = gsap.utils.toArray(".gold-card");
      if (goldCards.length > 0 && goldGridRef.current) {
        gsap.fromTo(
          goldCards,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: goldGridRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      // 3. Silver Cards Animation
      const silverCards = gsap.utils.toArray(".silver-card");
      if (silverCards.length > 0 && silverGridRef.current) {
        gsap.fromTo(
          silverCards,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: silverGridRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      }

      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    },
    { scope: containerRef },
  );

  return (
    <section
      id="sponsorship"
      ref={containerRef}
      className="py-20 md:py-24 px-6 md:px-16 bg-transparent relative"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
            We Sponsorship
          </h2>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Terima Kasih Kepada Para Sponsor Yang Telah Mendukung Kompetisi Ini.
          </p>
        </div>

        {/* Section 1: Gold Sponsors */}
        <div className="mb-14">
          <p className="text-center font-mono text-lg font-medium tracking-[0.15em] text-[#00E5FF] mb-6">
            GOLD SPONSORS
          </p>

          <div
            ref={goldGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {goldSponsors.map((sponsor, index) => (
              <div
                key={`gold-${index}-${sponsor.name}`}
                className="gold-card bg-[#18214D]/80 border border-white/10 rounded-2xl p-7 sm:p-8 flex flex-col items-center justify-center text-center transition-colors duration-200 hover:border-white/20 hover:bg-[#18214D]"
              >
                {/* Logo Box */}
                <div className="w-full max-w-[200px] h-28 sm:h-32 rounded-xl bg-[#0C112C] border border-white/5 flex items-center justify-center mb-6">
                  <span className="font-display font-bold text-2xl sm:text-3xl text-white/90 tracking-widest">
                    {sponsor.code}
                  </span>
                </div>

                {/* Sponsor Name */}
                <h3 className="font-display font-semibold text-white/95 text-lg sm:text-xl">
                  {sponsor.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Silver Sponsors */}
        <div>
          <p className="text-center font-mono text-lg font-medium tracking-[0.15em] text-[#00E5FF] mb-6">
            SILVER SPONSORS
          </p>

          <div
            ref={silverGridRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {silverSponsors.map((sponsor, index) => (
              <div
                key={`silver-${index}-${sponsor.name}`}
                className="silver-card bg-[#18214D]/80 border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-colors duration-200 hover:border-white/20 hover:bg-[#18214D]"
              >
                {/* Logo Box */}
                <div className="w-full max-w-[150px] h-20 sm:h-24 rounded-xl bg-[#0C112C] border border-white/5 flex items-center justify-center mb-5">
                  <span className="font-display font-bold text-xl sm:text-2xl text-white/90 tracking-widest">
                    {sponsor.code}
                  </span>
                </div>

                {/* Sponsor Name */}
                <h3 className="font-display font-semibold text-white/95 text-sm sm:text-base">
                  {sponsor.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
