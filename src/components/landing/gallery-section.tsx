"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function GallerySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      gsap.from(".gallery-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: ".gallery-header", start: "top 85%" },
      });
      gsap.from(".gallery-cell", {
        opacity: 0,
        scale: 0.92,
        duration: 0.5,
        stagger: 0.06,
        scrollTrigger: { trigger: ".gallery-grid", start: "top 80%" },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="gallery"
      ref={containerRef}
      className="relative py-24 px-4 md:px-8 overflow-visible"
    >
      <div className="absolute -right-32 top-1/4 w-[800px] h-[800px] rounded-full bg-[#2E5CFF]/25 blur-[140px] pointer-events-none -z-10" />
      {/* <div className="absolute -left-32 bottom-0 w-[380px] h-[380px] rounded-full bg-[#1E3A8A]/20 blur-[140px] pointer-events-none" /> */}
      <div className="max-w-7xl mx-auto">
        <div className="gallery-header text-center max-w-5xl mx-auto mb-14">
          <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-wide text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
            GALLERY
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            SEVENT X is more than just a competition played out on a computer
            screen. It also makes a direct impact on participants and offers
            them real opportunities for growth.
          </p>
        </div>

        <div className="gallery-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="gallery-cell aspect-[16/10] bg-neutral-200/90 rounded-lg"
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="cursor-pointer bg-white text-[#7C83BC] text-sm font-semibold px-8 py-2.5 rounded-full shadow-[0_0_20px_rgba(180,190,255,0.6)] hover:bg-white/90 transition-all">
            Discover More
          </button>
        </div>
      </div>
    </section>
  );
}
