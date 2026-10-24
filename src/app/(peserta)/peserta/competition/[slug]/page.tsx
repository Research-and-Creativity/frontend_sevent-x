"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/confirm-modal";
import type { Submission } from "@/types/api";
import {
  useCompetition,
  useCreateOrUpdateSubmission,
  useSubmissionEligibility,
  useUploadPaymentProof,
  useUserMe,
  useUserSubmission,
  useUserTeam,
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

// Rekening tujuan. Backend tidak memodelkan data ini di database, jadi nilainya
// ditahan di frontend sebagai konfigurasi organisasi sampai ada endpoint resmi.
const PAYMENT_ACCOUNT = {
  amount: "Rp80.000,-",
  bank: "BNI",
  accountNumber: "0010293810",
  accountName: "Salumita Ardiana",
};

// Label dan flag-nya mengikuti slot unggah di halaman Profile. Keempat dokumen
// ini juga menjadi syarat kelayakan mengirim karya.
const MEMBER_VERIFICATION_DOCS = [
  { flag: "twibbonApproved", label: "Twibbon" },
  { flag: "shareStoryApproved", label: "Post Story" },
  { flag: "ktmApproved", label: "Student ID" },
  { flag: "instagramFollowApproved", label: "Follow Instagram Sevent.tup" },
] as const;

const ACCEPTED_UPLOAD_EXT = ".jpg,.jpeg,.png,.webp,.pdf,.zip,.rar";

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
    { name: "demoVideoUrl", label: "Demonstration Video", required: true },
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

  const { data: competition } = useCompetition(slug);
  const { data: team, isLoading: teamLoading } = useUserTeam();
  const { data: eligibility } = useSubmissionEligibility();
  const { data: me } = useUserMe();
  const { data: existingSubmission } = useUserSubmission();
  const paymentProofMutation = useUploadPaymentProof();
  const submissionMutation = useCreateOrUpdateSubmission();

  const paymentInputRef = useRef<HTMLInputElement>(null);
  const deliverableInputRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [form, setForm] = useState<SubmissionForm>(EMPTY_FORM);
  const [formSourceId, setFormSourceId] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

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

  const isLeader = members.some((m) => m.role === "LEADER" && m.userId === me?.id);
  const leaderName = members.find((m) => m.role === "LEADER")?.name ?? "";
  const otherMembers = members.filter((m) => m.role !== "LEADER");

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

  // Satu payload untuk dua aksi; yang membedakan hanya status yang dikirim.
  const saveWork = async (status: "DRAFT" | "SUBMITTED") => {
    // Proposal yang sudah terlampir tidak wajib diunggah ulang: backend
    // mempertahankan fileUrl lama selama tidak ada file baru yang dikirim.
    // Hanya pengiriman final yang mewajibkannya, Simpan Draft memang longgar.
    if (status === "SUBMITTED" && !deliverableFile && !existingFileUrl) {
      toast.error("Lampirkan proposal karya terlebih dahulu.");
      return;
    }

    const payload = new FormData();
    if (deliverableFile) payload.append("file", deliverableFile);
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
        <h1 className="relative font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
          Competition
          <span className="mx-3 text-white/60">•</span>
          {competition?.name ?? "..."}
        </h1>
      </div>

      {/* Team Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <div className="relative mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Team Information
          </h2>
          <span className="font-mono text-xs text-text-secondary">
            Team Code{" "}
            <span className="text-white">• {team?.teamCode ?? "..."}</span>
          </span>
        </div>

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
                  /* Hanya ketua yang boleh mengeluarkan anggota, dan backend
                     menolak mengeluarkan diri sendiri. */
                  isLeader && (
                    <button
                      type="button"
                      disabled
                      aria-label={`Remove ${member.name}`}
                      title="Keluarkan anggota belum tersedia di halaman ini"
                      className="cursor-not-allowed text-rose-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
          Dokumen Verifikasi Tim
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
            onClick={() => router.push("/peserta/profile")}
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
              <div className="relative mt-5">
                <p className="text-xs text-text-secondary mb-3">
                  Lengkapi semua syarat di atas sebelum mengirim karya.
                </p>
                <Button
                  type="button"
                  onClick={() => router.push("/peserta/profile")}
                  className="rounded-full border border-white/20 bg-white/[0.05] px-5 h-9 text-xs font-semibold text-white hover:bg-white/[0.1]"
                >
                  Lengkapi di Profile
                </Button>
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
              {/* Proposal Submit */}
              <div className={`${glass} p-6 lg:p-8`}>
                <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
                  Proposal Submit
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
                  </div>
                ) : (
                  <>
                    <div className="relative mt-4 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={submissionMutation.isPending}
                        className="rounded-full border border-white/25 bg-white/[0.03] px-6 h-10 text-xs font-semibold text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
                      >
                        {submissionMutation.isPending ? "Saving..." : "Save Progress"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowSubmitConfirm(true)}
                        disabled={!isLeader || submissionMutation.isPending}
                        className="rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90 disabled:opacity-60"
                      >
                        Submit All
                      </Button>
                    </div>
                    <p className="relative mt-3 text-xs text-text-secondary">
                      {isLeader
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
                description="Submit All akan mengirim karya tim ke panitia dan menutupnya dari perubahan. Pastikan seluruh isian dan lampiran sudah benar."
                confirmText="Submit All"
                cancelText="Batal"
                onConfirm={handleSubmitAll}
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
            {/* Bank Account */}
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Bank Account
              </h3>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {PAYMENT_ACCOUNT.amount}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-text-secondary">
                <span>
                  <span className="text-white">{PAYMENT_ACCOUNT.bank}</span>
                  <span className="mx-1.5">•</span>
                  {PAYMENT_ACCOUNT.accountNumber}
                </span>
                <span>a.n. {PAYMENT_ACCOUNT.accountName}</span>
              </div>

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
              onClick={handleSubmitPayment}
              disabled={paymentProofMutation.isPending}
              className="rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-sm hover:bg-white/90 disabled:opacity-60"
            >
              {paymentProofMutation.isPending ? "Uploading..." : "Submit Payment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}