"use client";

import { useRef, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const para = "";

const faqs = [
  {
    q: "Siapa yang boleh ikut dan berapa anggota timnya?",
    a: (
      <>
        <p className={para}>
          Siswa SMA/sederajat dan mahasiswa aktif S1/D4/D3 dari seluruh Indonesia
          dapat mengikuti kompetisi.
        </p>
        <p className={para}>
          Satu tim terdiri dari 3–5 orang untuk Software Development dan 1–3 orang
          untuk UI/UX Design. Seluruh anggota tim harus berasal dari institusi
          yang sama.
        </p>
      </>
    ),
  },
  {
    q: "Subtema apa yang bisa dipilih?",
    a: (
      <>
        <p className={para}>
          Pilih satu subtema SDGs: Zero Hunger, Good Health and Well-being,
          Quality Education, Gender Equality, Decent Work and Economic Growth,
          atau Responsible Consumption and Production.
        </p>
        <p className={para}>
          Khusus Software Development, tersedia satu subtema tambahan: Industry,
          Innovation, and Infrastructure.
        </p>
      </>
    ),
  },
  {
    q: "Apa saja yang harus dikumpulkan?",
    a: (
      <>
        <p className={para}>
          <span className="font-semibold text-white/90">Software Development</span>{" "}
          — kategori website: URL website yang aktif dan link repository GitHub
          publik. Kategori mobile: file .apk (.ipa opsional) dan link repository
          GitHub publik.
        </p>
        <p className={para}>
          <span className="font-semibold text-white/90">UI/UX Design</span> — link
          project Figma dan link prototype Figma (Mobile atau Desktop).
        </p>
        <p className={para}>
          Semua lomba juga wajib mengumpulkan proposal dan surat pernyataan
          orisinalitas menggunakan template dari panitia.
        </p>
      </>
    ),
  },
  {
    q: "Apa syarat teknis yang perlu diperhatikan?",
    a: (
      <>
        <p className={para}>
          Website harus aktif dan bisa diakses kapan saja; boleh menggunakan domain
          gratis maupun berbayar. File .apk harus bisa diinstal dan bebas malware.
        </p>
        <p className={para}>
          Repository GitHub wajib publik dan aktif selama perlombaan. Link Figma
          harus aktif, berstatus Public, dan memiliki akses View Only.
        </p>
      </>
    ),
  },
  {
    q: "Berapa karya yang boleh dikirim dan apakah harus orisinal?",
    a: (
      <>
        <p className={para}>
          Setiap tim hanya boleh mengirim satu karya dan satu proposal.
        </p>
        <p className={para}>
          Karya harus merupakan ide asli tim tanpa plagiarisme. Keputusan juri
          bersifat final.
        </p>
      </>
    ),
  },
  {
    q: "GUIDEBOOK",
    a: (
      <div className="flex flex-wrap gap-3">
        <a
          href="https://drive.google.com/drive/folders/1xr8xSS393c1DegO7hpV10VEEa_CS3bnS?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.05] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/40"
        >
          UI/UX Rulebook
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="https://drive.google.com/drive/folders/1BbCrFSz9n7cMKORzgoKFoXP-wuEAeP2n?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.05] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/40"
        >
          Softdev Rulebook
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    ),
  },
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
    <section
      id="faq"
      ref={containerRef}
      className="relative px-4 py-12 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-8 text-center font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:mb-12">
          FAQ
        </h2>
        <div className="flex flex-col gap-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] transition-colors hover:bg-white/[0.06]"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-white/95 sm:text-lg">
                  {f.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-white/60 transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-white/10 bg-white/[0.02] px-6 py-6 text-sm leading-relaxed text-white/75 sm:text-[15px]">
                    <div className="max-w-prose space-y-3">{f.a}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
