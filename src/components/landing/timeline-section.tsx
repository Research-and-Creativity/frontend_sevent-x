"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";
import { useCompetitions } from "@/hooks/use-peserta";
import { Timeline } from "@/types/api";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PHASE_LABEL: Record<string, string> = {
  REGISTRATION: "Registration",
  UPLOAD_KARYA: "Submission",
  PENJURIAN: "Judging",
  FINAL: "Final",
};

const monthNames = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function formatDate(value: string) {
  const date = new Date(value);
  return `${String(date.getDate()).padStart(2, "0")} ${monthNames[date.getMonth()]}`;
}

function formatRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  return sameDay
    ? formatDate(start)
    : `${String(startDate.getDate()).padStart(2, "0")}–${formatDate(end)}`;
}

const COLS_CLASS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

export function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: competitions = [], isLoading } = useCompetitions();

  const events = useMemo(() => {
    const unique = new Map<string, Timeline>();
    for (const competition of competitions) {
      for (const timeline of competition.timelines ?? []) {
        const key = `${timeline.phase}|${timeline.stageName ?? ""}|${timeline.startDate}`;
        if (!unique.has(key)) unique.set(key, timeline);
      }
    }
    return [...unique.values()]
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 5)
      .map((timeline, i) => ({
        date: formatRange(timeline.startDate, timeline.endDate),
        title: timeline.stageName || PHASE_LABEL[timeline.phase] || timeline.phase,
        side: i % 2 === 0 ? "top" : "bottom",
      }));
  }, [competitions]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;
      gsap.from(".tl-header", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: { trigger: ".tl-header", start: "top 85%" },
      });
      gsap.from(".tl-item", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: { trigger: ".tl-track", start: "top 80%" },
      });
    },
    { scope: containerRef, dependencies: [events.length] },
  );

  const gridClass = COLS_CLASS[Math.min(events.length, 5)] ?? "md:grid-cols-1";

  return (
    <section
      id="timeline"
      ref={containerRef}
      className="relative py-24 px-4 md:px-8 overflow-visible"
    >
      <Image
        src="/assets/image/logo_putih.svg"
        alt=""
        width={700}
        height={900}
        className="absolute left-[-10%] top-[10%] w-[65vw] max-w-[2000px] h-auto opacity-[0.08] pointer-events-none"
      />
      <div className="max-w-[110rem] mx-auto">
        <div className="tl-header text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-wide text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
            TIMELINE
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            The competition will be conducted in several stages, starting with
            registration, the uploading of documents and entries, the
            preliminary round, and the final presentation to determine the
            winners.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="tl-item h-28 rounded-xl border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-sm text-white/40">
            Timeline akan diumumkan segera.
          </p>
        ) : (
          <div className="tl-track relative">
            {/* horizontal line */}
            <div
              className="absolute -left-0 right-0 top-1/2 h-[2px] bg-white/25 hidden md:block"
              style={{ left: "-5vw", width: "110vw" }}
            />

            <div className={`grid grid-cols-1 ${gridClass} gap-10 md:gap-4`}>
              {events.map((e, i) => (
                <div
                  key={i}
                  className="tl-item relative flex flex-col items-center md:h-80"
                >
                  {/* dot pinned to the horizontal center line */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10" />
                  {e.side === "top" ? (
                    <>
                      <div className="w-full border border-white/25 rounded-xl px-4 py-5 text-center bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.08)] md:h-28 flex flex-col justify-center">
                        <p className="font-display text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                          {e.date}
                        </p>
                        <p className="text-base text-white/60 mt-1">{e.title}</p>
                      </div>
                      <div className="hidden md:block w-px h-12 bg-white/25" />
                    </>
                  ) : (
                    <>
                      <div className="md:hidden" />
                      <div className="hidden md:flex md:flex-col md:items-center md:justify-end md:h-full md:w-full">
                        <div className="w-px h-12 bg-white/25" />
                        <div className="w-full border border-white/25 rounded-xl px-4 py-5 text-center bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.08)] md:h-28 flex flex-col justify-center">
                          <p className="font-display text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {e.date}
                          </p>
                          <p className="text-base text-white/60 mt-1">
                            {e.title}
                          </p>
                        </div>
                      </div>
                      <div className="md:hidden w-full border border-white/25 rounded-xl px-4 py-5 text-center bg-white/[0.03] shadow-[0_0_20px_rgba(255,255,255,0.08)] flex flex-col justify-center">
                        <p className="font-display text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                          {e.date}
                        </p>
                        <p className="text-base text-white/60 mt-1">{e.title}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
