"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const faqs = [
  { q: "AVAILABLE TIERS", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { q: "AVAILABLE TIERS", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { q: "AVAILABLE TIERS", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { q: "AVAILABLE TIERS", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { q: "GUIDEBOOK", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // no entrance animation on FAQ items to keep them stable
    },
    { scope: containerRef },
  );

  return (
    <section id="faq" ref={containerRef} className="relative py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-wide text-white text-center mb-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">FAQ</h2>
        <div className="faq-list flex flex-col gap-4">
          {faqs.map((f, i) => (
            <div key={i} className="faq-item border border-white/40 bg-white/[0.06] overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.06)] rounded-[2rem]">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="cursor-pointer w-full flex items-center justify-between px-7 py-4 text-left"
              >
                <span className="text-base font-semibold tracking-widest text-white/90">{f.q}</span>
                <Plus className={`w-5 h-5 text-white/70 transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <p className="overflow-hidden px-7 text-sm text-white/50 leading-relaxed">
                  <span className="block pb-5">{f.a}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
