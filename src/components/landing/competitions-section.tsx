"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Competition } from "@/types/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Code, Palette, Terminal, Cpu } from "lucide-react";
import { motion } from "motion/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const mockCompetitions: Competition[] = [
  {
    id: "1",
    name: "UI/UX Design",
    slug: "ui-ux-design",
    description: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    maxMember: 3,
    isActive: true,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Software Developments",
    slug: "software-developments",
    description: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    maxMember: 3,
    isActive: true,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
];

import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  WEB_DEV: <Cpu className="w-5 h-5 text-white" />,
  UI_UX: <Palette className="w-5 h-5 text-white" />,
  CP: <Terminal className="w-5 h-5 text-white" />,
  AI: <Code className="w-5 h-5 text-white" />,
};

export function CompetitionsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const {
    data: competitions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Competition[]>({
    queryKey: ["competitionsPublic"],
    queryFn: async () => {
      const res = await apiClient.get("/api/competitions");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
          },
        });
      }

      if (
        cardsRef.current &&
        cardsRef.current.children &&
        cardsRef.current.children.length > 0
      ) {
        gsap.from(cardsRef.current.children, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
          },
        });
      }
    },
    { scope: containerRef, dependencies: [competitions, isLoading] }
  );

  return (
    <section id="competitions" ref={containerRef} className="pb-24 px-6 md:px-16 bg-transparent relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            Competition{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-indigo-300">
              In Year
            </span>
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto">
            Jelajahi berbagai cabang kompetisi nasional dan kembangkan inovasi teknologi terbaikmu di SEVENT X 2026.
          </p>
        </div>

        {/* Competition Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 rounded-2xl bg-[#242C54]/60 border border-white/10" />
            <Skeleton className="h-64 rounded-2xl bg-[#242C54]/60 border border-white/10" />
          </div>
        ) : isError ? (
          <div className="bg-[#242C54]/60 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-300">Gagal memuat daftar kompetisi dari server.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-surface hover:bg-card-hover border border-border text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : competitions.length === 0 ? (
          <div className="bg-[#242C54]/60 border border-white/10 rounded-2xl p-8 text-center text-xs text-white/60">
            Belum ada kompetisi yang dibuka saat ini.
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competitions.map((comp) => {
              const prize = (comp as any).prizePool || (comp as any).prize;
              const iconKey =
                comp.name?.toUpperCase().includes("WEB") || comp.slug?.includes("web")
                  ? "WEB_DEV"
                  : comp.name?.toUpperCase().includes("UI") || comp.slug?.includes("ui")
                  ? "UI_UX"
                  : comp.name?.toUpperCase().includes("CP") || comp.slug?.includes("competitive")
                  ? "CP"
                  : "AI";

              return (
                <motion.div
                  key={comp.id}
                  whileHover={prefersReducedMotion() ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-[#242C54]/60 backdrop-blur-md border border-white/15 rounded-2xl p-8 shadow-2xl transition-colors h-full flex flex-col justify-between">
                    <CardHeader className="p-0 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#3B467A] flex items-center justify-center mb-6 border border-white/10 shadow-md">
                        {categoryIcons[iconKey] || <Code className="w-5 h-5 text-white" />}
                      </div>
                      <CardTitle className="font-display text-2xl font-bold text-white mb-3">
                        {comp.name}
                      </CardTitle>
                      <CardDescription className="text-white/70 text-sm leading-relaxed">
                        {comp.description}
                      </CardDescription>
                    </CardHeader>

                    {/* Sembunyikan bagian PRIZE POOL jika field prize belum ada di backend */}
                    {prize && (
                      <CardContent className="p-0 pt-6 border-t border-white/10">
                        <p className="font-mono text-xs uppercase tracking-wider text-accent font-semibold mb-1">
                          PRIZE POOL
                        </p>
                        <p className="font-display text-3xl font-extrabold text-white">
                          {prize}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
