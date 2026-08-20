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
    title: "UI/UX Design",
    slug: "ui-ux-design",
    description: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    category: "UI_UX",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-10-15T23:59:59Z",
    registrationFee: 50000,
    maxTeamMembers: 3,
    status: "OPEN",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Software Devlopments",
    slug: "software-developments",
    description: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    category: "WEB_DEV",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-10-15T23:59:59Z",
    registrationFee: 50000,
    maxTeamMembers: 3,
    status: "OPEN",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
  },
];

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

  const { data: competitions = mockCompetitions } = useQuery<Competition[]>({
    queryKey: ["competitions"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/competitions");
        return res.data?.data || res.data || mockCompetitions;
      } catch {
        return mockCompetitions;
      }
    },
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      gsap.from(headerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%",
        },
      });

      if (cardsRef.current) {
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
    { scope: containerRef, dependencies: [competitions] }
  );

  return (
    <section id="competitions" ref={containerRef} className="py-24 px-6 md:px-16 bg-transparent relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            Competition{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-300">
              In Year
            </span>
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto">
            Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.
          </p>
        </div>

        {/* Competition Cards Grid matching reference image */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.map((comp) => (
            <motion.div
              key={comp.id}
              whileHover={
                prefersReducedMotion()
                  ? {}
                  : { scale: 1.02 }
              }
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-[#242C54]/60 backdrop-blur-md border border-white/15 rounded-2xl p-8 shadow-2xl transition-colors h-full flex flex-col justify-between">
                <CardHeader className="p-0 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#3B467A] flex items-center justify-center mb-6 border border-white/10 shadow-md">
                    {categoryIcons[comp.category] || <Code className="w-5 h-5 text-white" />}
                  </div>
                  <CardTitle className="font-display text-2xl font-bold text-white mb-3">
                    {comp.title}
                  </CardTitle>
                  <CardDescription className="text-white/70 text-sm leading-relaxed">
                    {comp.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 pt-6 border-t border-white/10">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#2DE4E0] font-semibold mb-1">
                    PRIZE POOL
                  </p>
                  <p className="font-display text-3xl font-extrabold text-white">
                    $10,000
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
