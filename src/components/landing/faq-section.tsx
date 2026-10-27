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
  {
    q: "Siapa yang boleh ikut dan berapa anggota timnya?",
    a: "Siswa SMA/sederajat dan mahasiswa aktif S1/D4/D3 dari seluruh Indonesia dapat mengikuti kompetisi. Satu tim terdiri dari 3–5 orang untuk Software Development dan 1–3 orang untuk UI/UX Design. Seluruh anggota tim harus berasal dari institusi yang sama.",
  },
  {
    q: "Subtema apa yang bisa dipilih?",
    a: "Pilih satu subtema SDGs: Zero Hunger, Good Health and Well-being, Quality Education, Gender Equality, Decent Work and Economic Growth, atau Responsible Consumption and Production. Khusus Software Development, tersedia satu subtema tambahan: Industry, Innovation, and Infrastructure.",
  },
  {
    q: "Apa saja yang harus dikumpulkan?",
    a: "Software Development kategori website: URL website yang aktif dan link repository GitHub publik. Kategori mobile: file .apk (.ipa opsional) dan link repository GitHub publik. UI/UX Design: link project Figma dan link prototype Figma (Mobile atau Desktop). Semua lomba juga wajib mengumpulkan proposal dan surat pernyataan orisinalitas menggunakan template dari panitia.",
  },
  {
    q: "Apa syarat teknis yang perlu diperhatikan?",
    a: "Website harus aktif dan bisa diakses kapan saja; boleh menggunakan domain gratis maupun berbayar. File .apk harus bisa diinstal dan bebas malware. Repository GitHub wajib publik dan aktif selama perlombaan. Link Figma harus aktif, berstatus Public, dan memiliki akses View Only.",
  },
  {
    q: "Berapa karya yang boleh dikirim dan apakah harus orisinal?",
    a: "Setiap tim hanya boleh mengirim satu karya dan satu proposal. Karya harus merupakan ide asli tim tanpa plagiarisme. Keputusan juri bersifat final.",
  },
  {
    q: "GUIDEBOOK",
    a: (
      <>
        <a
          href="https://drive.google.com/drive/folders/1xr8xSS393c1DegO7hpV10VEEa_CS3bnS?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-white"
        >
          UI/UX Rulebook
        </a>
        <br />
        <a
          href="https://drive.google.com/drive/folders/1BbCrFSz9n7cMKORzgoKFoXP-wuEAeP2n?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-white"
        >
          Softdev Rulebook
        </a>
      </>
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
    <section id="faq" ref={containerRef} className="relative py-12 px-4 md:py-24 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display text-5xl sm:text-6xl font-extrabold tracking-wide text-white text-center mb-8 md:mb-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">FAQ</h2>
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
