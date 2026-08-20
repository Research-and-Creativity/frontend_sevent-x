"use client";

import { useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CountdownSection } from "./countdown-section";
import {
  UserPlus,
  FolderOutput,
  Megaphone,
  MonitorPlay,
  Trophy,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const timelineEvents = [
  {
    id: 1,
    title: "Open register",
    date: "1 November 2026",
    description:
      "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    icon: <UserPlus className="w-5 h-5 text-[#151936]" />,
    side: "left",
  },
  {
    id: 2,
    title: "Last Submit",
    date: "1 December 2026",
    description:
      "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    icon: <FolderOutput className="w-5 h-5 text-[#151936]" />,
    side: "right",
  },
  {
    id: 3,
    title: "Annoucment To Final",
    date: "4 December 2026",
    description:
      "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    icon: <Megaphone className="w-5 h-5 text-[#151936]" />,
    side: "left",
  },
  {
    id: 4,
    title: "Technical Meeting Final",
    date: "5 December 2026",
    description:
      "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    icon: <MonitorPlay className="w-5 h-5 text-[#151936]" />,
    side: "right",
  },
  {
    id: 5,
    title: "Annoucment Champions",
    date: "10 December 2026",
    description:
      "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    icon: <Trophy className="w-5 h-5 text-[#151936]" />,
    side: "left",
  },
];

export function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineWrapRef = useRef<HTMLDivElement>(null);
  const verticalFillRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;

      if (prefersReducedMotion()) {
        timelineEvents.forEach((evt) => {
          gsap.set(`#timeline-card-${evt.id}`, { opacity: 1, x: 0, y: 0 });
          gsap.set(`.dot-${evt.id}`, { opacity: 1 });
          gsap.set(`.branch-fill-${evt.id}`, {
            attr: { x2: evt.side === "left" ? "44%" : "56%" },
          });
        });
        return;
      }

      gsap.to(verticalFillRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: lineWrapRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        },
      });

      timelineEvents.forEach((evt) => {
        const row = document.getElementById(`timeline-row-${evt.id}`);
        const card = document.getElementById(`timeline-card-${evt.id}`);
        if (!row || !card) return;

        const isLeft = evt.side === "left";
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;

        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isDesktop ? (isLeft ? -40 : 40) : 0,
            y: isDesktop ? 0 : 30,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: row,
              start: "top 60%",
            },
          },
        );

        if (isDesktop) {
          const dot = document.querySelector(`.dot-${evt.id}`);
          const branchFill = document.querySelector(`.branch-fill-${evt.id}`);
          const targetX2 = isLeft ? "44%" : "56%";

          const rowTl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "center center",
              end: "+=160",
              scrub: true,
            },
          });

          rowTl
            .to(dot, { opacity: 1, duration: 0.1 })
            .to(
              branchFill,
              { attr: { x2: targetX2 }, ease: "power3.out", duration: 1 },
              "<",
            );
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="py-24 px-4 md:px-8 bg-transparent relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            Competition{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-indigo-400">
              Timeline
            </span>
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto">
            Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do
            Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.
          </p>
        </div>

        <div ref={lineWrapRef} className="relative max-w-5xl mx-auto py-8">
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-1.5 bg-[#2B335C] rounded-full -translate-x-1/2 z-0" />
          <div
            ref={verticalFillRef}
            className="hidden md:block absolute top-0 bottom-0 left-1/2 w-1.5 bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] rounded-full -translate-x-1/2 origin-top scale-y-0 z-10"
          />

          <div className="relative z-20 space-y-16 md:space-y-0">
            {timelineEvents.map((evt) => {
              const isLeft = evt.side === "left";

              return (
                <div
                  key={evt.id}
                  id={`timeline-row-${evt.id}`}
                  className={`relative flex items-center w-full mb-16 md:mb-24 last:mb-0 ${
                    isLeft ? "justify-start" : "justify-end"
                  }`}
                >
                  <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-10">
                    <line
                      x1="50%"
                      y1="50%"
                      x2={isLeft ? "44%" : "56%"}
                      y2="50%"
                      stroke="#2B335C"
                      strokeWidth="6"
                    />

                    <line
                      className={`branch-fill-${evt.id}`}
                      x1="50%"
                      y1="50%"
                      x2="50%"
                      y2="50%"
                      stroke="#00E5FF"
                      strokeWidth="6"
                      style={{
                        filter: "drop-shadow(0px 0px 6px rgba(0,229,255,0.6))",
                      }}
                    />

                    <circle
                      cx="50%"
                      cy="50%"
                      r="10"
                      fill="#151936"
                      stroke="#2B335C"
                      strokeWidth="6"
                    />

                    <circle
                      className={`dot-${evt.id}`}
                      cx="50%"
                      cy="50%"
                      r="10"
                      fill="#00E5FF"
                      opacity="0"
                      style={{ filter: "drop-shadow(0px 0px 10px #00E5FF)" }}
                    />
                  </svg>

                  <div className="w-full md:w-[45%] relative z-30">
                    <Card
                      id={`timeline-card-${evt.id}`}
                      className="bg-[#BAC2EC] border border-white/40 rounded-2xl p-6 shadow-2xl text-[#151936] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,229,255,0.2)] transition-all duration-300"
                    >
                      <CardHeader className="p-0 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#9FAAE0] flex items-center justify-center mb-3 shadow-sm">
                          {evt.icon}
                        </div>
                        <CardTitle className="font-display text-xl font-bold text-[#151936]">
                          {evt.title}
                        </CardTitle>
                      </CardHeader>
                      <CardDescription className="text-[#3A406D] text-xs sm:text-sm leading-relaxed mb-6">
                        {evt.description}
                      </CardDescription>
                      <div className="pt-4 border-t border-[#A8B2E4]">
                        <p className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#464E78] mb-1">
                          DATE
                        </p>
                        <p className="font-display font-bold text-base text-[#151936]">
                          {evt.date}
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <CountdownSection targetDate="2026-12-01T23:59:59Z" />
        </div>
      </div>
    </section>
  );
}
