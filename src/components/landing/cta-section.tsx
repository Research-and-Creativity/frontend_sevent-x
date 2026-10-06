"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CtaSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      gsap.from(".cta-inner", {
        opacity: 0, scale: 0.95, duration: 0.8,
        scrollTrigger: { trigger: containerRef.current, start: "top 85%" },
      });
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative py-20 px-4 md:px-8 text-center">
      <div className="cta-inner">
        <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-wide text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">READY TO BE THE WINNER?</h2>
        <p className="text-sm sm:text-base text-white/50 mb-8">Seize the opportunity with SEVENT X and bring your best innovation to life!</p>
        <Link href="/login">
          <button className="cursor-pointer bg-white text-[#7C83BC] text-sm font-semibold px-10 py-3 rounded-full hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(180,190,255,0.6)]">
            Register Now!
          </button>
        </Link>
      </div>
    </section>
  );
}
