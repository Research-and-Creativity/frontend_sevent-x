"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, UploadCloud, ExternalLink, Copy, Pencil } from "lucide-react";
import { RULEBOOK_LINKS } from "@/config/site";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Submission } from "@/types/api";
import { getTeamMemberLimits } from "@/lib/team-member-limits";
import {
  useCompetition,
  useCreateOrUpdateSubmission,
  useSubmissionEligibility,
  useUploadPaymentProof,
  useUserMe,
  useUserSubmission,
  useUserTeam,
  useUpdateTeamName,
  useTransferLeadership,
  useKickMember,
  PAYMENT_PROOF_MAX_BYTES,
  SUBMISSION_DELIVERABLE_MAX_BYTES,
} from "@/hooks/use-peserta";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Input pill gelap sesuai desain
const glassInput =
  "h-14 w-full rounded-full border border-white/25 bg-white/[0.03] px-6 text-sm text-white " +
  "placeholder:text-white/40 focus:outline-none focus:border-[#7D8CFF]/70 transition-colors";

const PAYMENT_AMOUNT = "Rp80.000,-";

// Label dan flag-nya mengikuti slot unggah di halaman Profile. Keempat dokumen
// ini juga menjadi syarat kelayakan mengirim karya.
const MEMBER_VERIFICATION_DOCS = [
  { flag: "twibbonApproved", label: "Twibbon" },
  { flag: "shareStoryApproved", label: "Post Story" },
  { flag: "ktmApproved", label: "Student ID" },
  { flag: "instagramFollowApproved", label: "Follow Instagram Sevent.tup" },
] as const;

const ACCEPTED_UPLOAD_EXT = ".jpg,.jpeg,.png,.webp,.pdf,.zip,.rar";

// Tautan template proposal per kompetisi (satu folder berisi template Proposal Karya
// dan Proposal Orisinalitas). Dipakai di bawah kedua dropzone proposal.
const PROPOSAL_TEMPLATE_URLS: Record<string, string> = {
  "software-development": "https://drive.google.com/drive/folders/1o53aIbEjoNmFIEcPOp-G_ncghdqOWBpq",
  "ui-ux": "https://drive.google.com/drive/folders/1LyZZxsMfYACsdgcFIXzQvcOfwCuhmLWq",
};

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return err instanceof Error ? err.message : fallback;
}

// Field form mengikuti createSubmissionSchema di backend.
interface SubmissionForm {
  projectTitle: string;
  description: string;
  githubUrl: string;
  demoVideoUrl: string;
  deploymentUrl: string;
  figmaUrl: string;
  prototypeUrl: string;
}

const EMPTY_FORM: SubmissionForm = {
  projectTitle: "",
  description: "",
  githubUrl: "",
  demoVideoUrl: "",
  deploymentUrl: "",
  figmaUrl: "",
  prototypeUrl: "",
};

// Tautan yang diminta berbeda per kompetisi (aturan sama dengan
// requireCompleteSubmission di backend). Demonstration Video dipakai oleh
// kedua bidang lomba.
type LinkFieldName = keyof Omit<SubmissionForm, "projectTitle" | "description">;

const LINK_FIELDS_BY_COMPETITION: Record<
  string,
  Array<{ name: LinkFieldName; label: string; required: boolean }>
> = {
  "software-development": [
    { name: "githubUrl", label: "Github Repository", required: true },
    { name: "demoVideoUrl", label: "Demonstration Video", required: true },
    { name: "deploymentUrl", label: "Live Deployment", required: false },
  ],
  "ui-ux": [
    { name: "figmaUrl", label: "Figma Design", required: true },
    { name: "prototypeUrl", label: "Prototype", required: true },
  ],
};

// Tambahkan tautan yang sudah terisi di submission lama (mis. github/demo/
// deployment pada submission ui-ux dari form versi sebelumnya) agar data tidak
// hilang dari tampilan, meski bukan bagian dari spesifikasi kompetisi ini.
function linkFieldsFor(slug: string, existing: Submission | null | undefined) {
  const base =
    LINK_FIELDS_BY_COMPETITION[slug] ??
    LINK_FIELDS_BY_COMPETITION["software-development"];
  const names = new Set(base.map((f) => f.name));
  const labels: Record<LinkFieldName, string> = {
    githubUrl: "Github Repository",
    demoVideoUrl: "Demonstration Video",
    deploymentUrl: "Live Deployment",
    figmaUrl: "Figma Design",
    prototypeUrl: "Prototype",
  };
  const extra: Array<{ name: LinkFieldName; label: string; required: boolean }> = [];
  (Object.keys(labels) as LinkFieldName[]).forEach((name) => {
    if (!names.has(name) && existing?.[name]) {
      extra.push({ name, label: labels[name], required: false });
    }
  });
  return [...base, ...extra];
}

export default function CompetitionRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const proposalTemplateUrl =
    PROPOSAL_TEMPLATE_URLS[slug] ?? PROPOSAL_TEMPLATE_URLS["software-development"];

  const { data: competition } = useCompetition(slug);
  const { data: team, isLoading: teamLoading } = useUserTeam();
  const { data: eligibility } = useSubmissionEligibility();
  const { data: me } = useUserMe();
  const { data: existingSubmission } = useUserSubmission();
  const paymentProofMutation = useUploadPaymentProof();
  const submissionMutation = useCreateOrUpdateSubmission();
  const updateTeamNameMutation = useUpdateTeamName();
  const transferLeadershipMutation = useTransferLeadership();
  const kickMemberMutation = useKickMember();

  const paymentInputRef = useRef<HTMLInputElement>(null);
  const deliverableInputRef = useRef<HTMLInputElement>(null);
  const originalityInputRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [originalityFile, setOriginalityFile] = useState<File | null>(null);
  const [form, setForm] = useState<SubmissionForm>(EMPTY_FORM);
  const [formSourceId, setFormSourceId] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editTeamNameInput, setEditTeamNameInput] = useState("");
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [targetMemberForTransfer, setTargetMemberForTransfer] = useState<{
    id: string;
    name: string;
    role: string;
    userId: string;
  } | null>(null);
  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const [targetMemberForKick, setTargetMemberForKick] = useState<{
    id: string;
    name: string;
    role: string;
    userId: string;
  } | null>(null);

  // Isi form dari submission yang sudah pernah dikirim. Penyesuaian dilakukan
  // saat render (bukan effect) supaya tidak ada flash form kosong dan tidak
  // memicu render ganda.
  if (existingSubmission && formSourceId !== existingSubmission.id) {
    setFormSourceId(existingSubmission.id);
    setForm({
      projectTitle: existingSubmission.projectTitle ?? "",
      description: existingSubmission.description ?? "",
      githubUrl: existingSubmission.githubUrl ?? "",
      demoVideoUrl: existingSubmission.demoVideoUrl ?? "",
      deploymentUrl: existingSubmission.deploymentUrl ?? "",
      figmaUrl: existingSubmission.figmaUrl ?? "",
      prototypeUrl: existingSubmission.prototypeUrl ?? "",
    });
  }

  // Karya berstatus SUBMITTED sudah dikunci: tidak ada yang boleh mengeditnya
  // lagi, baik lewat formulir maupun lewat API (dicek ulang di backend).
  const isLocked = existingSubmission?.status === "SUBMITTED";

  const linkFields = linkFieldsFor(slug, existingSubmission);
  const rulebook = RULEBOOK_LINKS[slug];

  // Proposal yang sudah tersimpan di server. Ditampilkan kembali di kotak
  // unggah sebagai bukti terlampir, supaya peserta tidak mengira filenya
  // hilang setelah halaman dimuat ulang.
  const existingFileUrl = existingSubmission?.fileUrl ?? null;
  const rawName = existingFileUrl ? existingFileUrl.split("/").pop() : null;
  // URL Google Drive berakhir dengan "/view", jadi pakai nama generik agar
  // peserta tetap melihat bahwa proposal sudah terlampir.
  const existingFileName =
    rawName && rawName !== "view" && rawName.length > 0
      ? rawName
      : existingFileUrl
      ? "Proposal terlampir"
      : null;

  const existingOriginalityFileUrl = existingSubmission?.originalityFileUrl ?? null;
  const rawOriginalityName = existingOriginalityFileUrl
    ? existingOriginalityFileUrl.split("/").pop()
    : null;
  const existingOriginalityFileName =
    rawOriginalityName && rawOriginalityName !== "view" && rawOriginalityName.length > 0
      ? rawOriginalityName
      : existingOriginalityFileUrl
      ? "Proposal orisinalitas terlampir"
      : null;

  // Satu peserta hanya boleh punya satu tim, jadi halaman ini harus milik
  // kompetisi tempat timnya terdaftar.
  const teamBelongsHere = team?.competition?.slug === slug;

  useEffect(() => {
    if (teamLoading || !team) return;
    if (team.competition?.slug !== slug) {
      router.replace("/peserta/competition");
    }
  }, [teamLoading, team, slug, router]);

  const paymentApproved = eligibility?.requirements.paymentApproved ?? false;
  const paymentStatus = team?.paymentProof?.status ?? null;

  const requirements = eligibility?.requirements;
  const isEligible =
    (requirements?.teamApproved ?? false) &&
    (requirements?.paymentApproved ?? false) &&
    (requirements?.allMembersDocumentsApproved ?? false);
  const allDocsApproved = requirements?.allMembersDocumentsApproved ?? false;

  const members = useMemo(
    () =>
      (team?.members ?? [])
        .map((member) => ({
          id: member.id,
          name: member.user?.fullName ?? "Unknown member",
          role: member.role,
          userId: member.userId,
        }))
        .sort((a, b) => (a.role === "LEADER" ? -1 : b.role === "LEADER" ? 1 : 0)),
    [team],
  );

  const teamMemberLimits = getTeamMemberLimits(slug);
  const maxTeamMembers = Math.min(
    competition?.maxMember ?? teamMemberLimits.max,
    teamMemberLimits.max,
  );
  const isLeader = members.some((m) => m.role === "LEADER" && m.userId === me?.id);

  const handlePickProof = () => paymentInputRef.current?.click();

  const handleProofSelected = (file: File | undefined) => {
    if (!file) return;
    if (file.size > PAYMENT_PROOF_MAX_BYTES) {
      toast.error(`Ukuran file maksimal ${formatBytes(PAYMENT_PROOF_MAX_BYTES)}.`);
      return;
    }
    setProofFile(file);
  };

  const handleSubmitPayment = async () => {
    if (!team) return;
    if (!proofFile) {
      toast.error("Pilih bukti pembayaran terlebih dahulu.");
      return;
    }
    try {
      await paymentProofMutation.mutateAsync({ teamId: team.id, file: proofFile });
      toast.success("Bukti pembayaran terkirim dan menunggu review.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengunggah bukti pembayaran."));
    }
  };

  const handleUpdateTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editTeamNameInput.trim();
    if (!trimmed) {
      toast.error("Nama tim tidak boleh kosong.");
      return;
    }
    if (trimmed === team?.teamName) {
      setShowEditTeamModal(false);
      return;
    }
    try {
      await updateTeamNameMutation.mutateAsync(trimmed);
      toast.success("Nama tim berhasil diubah!");
      setShowEditTeamModal(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengubah nama tim."));
    }
  };

  const handleTransferLeadership = async () => {
    if (!targetMemberForTransfer) return;
    try {
      await transferLeadershipMutation.mutateAsync(targetMemberForTransfer.userId);
      toast.success(
        `Kepemimpinan berhasil dialihkan kepada ${targetMemberForTransfer.name}!`,
      );
      setTargetMemberForTransfer(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengalihkan kepemimpinan tim."));
    }
  };

  const handleKickMember = async () => {
    if (!targetMemberForKick || !team) return;
    try {
      await kickMemberMutation.mutateAsync({
        teamId: team.id,
        memberId: targetMemberForKick.id,
      });
      toast.success(`${targetMemberForKick.name} berhasil dikeluarkan dari tim.`);
      setTargetMemberForKick(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengeluarkan anggota tim."));
    }
  };

  const handlePickDeliverable = () => deliverableInputRef.current?.click();

  const handleDeliverableSelected = (file: File | undefined) => {
    if (!file) return;
    if (file.size > SUBMISSION_DELIVERABLE_MAX_BYTES) {
      toast.error(
        `Ukuran file maksimal ${formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)}.`,
      );
      return;
    }
    setDeliverableFile(file);
  };

  const handlePickOriginality = () => originalityInputRef.current?.click();

  const handleOriginalitySelected = (file: File | undefined) => {
    if (!file) return;
    if (file.size > SUBMISSION_DELIVERABLE_MAX_BYTES) {
      toast.error(
        `Ukuran file maksimal ${formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)}.`,
      );
      return;
    }
    setOriginalityFile(file);
  };

  // Satu payload untuk dua aksi; yang membedakan hanya status yang dikirim.
  const saveWork = async (status: "DRAFT" | "SUBMITTED") => {
    if (status === "SUBMITTED" && members.length < teamMemberLimits.min) {
      toast.error(
        `Tim harus memiliki minimal ${teamMemberLimits.min} anggota termasuk ketua sebelum mengirim karya.`,
      );
      return;
    }
    if (status === "SUBMITTED" && members.length > maxTeamMembers) {
      toast.error(`Tim maksimal terdiri dari ${maxTeamMembers} anggota termasuk ketua.`);
      return;
    }

    // Block submit kalau dokumen verifikasi belum semua disetujui
    if (status === "SUBMITTED" && !allDocsApproved) {
      toast.error("Dokumen verifikasi belum lengkap atau belum disetujui admin. Silakan lengkapi di halaman Profile.");
      router.push("/peserta/profile");
      return;
    }
    if (status === "SUBMITTED" && !isEligible) {
      toast.error("Belum memenuhi syarat pengumpulan karya.");
      return;
    }
    if (!isLeader && status === "SUBMITTED") {
      toast.error("Hanya leader yang boleh mengirim karya tim.");
      return;
    }

    // Proposal yang sudah terlampir tidak wajib diunggah ulang: backend
    // mempertahankan fileUrl lama selama tidak ada file baru yang dikirim.
    // Hanya pengiriman final yang mewajibkannya, Simpan Draft memang longgar.
    if (status === "SUBMITTED" && !deliverableFile && !existingFileUrl) {
      toast.error("Lampirkan proposal karya terlebih dahulu.");
      return;
    }
    if (status === "SUBMITTED" && !originalityFile && !existingOriginalityFileUrl) {
      toast.error("Lampirkan proposal orisinalitas terlebih dahulu.");
      return;
    }

    const payload = new FormData();
    if (deliverableFile) payload.append("file", deliverableFile);
    if (originalityFile) payload.append("originalityFile", originalityFile);
    payload.append("projectTitle", form.projectTitle.trim());
    payload.append("description", form.description.trim());
    payload.append("githubUrl", form.githubUrl.trim());
    payload.append("demoVideoUrl", form.demoVideoUrl.trim());
    payload.append("deploymentUrl", form.deploymentUrl.trim());
    payload.append("figmaUrl", form.figmaUrl.trim());
    payload.append("prototypeUrl", form.prototypeUrl.trim());
    payload.append("status", status);

    try {
      await submissionMutation.mutateAsync(payload);
      // Lepas file lokal; nilai yang tampil kini diambil dari server.
      setDeliverableFile(null);
      setOriginalityFile(null);
      toast.success(
        status === "SUBMITTED"
          ? "Karya berhasil dikirim dan tidak bisa diubah lagi."
          : "Draft tersimpan. Kamu bisa melanjutkannya kapan saja."
      );
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          status === "SUBMITTED" ? "Gagal mengirim karya." : "Gagal menyimpan draft."
        )
      );
    }
  };

  const handleSaveDraft = () => void saveWork("DRAFT");

  const handleSubmitAll = () => {
    if (!isLeader) {
      toast.error("Hanya leader yang boleh mengirim karya tim.");
      return;
    }
    void saveWork("SUBMITTED");
  };

  const renderEmptyState = (message: string) => (
    <div className={`${glass} px-6 py-12 text-center lg:px-8`}>
      <p className="relative text-sm text-text-secondary">{message}</p>
      <Button
        type="button"
        onClick={() => router.push("/peserta/competition")}
        className="relative mt-6 rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-sm hover:bg-white/90"
      >
        Back to Competition
      </Button>
    </div>
  );

  if (!teamLoading && !team) {
    return (
      <div className="relative isolate space-y-6">
        {renderEmptyState("Kamu belum punya tim untuk kompetisi ini.")}
      </div>
    );
  }

  if (!teamLoading && team && !teamBelongsHere) {
    return (
      <div className="relative isolate space-y-6">
        {renderEmptyState("Tim kamu terdaftar pada kompetisi lain.")}
      </div>
    );
  }

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
        <div>
          <h1 className="relative font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Competition
            <span className="mx-3 text-white/60">•</span>
            {competition?.name ?? "..."}
          </h1>
          {rulebook && (
            <a
              href={rulebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 text-[#7D8CFF]" />
              {rulebook.label}
            </a>
          )}
        </div>
      </div>

      {/* Team Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <div className="relative mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Team Information
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-white/90">
                Team Name • <span className="font-bold text-[#7D8CFF] text-base">{team?.teamName ?? "..."}</span>
              </p>
              {isLeader && (
                <button
                  type="button"
                  onClick={() => {
                    setEditTeamNameInput(team?.teamName ?? "");
                    setShowEditTeamModal(true);
                  }}
                  aria-label="Ubah Nama Tim"
                  title="Ubah Nama Tim"
                  className="cursor-pointer p-1 rounded-md text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.03] text-text-secondary">
              <span className="text-white font-semibold">{members.length}</span> / {maxTeamMembers} anggota
            </span>
            {team?.teamCode && (
              <div className="flex items-center gap-2 rounded-xl border border-[#7D8CFF]/40 bg-[#7D8CFF]/10 px-3.5 py-1.5 shadow-[0_0_15px_rgba(125,140,255,0.15)]">
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/70">
                  Team Code:
                </span>
                <span className="font-mono text-sm font-extrabold tracking-widest text-white">
                  {team.teamCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(team.teamCode);
                    toast.success("Kode tim berhasil disalin!");
                  }}
                  title="Salin Kode Tim"
                  className="cursor-pointer ml-1 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="relative mb-4 text-sm text-text-secondary">
          Tim wajib beranggotakan {teamMemberLimits.min}–
          {maxTeamMembers} orang termasuk ketua sebelum karya dikirim.
        </p>

        <div className="relative space-y-3">
          {/* Semua anggota memakai container full-width yang sama, ketua
              tampil lebih dulu. */}
          {members.map((member) => {
            const isMemberLeader = member.role === "LEADER";
            return (
              <div
                key={member.id}
                className="flex h-12 items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-5"
              >
                <span className="text-sm text-white">{member.name}</span>
                {isMemberLeader ? (
                  <span className="rounded-full border border-white/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                    Leader
                  </span>
                ) : (
                  /* Hanya ketua yang boleh mengeluarkan anggota atau transfer leadership */
                  isLeader && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMemberForTransfer(member);
                          setShowTransferConfirm(true);
                        }}
                        title={`Jadikan ${member.name} sebagai Ketua Tim`}
                        className="cursor-pointer rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-text-secondary hover:border-white/30 hover:text-white transition-colors"
                      >
                        Jadikan Ketua
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMemberForKick(member);
                          setShowKickConfirm(true);
                        }}
                        aria-label={`Remove ${member.name}`}
                        title={`Keluarkan ${member.name} dari tim`}
                        className="cursor-pointer p-1 text-rose-500/60 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dokumen verifikasi tim. Tampil sejak awal — bukan menunggu pembayaran
          disetujui — supaya peserta tahu dokumen mana yang masih kurang dan
          untuk siapa, lengkap dengan tautan ke halaman pengunggahannya. */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative mb-1 font-display text-xl font-bold tracking-tight text-white">
          Dokumen Verifikasi Anggota Tim
        </h2>
        <p className="relative text-sm text-text-secondary">
          Keempat dokumen di bawah diunggah per anggota melalui halaman Profile.
          Semuanya harus disetujui sebelum karya bisa dikirim.
        </p>

        {(requirements?.members ?? []).length === 0 ? (
          <p className="relative mt-4 text-sm text-text-secondary">
            Belum ada anggota tim yang terdaftar.
          </p>
        ) : (
          <ul className="relative mt-5 space-y-4">
            {(requirements?.members ?? []).map((member) => (
              <li key={member.userId} className="space-y-2">
                <p className="text-sm font-semibold text-white">
                  {member.fullName}
                  <span className="ml-2 text-xs font-normal text-text-secondary">
                    {member.role === "LEADER" ? "Leader" : "Anggota"}
                  </span>
                </p>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {MEMBER_VERIFICATION_DOCS.map((doc) => {
                    const approved = member[doc.flag];
                    return (
                      <li
                        key={doc.flag}
                        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5"
                      >
                        <span className={approved ? "text-emerald-400" : "text-white/30"}>
                          {approved ? "✓" : "✗"}
                        </span>
                        <span
                          className={
                            approved
                              ? "text-sm text-white"
                              : "text-sm text-text-secondary"
                          }
                        >
                          {doc.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}

        <div className="relative mt-5">
          <Button
            type="button"
            onClick={() => router.push("/peserta/profile#verification-document")}
            className="rounded-full border border-white/20 bg-white/[0.05] px-5 h-9 text-xs font-semibold text-white hover:bg-white/[0.1]"
          >
            Unggah Dokumen di Profile
          </Button>
        </div>
      </div>

      {paymentApproved ? (
        <>
          {/* Submission Requirements checklist */}
          <div className={`${glass} p-6 lg:p-8`}>
            <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-4">
              Submission Requirements
            </h2>
            <ul className="relative space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                {requirements?.teamApproved ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <span className="text-white/30">✗</span>
                )}
                <span className={requirements?.teamApproved ? "text-white" : "text-text-secondary"}>
                  Tim disetujui
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                {requirements?.paymentApproved ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <span className="text-white/30">✗</span>
                )}
                <span className={requirements?.paymentApproved ? "text-white" : "text-text-secondary"}>
                  Pembayaran disetujui
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                {requirements?.allMembersDocumentsApproved ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <span className="text-white/30">✗</span>
                )}
                <span className={requirements?.allMembersDocumentsApproved ? "text-white" : "text-text-secondary"}>
                  Semua dokumen anggota disetujui
                </span>
              </li>
            </ul>
            {!isEligible && (
              <div className="relative mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-sm text-text-secondary">
                  <span className="font-semibold text-white">Belum bisa mengumpulkan karya.</span>{" "}
                  {!allDocsApproved
                    ? "Semua dokumen verifikasi anggota tim harus diupload dan disetujui oleh Admin terlebih dahulu."
                    : !paymentApproved
                    ? "Pembayaran tim harus disetujui oleh Admin terlebih dahulu."
                    : "Lengkapi semua syarat di atas sebelum mengirim karya."}
                </p>
                {!allDocsApproved && (
                  <Button
                    type="button"
                    onClick={() => router.push("/peserta/profile#verification-document")}
                    className="mt-3 rounded-full border border-white/20 bg-white/[0.05] px-5 h-9 text-xs font-semibold text-white hover:bg-white/[0.1]"
                  >
                    Lengkapi Dokumen di Profile
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className={`${glass} p-6 lg:p-8`}>
            <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
              Product Information
            </h2>
            <p className="relative mt-2 text-sm text-text-secondary">
              You can fill this form with the Product Title and Description
            </p>

            <div className="relative mt-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <label
                    htmlFor="product-title"
                    className="block text-sm text-text-secondary"
                  >
                    Product Title
                  </label>
                  <span className="font-mono text-[11px] text-text-secondary/70">
                    {form.projectTitle.length}/100
                  </span>
                </div>
                <input
                  id="product-title"
                  type="text"
                  placeholder="Product Title"
                  maxLength={100}
                  disabled={isLocked}
                  value={form.projectTitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, projectTitle: e.target.value }))
                  }
                  className={glassInput}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="product-description"
                  className="block text-sm text-text-secondary"
                >
                  Description
                </label>
                <textarea
                  id="product-description"
                  rows={5}
                  placeholder="Description"
                  disabled={isLocked}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/25 bg-white/[0.03] px-6 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7D8CFF]/70 transition-colors resize-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Proposal Submit + Action Button | External Links */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
            {/* Left column */}
            <div className="space-y-6">
              {/* Proposal Karya */}
              <div className={`${glass} p-6 lg:p-8`}>
                <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
                  Proposal Karya
                </h2>
                <input
                  ref={deliverableInputRef}
                  type="file"
                  accept={ACCEPTED_UPLOAD_EXT}
                  className="hidden"
                  onChange={(e) => handleDeliverableSelected(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={handlePickDeliverable}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDeliverableSelected(e.dataTransfer.files?.[0]);
                  }}
                  disabled={isLocked}
                  className="relative mt-4 flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white/[0.02]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D8CFF]/20 text-[#7D8CFF]">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-white">
                    {deliverableFile
                      ? deliverableFile.name
                      : existingFileName ?? "Drag or Upload your files here"}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {deliverableFile ? (
                      <>
                        A new file is ready to replace the previous proposal.
                        <br />
                        (Max 1 File and {formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)})
                      </>
                    ) : existingFileName ? (
                      <>
                        Proposal already attached and will be sent along.
                        <br />
                        Pick a new file only if you want to replace it.
                      </>
                    ) : (
                      <>
                        Upload your project proposal.
                        <br />
                        (Max 1 File and {formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)})
                      </>
                    )}
                  </span>
                </button>
                <a
                  href={proposalTemplateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#7D8CFF] transition-colors hover:text-white"
                >
                  Link template Proposal Karya →
                </a>
              </div>

              {/* Proposal Orisinalitas */}
              <div className={`${glass} p-6 lg:p-8`}>
                <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
                  Proposal Orisinalitas
                </h2>
                <input
                  ref={originalityInputRef}
                  type="file"
                  accept={ACCEPTED_UPLOAD_EXT}
                  className="hidden"
                  onChange={(e) => handleOriginalitySelected(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={handlePickOriginality}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleOriginalitySelected(e.dataTransfer.files?.[0]);
                  }}
                  disabled={isLocked}
                  className="relative mt-4 flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white/[0.02]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D8CFF]/20 text-[#7D8CFF]">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-white">
                    {originalityFile
                      ? originalityFile.name
                      : existingOriginalityFileName ?? "Drag or Upload your files here"}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {originalityFile ? (
                      <>
                        A new file is ready to replace the previous proposal.
                        <br />
                        (Max 1 File and {formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)})
                      </>
                    ) : existingOriginalityFileName ? (
                      <>
                        Proposal already attached and will be sent along.
                        <br />
                        Pick a new file only if you want to replace it.
                      </>
                    ) : (
                      <>
                        Upload your project proposal.
                        <br />
                        (Max 1 File and {formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)})
                      </>
                    )}
                  </span>
                </button>
                <a
                  href={proposalTemplateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#7D8CFF] transition-colors hover:text-white"
                >
                  Link template Proposal Orisinalitas →
                </a>
              </div>

              {/* Action Button */}
              <div className={`${glass} p-6 lg:p-8`}>
                <h2 className="relative font-display text-lg font-bold tracking-tight text-white">
                  Action Button
                </h2>

                {isLocked ? (
                  <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="text-sm font-semibold text-white">
                      Karya sudah dikirim
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {existingSubmission?.submittedAt
                        ? `Dikirim pada ${new Date(
                            existingSubmission.submittedAt
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}. `
                        : ""}
                      Karya ini sudah terkunci dan tidak bisa diubah lagi.
                    </p>
                    <p className="mt-2 text-xs text-text-secondary/80 border-t border-white/5 pt-2">
                      Pengumuman tahap berikutnya &amp; finalis akan diumumkan melalui server Discord dan tab Pengumuman sesuai jadwal timeline.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-4 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={submissionMutation.isPending || !isEligible}
                        className="rounded-full border border-white/25 bg-white/[0.03] px-6 h-10 text-xs font-semibold text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
                      >
                        {submissionMutation.isPending ? "Saving..." : "Save Progress"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowSubmitConfirm(true)}
                        disabled={!isLeader || submissionMutation.isPending || !isEligible}
                        className="rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90 disabled:opacity-60"
                      >
                        Submit All
                      </Button>
                    </div>
                    <p className="relative mt-3 text-xs text-text-secondary">
                      {!isEligible
                        ? "Karya hanya bisa disimpan/dikirim setelah semua dokumen verifikasi tim disetujui dan pembayaran disetujui."
                        : isLeader
                        ? "Save Progress boleh dilakukan semua anggota. Submit All hanya leader, dan begitu dikirim karya ditutup dari perubahan."
                        : "Kamu boleh menyimpan draf. Pengiriman final (Submit All) dilakukan oleh leader."}
                    </p>
                  </>
                )}
              </div>

              <ConfirmModal
                open={showSubmitConfirm}
                onOpenChange={setShowSubmitConfirm}
                title="Kirim karya sekarang?"
                description={
                  !isEligible
                    ? "Tidak bisa mengirim karya karena masih ada syarat yang belum terpenuhi. Pastikan semua dokumen verifikasi sudah disetujui dan pembayaran sudah disetujui."
                    : "Submit All akan mengirim karya tim ke panitia dan menutupnya dari perubahan. Pastikan seluruh isian dan lampiran sudah benar."
                }
                confirmText={isEligible ? "Submit All" : "Kembali"}
                cancelText={isEligible ? "Batal" : undefined}
                onConfirm={isEligible ? handleSubmitAll : () => setShowSubmitConfirm(false)}
              />

              {/* Hasil penilaian (muncul setelah juri menilai) */}
              {existingSubmission?.scores && existingSubmission.scores.length > 0 && (
                <div className={`${glass} p-6 lg:p-8`}>
                  <h2 className="relative font-display text-lg font-bold tracking-tight text-white">
                    Hasil Penilaian Juri
                  </h2>
                  <div className="relative mt-4 space-y-2">
                    {(() => {
                      const byCriteria = new Map<string, { name: string; max: number; scores: number[] }>();
                      for (const s of existingSubmission.scores) {
                        if (!byCriteria.has(s.criteria.id)) {
                          byCriteria.set(s.criteria.id, { name: s.criteria.name, max: s.criteria.maxScore, scores: [] });
                        }
                        byCriteria.get(s.criteria.id)!.scores.push(s.score);
                      }
                      const rows = Array.from(byCriteria.values()).map((c) => ({
                        name: c.name,
                        max: c.max,
                        avg: c.scores.length ? c.scores.reduce((a, b) => a + b, 0) / c.scores.length : 0,
                      }));
                      const overall = rows.length ? rows.reduce((a, b) => a + b.avg, 0) / rows.length : 0;
                      return (
                        <>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-text-secondary">
                                <th className="text-left py-1">Komponen</th>
                                <th className="text-right py-1">Rata-rata</th>
                                <th className="text-right py-1">Maks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <tr key={r.name} className="border-t border-white/5">
                                  <td className="py-1 text-white">{r.name}</td>
                                  <td className="py-1 text-right text-white">{r.avg.toFixed(2)}</td>
                                  <td className="py-1 text-right text-text-secondary">{r.max}</td>
                                </tr>
                              ))}
                              <tr className="border-t border-white/10 font-semibold">
                                <td className="py-1 text-white">Rata-rata keseluruhan</td>
                                <td className="py-1 text-right text-white">{overall.toFixed(2)}</td>
                                <td className="py-1 text-right text-text-secondary"></td>
                              </tr>
                            </tbody>
                          </table>
                          {existingSubmission.judgeEvaluations && existingSubmission.judgeEvaluations.length > 0 && (
                            <div className="mt-4 space-y-3">
                              <p className="text-sm font-semibold text-white">Catatan Juri</p>
                              {existingSubmission.judgeEvaluations.map((ev, i) => (
                                <div key={ev.id ?? i} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                                  <p className="text-xs font-semibold text-[#7D8CFF]">
                                    {ev.judge?.user?.fullName ?? "Juri"}
                                  </p>
                                  {ev.feedback && (
                                    <p className="mt-1 text-xs text-text-secondary whitespace-pre-wrap">
                                      {ev.feedback}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* External Links */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
                External Links
              </h2>
              <p className="relative mt-2 text-sm text-text-secondary">
                Please make sure this link is open public so we can access it.
                Required fields are marked with{" "}
                <span className="text-[#7D8CFF]">*</span>.
              </p>

              <div className="relative mt-6 space-y-5">
                {linkFields.map((field) => {
                  const required = field.required;
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label
                        htmlFor={`external-${field.name}`}
                        className="block text-sm text-text-secondary"
                      >
                        {field.label}
                        {required ? (
                          <span className="ml-1 text-[#7D8CFF]">*</span>
                        ) : (
                          <span className="ml-1 text-xs font-normal text-text-secondary/70">
                            (optional)
                          </span>
                        )}
                      </label>
                      <input
                        id={`external-${field.name}`}
                        type="url"
                        placeholder="https://"
                        disabled={isLocked}
                        value={form[field.name]}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        className={glassInput}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : paymentStatus === "REVIEW" ? (
        /* Payment Information — sudah dikirim, menunggu review admin */
        <div className={`${glass} p-6 lg:p-8`}>
          <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
            Payment Information
          </h2>
          <p className="relative mt-2 text-sm text-text-secondary">
            Bukti pembayaran sudah dikirim dan sedang ditinjau oleh admin.
          </p>
          <span className="mt-5 inline-flex items-center rounded-full border border-amber-500/60 px-4 py-1.5 text-xs font-semibold text-amber-500">
            Menunggu Review
          </span>
        </div>
      ) : (
        /* Payment Information */
        <div className={`${glass} p-6 lg:p-8`}>
          <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
            Payment Information
          </h2>
          {paymentStatus === "REJECT" ? (
            <p className="relative mt-2 text-sm text-text-secondary">
              <span className="font-semibold text-rose-300">Bukti pembayaran ditolak.</span>{" "}
              {team?.paymentProof?.rejectionReason
                ? team.paymentProof.rejectionReason
                : "Silakan unggah ulang bukti pembayaran yang valid."}
            </p>
          ) : (
            <p className="relative mt-2 text-sm text-text-secondary">
              Before you can submit your product to this competition, please
              complete this payment first
            </p>
          )}

          <div className="relative mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Pembayaran QRIS
              </h3>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {PAYMENT_AMOUNT}
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Scan QRIS resmi dari panitia melalui Guidebook, lalu unggah bukti pembayaran di
                samping.
              </p>
              <span className="mt-5 inline-flex items-center rounded-full border border-rose-500/60 px-4 py-1.5 text-xs font-semibold text-rose-500">
                {team?.paymentProof?.status ?? "Not Submitted"}
              </span>
            </div>

            {/* Payment Evidence */}
            <div className="flex flex-col">
              <h3 className="font-display text-lg font-bold text-white">
                Payment Evidence
              </h3>
              <input
                ref={paymentInputRef}
                type="file"
                accept={ACCEPTED_UPLOAD_EXT}
                className="hidden"
                onChange={(e) => handleProofSelected(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={handlePickProof}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleProofSelected(e.dataTransfer.files?.[0]);
                }}
                className="mt-3 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:bg-white/[0.04]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D8CFF]/20 text-[#7D8CFF]">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <span className="text-sm text-white">
                  {proofFile ? proofFile.name : "Drag or Upload your files here"}
                </span>
                <span className="text-xs text-text-secondary">
                  (Max 1 File and {formatBytes(PAYMENT_PROOF_MAX_BYTES)})
                </span>
              </button>
            </div>
          </div>

          <div className="relative mt-8 flex justify-end">
            <Button
              type="button"
              onClick={() => {
                if (!proofFile) {
                  toast.error("Pilih bukti pembayaran terlebih dahulu.");
                  return;
                }
                setShowPaymentConfirm(true);
              }}
              disabled={paymentProofMutation.isPending}
              className="cursor-pointer rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-sm hover:bg-white/90 disabled:opacity-60"
            >
              {paymentProofMutation.isPending ? "Uploading..." : "Submit Payment"}
            </Button>
          </div>

          <ConfirmModal
            open={showPaymentConfirm}
            onOpenChange={setShowPaymentConfirm}
            title="Kirim Bukti Pembayaran?"
            description="Pastikan nominal dan bukti transfer sudah sesuai dan jelas terbaca. Setelah dikirim, bukti pembayaran akan ditinjau oleh panitia."
            confirmText={paymentProofMutation.isPending ? "Mengirim..." : "Kirim Sekarang"}
            cancelText="Batal"
            onConfirm={async () => {
              await handleSubmitPayment();
              setShowPaymentConfirm(false);
            }}
          />
        </div>
      )}

      {/* Modal Ubah Nama Tim */}
      <Dialog open={showEditTeamModal} onOpenChange={setShowEditTeamModal}>
        <DialogContent
          className="bg-[#1A1D24]/95 backdrop-blur-xl border border-white/20 text-white max-w-md rounded-2xl p-8 shadow-[0_0_60px_rgba(125,140,255,0.15)]"
          showCloseButton={false}
        >
          <div className="flex items-start justify-between">
            <DialogTitle className="text-white text-2xl font-extrabold tracking-tight">
              Ubah Nama Tim
            </DialogTitle>
            <button
              type="button"
              onClick={() => setShowEditTeamModal(false)}
              className="cursor-pointer w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DialogDescription className="text-white/60 text-sm leading-relaxed -mt-2">
            Masukkan nama baru untuk tim Anda. Nama tim harus unik dalam cabang lomba ini.
          </DialogDescription>

          <form onSubmit={handleUpdateTeamName} className="mt-4 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Nama Tim Baru
              </label>
              <input
                type="text"
                value={editTeamNameInput}
                onChange={(e) => setEditTeamNameInput(e.target.value)}
                placeholder="Masukkan nama tim..."
                maxLength={50}
                className="h-12 w-full rounded-xl border border-white/20 bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/30 focus:border-[#7D8CFF] focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditTeamModal(false)}
                className="cursor-pointer px-6 py-2.5 rounded-full border border-white/20 text-white/70 text-sm font-semibold hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updateTeamNameMutation.isPending || !editTeamNameInput.trim()}
                className="cursor-pointer px-8 py-2.5 rounded-full bg-white text-[#3B5BFF] text-sm font-bold shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {updateTeamNameMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Transfer Kepemimpinan */}
      <ConfirmModal
        open={showTransferConfirm}
        onOpenChange={setShowTransferConfirm}
        title="Transfer Kepemimpinan Tim"
        description={`Apakah Anda yakin ingin menyerahkan posisi Ketua Tim kepada ${targetMemberForTransfer?.name}? Anda akan menjadi anggota biasa dan kehilangan hak manajerial tim.`}
        confirmText={transferLeadershipMutation.isPending ? "Mengalihkan..." : "Ya, Jadikan Ketua"}
        cancelText="Batal"
        onConfirm={handleTransferLeadership}
      />

      {/* Modal Konfirmasi Keluarkan Anggota */}
      <ConfirmModal
        open={showKickConfirm}
        onOpenChange={setShowKickConfirm}
        title="Keluarkan Anggota Tim"
        description={`Apakah Anda yakin ingin mengeluarkan ${targetMemberForKick?.name} dari tim? Anggota yang dikeluarkan dapat bergabung kembali menggunakan kode tim jika kuota tim masih mencukupi.`}
        confirmText={kickMemberMutation.isPending ? "Mengeluarkan..." : "Ya, Keluarkan"}
        cancelText="Batal"
        onConfirm={handleKickMember}
      />
    </div>
  );
}