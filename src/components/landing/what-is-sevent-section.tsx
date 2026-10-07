"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { value: "150+", label: "Participant" },
  { value: "20+", label: "Media Partner" },
  { value: "5+", label: "Sponsor" },
];

export function WhatIsSeventSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      gsap.from(".wis-left", {
        opacity: 0,
        x: -60,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
      });
      gsap.from(".wis-right", {
        opacity: 0,
        x: 60,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
      });
      gsap.to(".wis-logo", {
        y: -16,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative py-24 px-4 md:px-8 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-wide text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
          WHAT IS SEVENT
        </h2>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.25fr] gap-12 items-center">
        <div className="wis-left flex items-center justify-center">
          <Image
            src="/assets/image/logo_biru.svg"
            alt="SEVENT X logo"
            width={320}
            height={408}
            className="wis-logo w-56 sm:w-72 h-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]"
          />
        </div>

        <div className="wis-right xl:min-w-xl">
          <div className="border border-white/20 rounded-lg p-6 bg-white/[0.03]">
            <h3 className="font-display text-sm sm:text-2xl font-bold tracking-widest text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
              SOFTWARE ENGINEERING EVENT
            </h3>
            <p className="text-sm text-white/60 leading-relaxed drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">
              SEVENT X (SEVENT) is an annual event organized by HIMSE Tekkom
              Unsil University Pangandaran. SEVENT strives to host participants
              with innovations in the fields of Software, Artificial
              Intelligence (AI), Internet of Things (IoT), and Industry
              Solutions. This event aims to provide participants with the
              opportunity to create National-based innovations that will not
              only enhance aesthetics and functionality, but also benefit
              communities. We believe each participant will also practice and
              impactful within their communities.
            </p>
          </div>

          <div className="wis-stats grid grid-cols-3 gap-4 mt-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="wis-stat border border-white/20 rounded-lg py-4 px-2 text-center bg-white/[0.03]"
              >
                <p className="text-sm text-white/60 mb-1">{s.label}</p>
                <p className="font-display text-3xl font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
