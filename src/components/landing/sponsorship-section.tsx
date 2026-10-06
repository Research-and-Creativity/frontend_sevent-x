"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SponsorshipSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      gsap.from(".sp-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: ".sp-header", start: "top 85%" },
      });
      gsap.from(".sp-panel", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: { trigger: ".sp-panels", start: "top 80%" },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="sponsorship"
      ref={containerRef}
      className="relative py-24 px-4 md:px-8 overflow-visible"
    >
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="sp-header text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-wide text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
            SPONSORSHIP
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Become a sponsor and join us in shaping Indonesia's digital future.
          </p>
        </div>

        <div className="sp-panels grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="sp-panel border border-white/25 rounded-xl p-5 bg-white/[0.03] shadow-[0_0_25px_rgba(255,255,255,0.06)]">
            <h3 className="font-display text-2xl font-bold tracking-widest text-white mb-5 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              AVAILABLE TIERS
            </h3>
            <div className="flex flex-wrap gap-3 mb-5">
              {["Package", "Package", "Package", "Package"].map((p, i) => (
                <span
                  key={i}
                  className="text-base text-white/90 border border-[#5B5EA6] rounded px-4 py-2 bg-[#3B3F6E]/50"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          <div className="sp-panel border border-white/25 rounded-xl p-5 bg-white/[0.03] shadow-[0_0_25px_rgba(255,255,255,0.06)]">
            <h3 className="font-display text-2xl font-bold tracking-widest text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              LET'S BUILD IT TOGETHER
            </h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Great technology never grows alone. Partner with SEVENT X and put
              your name on the next generation of Indonesian engineers'
              experience.
            </p>
            <button className="cursor-pointer bg-white text-[#7C83BC] text-sm font-semibold px-8 py-2.5 rounded-full shadow-[0_0_20px_rgba(180,190,255,0.6)] hover:bg-white/90 transition-all">
              Discover More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
