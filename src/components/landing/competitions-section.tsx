"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { PatternLanding1 } from "./pattern-landing1";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";
import { useCompetitions } from "@/hooks/use-peserta";
import type { Competition } from "@/types/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type CompetitionCard = {
  key: string;
  title: string;
  image: string;
  description: string;
};

// Logo dipetakan dari slug kompetisi. Bila slug belum dikenal, pakai logo brand.
const LOGO_BY_SLUG: Record<string, string> = {
  "software-development": "/assets/image/logo_softdev.svg",
  "ui-ux": "/assets/image/logo_uiux.svg",
};

// Tampilan cadangan bila API belum mengembalikan data (mis. backend belum jalan),
// supaya section tidak kosong.
const FALLBACK_CARDS: CompetitionCard[] = [
  {
    key: "software-development",
    title: "SOFTDEV",
    image: "/assets/image/logo_softdev.svg",
    description:
      "Software Development challenges, participants to develop their own ideas and turn them into technical applications.",
  },
  {
    key: "ui-ux",
    title: "UI/UX DESIGN",
    image: "/assets/image/logo_uiux.svg",
    description:
      "UI/UX Design challenges participants to create interface that not only aesthetics and functionality, but also benefiting the user experience.",
  },
];

function toCard(competition: Competition): CompetitionCard {
  return {
    key: competition.slug,
    title: competition.name.toUpperCase(),
    image: LOGO_BY_SLUG[competition.slug] ?? "/assets/image/logo_biru.svg",
    description: competition.description,
  };
}

export function CompetitionsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: competitions, isLoading } = useCompetitions();

  const activeCompetitions = (competitions ?? []).filter((c) => c.isActive);
  // Kartu real & fallback sama-sama memakai .comp-card (cabang non-loading),
  // jadi animasi masuk selalu ada walau backend mati. Key fallback = slug asli
  // supaya data real tidak pernah mengganti node DOM (anti "freeze").
  const cards = activeCompetitions.length > 0
    ? activeCompetitions.map(toCard)
    : [];

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      if (isLoading) return;
      gsap.from(".comp-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: ".comp-header", start: "top 85%", once: true },
      });
      gsap.from(".comp-card", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: { trigger: ".comp-grid", start: "top 80%", once: true },
      });
    },
    { scope: containerRef, dependencies: [isLoading] },
  );

  return (
    <section
      id="competitions"
      ref={containerRef}
      className="relative py-12 px-4 md:py-24 md:px-8 overflow-visible"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
        <div className="pattern-sway">
          <PatternLanding1 />
        </div>
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="comp-header text-center max-w-7xl mx-auto mb-8 md:mb-14">
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

        {isLoading ? (
          <div className="comp-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-lg border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="comp-grid grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {(cards.length > 0 ? cards : FALLBACK_CARDS).map((c) => (
              <div
                key={c.key}
                className="comp-card border border-white/20 rounded-lg p-6 bg-black/50 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              >
                <div className="flex flex-col md:flex-row gap-5 items-center md:items-stretch">
                  <Image src={c.image} alt={c.title} width={176} height={140} className="w-32 md:w-44 shrink-0 rounded-sm md:self-stretch md:min-h-[140px] object-cover" />
                  <div className="flex flex-col justify-center flex-1">
                    <h3 className="font-display text-xl font-bold tracking-widest text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                      {c.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-4">
                      {c.description}
                    </p>
                    <Link href="/register" className="block w-full">
                      <button className="cursor-pointer w-full bg-white text-[#7C83BC] text-xs font-semibold px-8 py-2.5 rounded-full shadow-[0_0_20px_rgba(180,190,255,0.6)] hover:bg-white/90 transition-all">
                        Register Now!
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
