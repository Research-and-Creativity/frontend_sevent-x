"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CountdownSectionProps {
  targetDate?: string;
}

export function CountdownSection({
  targetDate = "2026-12-01T23:59:59Z",
}: CountdownSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeLeft, setTimeLeft] = useState({
    months: 4,
    days: 23,
    hours: 15,
    minutes: 33,
    seconds: 59,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        const months = Math.floor(totalDays / 30);
        const days = totalDays % 30;
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ months, days, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: containerRef }
  );

  const timeBlocks = [
    { label: "MONTHS", value: timeLeft.months, highlight: false },
    { label: "DAYS", value: timeLeft.days, highlight: false },
    { label: "HOURS", value: timeLeft.hours, highlight: false },
    { label: "MIN", value: timeLeft.minutes, highlight: false },
    { label: "SEC", value: timeLeft.seconds, highlight: true },
  ];

  return (
    <div ref={containerRef} className="mt-28 mb-16 text-center max-w-5xl mx-auto px-4">
      {/* Title: Last (white) + Submit (cyan) matching reference image */}
      <h3 className="font-display text-4xl sm:text-6xl font-bold mb-12 tracking-tight">
        <span className="text-white">Last </span>
        <span className="text-[#00E5FF] font-mono tracking-wider">Submit</span>
      </h3>

      {/* Digit Boxes Container */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {timeBlocks.map((block, index) => (
          <div key={block.label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center">
              {/* Digit Box */}
              <div className="bg-[#050B18] border border-[#00E5FF]/40 rounded-xl px-4 sm:px-6 py-4 sm:py-5 shadow-[0_0_20px_rgba(0,229,255,0.15)] min-w-[70px] sm:min-w-[95px] flex items-center justify-center">
                <span
                  className={`font-mono text-4xl sm:text-6xl font-semibold tracking-tight ${
                    block.highlight ? "text-[#00E5FF]" : "text-white"
                  }`}
                >
                  {String(block.value).padStart(2, "0")}
                </span>
              </div>
              {/* Label */}
              <span className="font-mono text-[10px] sm:text-xs font-medium uppercase tracking-widest text-[#7C8BA1] mt-3">
                {block.label}
              </span>
            </div>

            {/* Cyan Colon Separator */}
            {index < timeBlocks.length - 1 && (
              <span className="font-mono text-3xl sm:text-5xl font-bold text-[#00E5FF] -mt-6">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
