"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Dummy data kompetisi (mock statis, akan diganti dengan data API di kemudian hari)
const competitions = [
  {
    id: "softdev",
    name: "SOFTDEV COMPETITION",
    logo: "/assets/image/logo_softdev.svg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a.",
  },
  {
    id: "uiux",
    name: "UI/UX DESIGN COMPETITION",
    logo: "/assets/image/logo_uiux.svg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a.",
  },
];

export default function PesertaCompetitionPage() {
  return (
    <div className="relative isolate space-y-6">
      {/* Blob warna redup di belakang supaya efek blur kaca kelihatan */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-10 left-[5%] h-72 w-72 rounded-full bg-[#7D8CFF]/15 blur-[110px]" />
        <div className="absolute top-1/3 right-[0%] h-80 w-80 rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-[30%] h-72 w-72 rounded-full bg-[#2A3568]/35 blur-[110px]" />
      </div>

      {/* Header */}
      <div className={`${glass} px-6 py-5 lg:px-8 lg:py-6`}>
        <h1 className="relative font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Competition
        </h1>
      </div>

      {/* Instruction */}
      <div className={`${glass} px-6 py-6 lg:px-8 lg:py-7`}>
        <h2 className="relative text-center font-display text-xl lg:text-2xl font-bold tracking-tight text-white">
          Choose your Competition
        </h2>
        <p className="relative mx-auto mt-2 max-w-3xl text-center text-sm text-text-secondary">
          You can pick the competition you want to join and you can create new
          team or join a team with a code.
        </p>
      </div>

      {/* Competition list */}
      <div className="space-y-5">
        {competitions.map((competition) => (
          <div key={competition.id} className={`${glass} p-6 lg:p-8`}>
            <div className="relative flex flex-col gap-6 sm:flex-row">
              {/* Competition logo */}
              <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:w-40">
                <Image
                  src={competition.logo}
                  alt={competition.name}
                  width={200}
                  height={200}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white">
                  {competition.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {competition.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/peserta/competition/${competition.id}`}>
                    <Button className="rounded-full bg-white px-5 h-10 text-xs font-semibold text-[#1B235E] shadow-sm hover:bg-white/90">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Create new Team
                    </Button>
                  </Link>
                  <Link href={`/peserta/competition/${competition.id}`}>
                    <Button className="rounded-full bg-primary px-5 h-10 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover">
                      Join Team
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
