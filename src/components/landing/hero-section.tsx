"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";
import { REGISTRATION_DEADLINE } from "@/config/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useCountdown(target: string) {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const time = useCountdown(REGISTRATION_DEADLINE);

  useGSAP(
    () => {
      if (typeof window === "undefined") return;
      if (prefersReducedMotion()) {
        gsap.set(".hero-anim", { opacity: 1, y: 0 });
        return;
      }
      gsap.set(".hero-anim", { opacity: 0, y: 30 });
      gsap.to(".hero-anim", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "expo.out",
      });
      gsap.to(contentRef.current, {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: containerRef },
  );

  const blocks = [
    { label: "DAYS", value: time.days },
    { label: "HOURS", value: time.hours },
    { label: "MINUTES", value: time.minutes },
    { label: "SECONDS", value: time.seconds },
  ];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-28 pb-16 px-4 md:px-8 overflow-visible"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1E3A8A]/30 rounded-full blur-[140px]" />
      <Image
        src="/assets/image/logo_putih.svg"
        alt=""
        width={1000}
        height={1262}
        className="absolute right-[-40%] top-[10%] w-[80vw] max-w-[2000px] h-auto opacity-[0.08] pointer-events-none"
      />
      <div
        ref={contentRef}
        className="max-w-3xl mx-auto w-full z-10 text-center flex flex-col items-center"
      >
        <div className="hero-anim flex items-start justify-center gap-2 sm:gap-4">
          <div className="flex flex-col items-start">
            <h1 className="font-display font-extrabold text-white leading-none text-6xl sm:text-9xl tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              SEVENT
            </h1>
            <p className="pl-1.5 tracking-[0.34em] font-display font-bold text-[0.5rem] sm:text-[1.17rem] text-white flex justify-between w-full whitespace-nowrap">
              SOFTWARE ENGINEERING EVENT
            </p>
          </div>
          <p className="font-display font-extrabold text-white leading-none text-[5rem] sm:text-[11.4rem] -mt-[0.44rem] drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
            X
          </p>
        </div>
        <p className="hero-anim text-xs sm:text-[1.05rem] text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Tech for Society: Building Smart, Scalable, and Intuitive Solutions
        </p>

        <div className="hero-anim mt-10 w-full max-w-md sm:max-w-xl">
          <div className="border border-white/20 rounded-xl px-6 py-5 bg-white/[0.03] shadow-[0_0_35px_rgba(120,150,255,0.18)]">
            <p className="text-xs tracking-[0.2em] text-white mb-8">
              LAST REGISTRATION
            </p>
            <div className="flex items-start justify-center gap-3 sm:gap-5">
              {blocks.map((b, i) => (
                <div key={b.label} className="flex items-start gap-3 sm:gap-5">
                  <div className="flex flex-col items-center min-w-[52px]">
                    <span className="font-mono text-3xl sm:text-5xl font-bold text-white tabular-nums">
                      {String(b.value).padStart(2, "0")}
                    </span>
                    <span className="text-[0.75rem] tracking-widest text-white/90 mt-1">
                      {b.label}
                    </span>
                  </div>
                  {i < blocks.length - 1 && (
                    <span className="font-mono text-3xl sm:text-5xl text-white/80">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link href="/login" className="block mt-5 w-full">
            <button className="cursor-pointer w-full bg-white text-black font-semibold text-sm px-10 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-[0_0_35px_rgba(255,255,255,0.5)]">
              Register Now!
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
