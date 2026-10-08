"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Tombol pill (list)
const pillButton = "rounded-full px-5 h-10 text-xs font-semibold shadow-sm";

// Input pill pada modal light
const modalInput =
  "h-14 w-full rounded-full border border-neutral-400/60 bg-white/50 px-6 text-sm text-neutral-800 " +
  "placeholder:text-neutral-400 focus:outline-none focus:border-[#2E5CFF]/70 transition-colors";

// Tombol submit pada modal light (putih, glow biru)
const modalSubmit =
  "rounded-full bg-white px-8 h-11 text-sm font-bold text-[#2E5CFF] " +
  "shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90";

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

// Mock data untuk validasi create/join (akan diganti dengan data API)
const EXISTING_TEAM_NAMES = [
  "Tim Anomali",
  "Coba Coba Saja",
  "Adalah Pokoknya",
];

const VALID_TEAM_CODES: Record<string, string> = {
  XYZ092E: "Tim Anomali",
  ABC1234: "Coba Coba Saja",
};

export default function PesertaCompetitionPage() {
  const router = useRouter();

  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [activeSlug, setActiveSlug] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joinStage, setJoinStage] = useState<"input" | "confirm">("input");
  const [foundTeam, setFoundTeam] = useState("");

  const openCreate = (slug: string) => {
    setActiveSlug(slug);
    setTeamName("");
    setError(null);
    setModalType("create");
  };

  const openJoin = (slug: string) => {
    setActiveSlug(slug);
    setTeamCode("");
    setError(null);
    setJoinStage("input");
    setFoundTeam("");
    setModalType("join");
  };

  const closeModal = () => {
    setModalType(null);
    setError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = teamName.trim();

    if (!name) {
      setError("Nama tim tidak boleh kosong.");
      return;
    }
    if (
      EXISTING_TEAM_NAMES.some((n) => n.toLowerCase() === name.toLowerCase())
    ) {
      setError("Nama tim sudah digunakan. Gunakan nama lain.");
      return;
    }

    setError(null);
    const slug = activeSlug;
    closeModal();
    router.push(`/peserta/competition/${slug}`);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = teamCode.trim().toUpperCase();

    if (!code) {
      setError("Kode tim tidak boleh kosong.");
      return;
    }

    const team = VALID_TEAM_CODES[code];
    if (!team) {
      setError("Kode tim tidak sesuai.");
      return;
    }

    setError(null);
    setFoundTeam(team);
    setJoinStage("confirm");
  };

  const handleJoinConfirm = () => {
    const slug = activeSlug;
    closeModal();
    router.push(`/peserta/competition/${slug}`);
  };

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
                  <Button
                    type="button"
                    onClick={() => openCreate(competition.id)}
                    className={`${pillButton} bg-white text-[#1B235E] hover:bg-white/90`}
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create new Team
                  </Button>
                  <Button
                    type="button"
                    onClick={() => openJoin(competition.id)}
                    className={`${pillButton} bg-primary text-white hover:bg-primary-hover`}
                  >
                    Join Team
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create new Team */}
      <Dialog
        open={modalType === "create"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-lg rounded-3xl border border-white/50 bg-neutral-200/95 p-8 text-neutral-800 shadow-[0_0_60px_rgba(125,140,255,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-neutral-800">
              Create new Team
            </DialogTitle>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400/60 text-neutral-500 transition-colors hover:text-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <label
              htmlFor="team-name"
              className="block text-sm text-neutral-500"
            >
              Team Name
            </label>
            <input
              id="team-name"
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                if (error) setError(null);
              }}
              className={modalInput}
            />
            {error && <p className="text-xs text-rose-500">{error}</p>}

            <div className="flex justify-end pt-4">
              <Button type="submit" className={modalSubmit}>
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Join Team */}
      <Dialog
        open={modalType === "join"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-lg rounded-3xl border border-white/50 bg-neutral-200/95 p-8 text-neutral-800 shadow-[0_0_60px_rgba(125,140,255,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-neutral-800">
              Join Team
            </DialogTitle>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400/60 text-neutral-500 transition-colors hover:text-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {joinStage === "input" ? (
            <form onSubmit={handleJoinSubmit} className="space-y-2">
              <label
                htmlFor="team-code"
                className="block text-sm text-neutral-500"
              >
                Team Code
              </label>
              <input
                id="team-code"
                type="text"
                placeholder="Team Code"
                value={teamCode}
                onChange={(e) => {
                  setTeamCode(e.target.value);
                  if (error) setError(null);
                }}
                className={modalInput}
              />
              {error && <p className="text-xs text-rose-500">{error}</p>}

              <div className="flex justify-end pt-4">
                <Button type="submit" className={modalSubmit}>
                  Submit
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="py-6 text-center">
                <p className="text-sm text-neutral-500">Team founded!</p>
                <p className="mt-3 font-display text-4xl font-extrabold tracking-tight text-neutral-800">
                  {foundTeam}
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleJoinConfirm}
                  className={modalSubmit}
                >
                  Join Team
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
