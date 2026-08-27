"use client";

// TODO: connect ke API setelah backend endpoint publik untuk judges tersedia.

import { useRef, useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/accessibility";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ... (Interface dan const appraisers tetap sama persis seperti sebelumnya) ...
interface Appraiser {
  id: string;
  name: string;
  role: string;
  institution: string;
  bio: string;
  avatarUrl: string;
  initials: string;
}

const appraisers: Appraiser[] = [
  {
    id: "1",
    name: "Abed Nego Septiadi",
    role: "Senior Engineer",
    institution: "Telkom University",
    bio: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    initials: "AS",
  },
  {
    id: "2",
    name: "Amanda Syahrani",
    role: "Product Designer",
    institution: "UI/UX Studio",
    bio: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    initials: "AS",
  },
  {
    id: "3",
    name: "Jhon Doe",
    role: "Tech Lead",
    institution: "Google",
    bio: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    initials: "JD",
  },
  {
    id: "4",
    name: "Jane Smith",
    role: "UX Researcher",
    institution: "Meta",
    bio: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    initials: "JS",
  },
  {
    id: "5",
    name: "Michael Chen",
    role: "Data Scientist",
    institution: "OpenAI",
    bio: "Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit, Sed Do Eiusmod Tempor Incididunt Ut Labore Et Dolore Magna Aliqua.",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    initials: "MC",
  },
];

export function AppraisersSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", slidesToScroll: 1 },
    [Autoplay({ delay: 3500, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onInit();
    onSelect();

    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || typeof window === "undefined") return;

      gsap.from(headerRef.current, {
        opacity: 0,
        y: 20, // Diperhalus jarak animasinya
        duration: 1,
        ease: "power2.out", // Lebih natural dari power3
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 85%",
        },
      });

      if (containerRef.current) {
        gsap.from(containerRef.current.querySelector(".embla"), {
          opacity: 0,
          y: 30,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        });
      }
    },
    { scope: containerRef },
  );

  return (
    <section
      id="appraisers"
      ref={containerRef}
      className="pb-24 pt-14 px-4 md:px-8 bg-transparent relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            <span className="text-white">The </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-300 to-[#00E5FF]">
              Expert{" "}
            </span>
            <span className="text-white">Appraisers</span>
          </h2>
          <p className="text-white/60 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            Industry leaders and tech giants from across the globe joining us to
            mentor and judge the next generation of innovators.
          </p>
        </div>

        <div className="embla overflow-visible relative py-4" ref={emblaRef}>
          <div className="embla__container flex -ml-6">
            {appraisers.map((item, index) => {
              const isActive = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className="embla__slide flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-6"
                >
                  <div
                    className={`transition-all duration-500 ease-out border rounded-2xl p-8 flex flex-col items-center text-center h-full group ${
                      isActive
                        ? "bg-[#2A2E35] border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] scale-100 opacity-100"
                        : "bg-[#1E2126] border-transparent shadow-lg scale-[0.98] opacity-65 hover:opacity-85 cursor-pointer"
                    }`}
                    onClick={() => scrollTo(index)}
                  >
                    <Avatar
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl mb-6 transition-all duration-500 ${
                        isActive
                          ? "ring-2 ring-[#00E5FF]/60 ring-offset-4 ring-offset-[#2A2E35]"
                          : "ring-1 ring-white/10 group-hover:ring-white/30"
                      }`}
                    >
                      <AvatarImage
                        src={item.avatarUrl}
                        alt={item.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#1E2126] text-white/70 font-display">
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>

                    <h4
                      className={`font-display font-medium text-lg mb-1 transition-colors ${isActive ? "text-white" : "text-white/80"}`}
                    >
                      {item.name}
                    </h4>

                    <p
                      className={`font-mono text-[10px] sm:text-xs font-medium tracking-widest uppercase mb-5 ${isActive ? "text-[#00E5FF]" : "text-white/40"}`}
                    >
                      {item.role} <span className="opacity-50">@</span>{" "}
                      {item.institution}
                    </p>

                    <p className="text-xs text-white/50 leading-loose max-w-xs font-light">
                      {item.bio}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indikator yang lebih clean, tanpa shadow berlebih */}
        <div className="flex items-center justify-center gap-6 mt-12">
          <button
            onClick={scrollPrev}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            {(scrollSnaps.length > 0 ? scrollSnaps : appraisers).map(
              (_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 cursor-pointer rounded-full ${
                    idx === selectedIndex
                      ? "w-8 h-1.5 bg-linear-to-r from-teal-400 to-[#00E5FF]"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ),
            )}
          </div>

          <button
            onClick={scrollNext}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
