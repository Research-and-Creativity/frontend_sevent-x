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
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

  // 1. Animate Header Independently (once: true, fromTo for reliability)
  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  // 2. Animate Cards when data arrives
  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      if (
        cardsRef.current &&
        cardsRef.current.children &&
        cardsRef.current.children.length > 0
      ) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [competitions, isLoading] }
  );

  return (
    <section
      id="competitions"
      ref={containerRef}
      className="pb-24 px-6 md:px-16 bg-transparent relative"
    >
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
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#242C54]/40 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-8 h-full flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mb-6 animate-pulse" />
                  <div className="h-7 w-3/5 bg-white/10 rounded-lg animate-pulse mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10 mt-8 space-y-2">
                  <div className="h-3 w-20 bg-[#00E5FF]/20 rounded animate-pulse" />
                  <div className="h-7 w-32 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-[#18214D]/80 border border-rose-500/40 rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto backdrop-blur-md">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-rose-400">DATA_SYNC_FAILED</p>
              <p className="text-sm text-white/70 font-light">Tidak dapat menyinkronkan data kompetisi dari server.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 bg-[#0E142E] hover:bg-[#00E5FF]/10 border border-[#00E5FF]/50 text-[#00E5FF] font-mono text-xs tracking-wider uppercase rounded-xl inline-flex items-center gap-2 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SYNC_AGAIN</span>
            </button>
          </div>
        ) : competitions.length === 0 ? (
          <div className="bg-[#18214D]/60 border border-[#00E5FF]/20 rounded-2xl p-8 text-center space-y-2 max-w-md mx-auto backdrop-blur-md">
            <p className="font-mono text-xs uppercase tracking-widest text-[#00E5FF]">NO_ACTIVE_COMPETITION</p>
            <p className="text-sm text-white/60 font-light">Belum ada kompetisi yang dibuka saat ini.</p>
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {competitions.map((comp) => {
              const prize = comp.prizePool;
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
                  <Card className="bg-[#242C54]/60 backdrop-blur-md border border-white/15 rounded-2xl p-8 transition-colors h-full flex flex-col justify-between">
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

                    {/* Tampilkan PRIZE POOL hanya jika comp.prizePool ada isinya */}
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
