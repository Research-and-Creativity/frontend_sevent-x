"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  useCompetitions,
  useCreateTeam,
  useJoinTeam,
  useProfileComplete,
  useUserTeam,
} from "@/hooks/use-peserta";
import type { Competition } from "@/types/api";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Tombol pill (list)
const pillButton = "rounded-full px-5 h-10 text-xs font-semibold shadow-sm";

// Input pill pada modal dark glass
const modalInput =
  "h-14 w-full rounded-full border border-white/30 bg-white/[0.03] px-6 text-sm text-white " +
  "placeholder:text-white/40 focus:outline-none focus:border-[#7D8CFF]/70 transition-colors";

// Tombol submit pada modal dark glass (putih, glow biru)
const modalSubmit =
  "rounded-full bg-white px-8 h-11 text-sm font-bold text-[#2E5CFF] " +
  "shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90";

// Backend tidak menyimpan logo kompetisi, jadi dipetakan dari slug.
// Slug yang tidak dikenali memakai logo generik.
const COMPETITION_LOGOS: Record<string, string> = {
  softdev: "/assets/image/logo_softdev.svg",
  uiux: "/assets/image/logo_uiux.svg",
};
const FALLBACK_LOGO = "/assets/image/logo_biru.svg";

function getCompetitionLogo(slug: string) {
  return COMPETITION_LOGOS[slug] ?? FALLBACK_LOGO;
}

// Ambil pesan error dari respons axios supaya pesan backend tampil apa adanya.
function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return err instanceof Error ? err.message : fallback;
}

export default function PesertaCompetitionPage() {
  const router = useRouter();

  const { data: competitions = [], isLoading, isError } = useCompetitions();
  const { data: userTeam } = useUserTeam();
  const {
    isComplete: profileComplete,
    isLoading: profileLoading,
    missingFields,
  } = useProfileComplete();
  const createTeamMutation = useCreateTeam();
  const joinTeamMutation = useJoinTeam();

  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [activeSlug, setActiveSlug] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    setModalType("join");
  };

  const closeModal = () => {
    setModalType(null);
    setError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = teamName.trim();

    if (!name) {
      setError("Nama tim tidak boleh kosong.");
      return;
    }

    try {
      const created = await createTeamMutation.mutateAsync({
        name,
        competitionSlug: activeSlug,
      });
      closeModal();
      toast.success(`Tim "${created?.teamName ?? name}" berhasil dibuat!`);
      router.push(`/peserta/competition/${activeSlug}`);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal membuat tim."));
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = teamCode.trim().toUpperCase();

    if (!code) {
      setError("Kode tim tidak boleh kosong.");
      return;
    }

    try {
      const joined = await joinTeamMutation.mutateAsync({ teamCode: code });
      closeModal();
      toast.success(`Berhasil bergabung dengan "${joined?.teamName ?? code}"`);
      // Tim yang diikuti bisa saja milik kompetisi lain, jadi andalkan slug
      // dari respons server, bukan competitionslug yang sedang aktif.
      router.push(`/peserta/competition/${joined?.competition?.slug ?? activeSlug}`);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal bergabung dengan tim."));
    }
  };

  // Tim peserta hanya boleh ada di satu kompetisi.
  const joinedCompetitionSlug = userTeam?.competition?.slug ?? null;

  const renderActions = (competition: Competition) => {
    if (joinedCompetitionSlug === competition.slug) {
      return (
        <Button
          type="button"
          onClick={() => router.push(`/peserta/competition/${competition.slug}`)}
          className={`${pillButton} bg-white text-[#1B235E] hover:bg-white/90`}
        >
          Manage your Team
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      );
    }

    // Mendaftarkan tim butuh profil yang sudah lengkap. Ini gerbang UX, bukan
    // gerbang keamanan; yang menentukan boleh submit karya tetap isEligible
    // di backend.
    if (!profileLoading && !profileComplete) {
      return (
        <Button
          type="button"
          onClick={() => router.push("/peserta/profile")}
          className={`${pillButton} border border-white/20 bg-white/[0.05] text-white hover:bg-white/[0.1]`}
        >
          Complete Profile First
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      );
    }

    // Backend hanya mengembalikan kompetisi aktif (GET /competitions memfilter
    // isActive) dan createTeam menolak kompetisi tidak aktif, jadi di sini
    // selalu ada aksi.
    return (
      <>
        <Button
          type="button"
          onClick={() => openCreate(competition.slug)}
          className={`${pillButton} bg-white text-[#1B235E] hover:bg-white/90`}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create new Team
        </Button>
        <Button
          type="button"
          onClick={() => openJoin(competition.slug)}
          className={`${pillButton} bg-primary text-white hover:bg-primary-hover`}
        >
          Join Team
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </>
    );
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

      {/* Profile gate: clearer than letting the button fail later */}
      {!profileLoading && !profileComplete && (
        <div className={`${glass} flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8`}>
          <div className="relative">
            <h2 className="font-display text-lg font-bold tracking-tight text-white">
              Complete your profile first
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Still missing: {missingFields.join(", ")}. You need a complete
              profile before registering for a competition.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push("/peserta/profile")}
            className={`${pillButton} shrink-0 bg-white text-[#1B235E] hover:bg-white/90`}
          >
            Complete Profile
          </Button>
        </div>
      )}

      {/* Competition list */}
      <div className="space-y-5">
        {isLoading &&
          [0, 1].map((i) => (
            <div key={i} className={`${glass} p-6 lg:p-8`}>
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="h-40 w-full shrink-0 animate-pulse rounded-xl border border-white/10 bg-white/[0.03] sm:w-40" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-1/2 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
                </div>
              </div>
            </div>
          ))}

        {isError && (
          <div className={`${glass} px-6 py-10 text-center lg:px-8`}>
            <p className="relative text-sm text-text-secondary">
              Gagal memuat daftar kompetisi. Coba muat ulang halaman.
            </p>
          </div>
        )}

        {!isLoading && !isError && competitions.length === 0 && (
          <div className={`${glass} px-6 py-10 text-center lg:px-8`}>
            <p className="relative text-sm text-text-secondary">
              Belum ada kompetisi yang tersedia.
            </p>
          </div>
        )}

        {competitions.map((competition) => (
          <div key={competition.id} className={`${glass} p-6 lg:p-8`}>
            <div className="relative flex flex-col gap-6 sm:flex-row">
              {/* Competition logo */}
              <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:w-40">
                <Image
                  src={getCompetitionLogo(competition.slug)}
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
                  {renderActions(competition)}
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
          className="max-w-lg rounded-3xl border border-white/20 bg-[#1A1D24]/90 p-8 text-white shadow-[0_0_60px_rgba(125,140,255,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-white">
              Create new Team
            </DialogTitle>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/60 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-2">
            <label htmlFor="team-name" className="block text-sm text-white/60">
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
            {error && <p className="text-xs text-rose-400">{error}</p>}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={createTeamMutation.isPending}
                className={modalSubmit}
              >
                {createTeamMutation.isPending ? "Submitting..." : "Submit"}
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
          className="max-w-lg rounded-3xl border border-white/20 bg-[#1A1D24]/90 p-8 text-white shadow-[0_0_60px_rgba(125,140,255,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-white">
              Join Team
            </DialogTitle>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/60 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-2">
            <label htmlFor="team-code" className="block text-sm text-white/60">
              Team Code
            </label>
            <input
              id="team-code"
              type="text"
              placeholder="Team Code"
              value={teamCode}
              onChange={(e) => {
                setTeamCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              className={modalInput}
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={joinTeamMutation.isPending}
                className={modalSubmit}
              >
                {joinTeamMutation.isPending ? "Joining..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}