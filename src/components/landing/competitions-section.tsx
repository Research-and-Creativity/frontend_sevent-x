"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { PatternLanding1 } from "./pattern-landing1";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const competitions = [
  {
    title: "SOFTDEV",
    image: "/assets/image/logo_softdev.svg",
    description:
      "Software Development challenges, participants to develop their own ideas and turn them into technical applications.",
  },
  {
    title: "UI/UX DESIGN",
    image: "/assets/image/logo_uiux.svg",
    description:
      "UI/UX Design challenges participants to create interface that not only aesthetics and functionality, but also benefiting the user experience.",
  },
];

export function CompetitionsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      gsap.from(".comp-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: ".comp-header", start: "top 85%" },
      });
      gsap.from(".comp-card", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".comp-grid", start: "top 80%" },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="competitions"
      ref={containerRef}
      className="relative py-24 px-4 md:px-8 overflow-visible"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="pattern-sway">
          <PatternLanding1 />
        </div>
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="comp-header text-center max-w-7xl mx-auto mb-14">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-wide text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
            COMPETITION
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            SEVENT X 2026 features two competition categories open to teams:
            UI/UX Design and Software Development. Each category includes
            sub-themes derived from the Sustainable Development Goals (SDGs).
            Choose your competition track and design your best innovation!
          </p>
        </div>

        <div className="comp-grid grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.map((c) => (
            <div
              key={c.title}
              className="comp-card border border-white/20 rounded-lg p-6 bg-black/50 backdrop-blur-sm"
            >
              <div className="flex gap-5 items-stretch">
                <img src={c.image} alt={c.title} className="w-32 sm:w-44 shrink-0 rounded-sm self-stretch min-h-[140px] object-cover" />
                <div className="flex flex-col justify-center flex-1">
                  <h3 className="font-display text-xl font-bold tracking-widest text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-4">
                    {c.description}
                  </p>
                  <button className="cursor-pointer w-full bg-white text-[#7C83BC] text-xs font-semibold px-8 py-2.5 rounded-full shadow-[0_0_20px_rgba(180,190,255,0.6)] hover:bg-white/90 transition-all">
                    Register Now!
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
