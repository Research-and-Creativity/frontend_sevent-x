"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  amount: "Rp60.000,-",
  bank: "BNI",
  accountNumber: "0010293810",
  accountName: "Salumita Ardiana",
};

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
}

const EMPTY_FORM: SubmissionForm = {
  projectTitle: "",
  description: "",
  githubUrl: "",
  demoVideoUrl: "",
  deploymentUrl: "",
};

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
    });
  }

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

  const handleSubmitWork = async () => {
    if (!deliverableFile) {
      toast.error("Lampirkan proposal karya terlebih dahulu.");
      return;
    }
    const payload = new FormData();
    payload.append("file", deliverableFile);
    payload.append("projectTitle", form.projectTitle.trim());
    payload.append("description", form.description.trim());
    payload.append("githubUrl", form.githubUrl.trim());
    payload.append("demoVideoUrl", form.demoVideoUrl.trim());
    payload.append("deploymentUrl", form.deploymentUrl.trim());

    try {
      await submissionMutation.mutateAsync(payload);
      toast.success("Karya berhasil dikirim.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengirim karya."));
    }
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
        <h1 className="relative font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
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
          {/* Leader full width */}
          <div className="flex h-12 items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-5">
            <span className="text-sm text-white">{leaderName || "..."}</span>
            <span className="rounded-full border border-white/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Leader
            </span>
          </div>

          {/* Anggota lain, 2 kolom */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherMembers.map((member) => (
              <div
                key={member.id}
                className="flex h-12 items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-5"
              >
                <span className="text-sm text-white">{member.name}</span>
                {/* Hanya ketua yang boleh mengeluarkan anggota, dan backend
                    menolak mengeluarkan diri sendiri. */}
                {isLeader && (
                  <button
                    type="button"
                    disabled
                    aria-label={`Remove ${member.name}`}
                    title="Keluarkan anggota belum tersedia di halaman ini"
                    className="cursor-not-allowed text-rose-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {paymentApproved ? (
        <>
          {/* Product Information */}
          <div className={`${glass} p-6 lg:p-8`}>
            <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
              Product Information
            </h2>
            <p className="relative mt-2 text-sm text-text-secondary">
              You can filled this form with the Product Title and Description
            </p>

            <div className="relative mt-6 space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="product-title"
                  className="block text-sm text-text-secondary"
                >
                  Product Title
                </label>
                <input
                  id="product-title"
                  type="text"
                  placeholder="Product Title"
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
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/25 bg-white/[0.03] px-6 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7D8CFF]/70 transition-colors resize-none"
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
                  className="relative mt-4 flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:bg-white/[0.04]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7D8CFF]/20 text-[#7D8CFF]">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <span className="text-sm text-white">
                    {deliverableFile ? deliverableFile.name : "Drag or Upload your files here"}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Upload your project proposal.
                    <br />
                    (Max 1 File and {formatBytes(SUBMISSION_DELIVERABLE_MAX_BYTES)})
                  </span>
                </button>
              </div>

              {/* Action Button */}
              <div className={`${glass} p-6 lg:p-8`}>
                <h2 className="relative font-display text-lg font-bold tracking-tight text-white">
                  Action Button
                </h2>
                <div className="relative mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleSubmitWork}
                    disabled={submissionMutation.isPending}
                    className="rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90 disabled:opacity-60"
                  >
                    {submissionMutation.isPending ? "Submitting..." : "Submit All"}
                  </Button>
                </div>
              </div>
            </div>

            {/* External Links */}
            <div className={`${glass} p-6 lg:p-8`}>
              <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
                External Links
              </h2>
              <p className="relative mt-2 text-sm text-text-secondary">
                Please make sure this link is open public so we can access it
              </p>

              <div className="relative mt-6 space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="external-github"
                    className="block text-sm text-text-secondary"
                  >
                    Github Repository
                  </label>
                  <input
                    id="external-github"
                    type="url"
                    placeholder="https://"
                    value={form.githubUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, githubUrl: e.target.value }))
                    }
                    className={glassInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="external-live"
                    className="block text-sm text-text-secondary"
                  >
                    Live Deployment
                  </label>
                  <input
                    id="external-live"
                    type="url"
                    placeholder="https://"
                    value={form.deploymentUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, deploymentUrl: e.target.value }))
                    }
                    className={glassInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="external-video"
                    className="block text-sm text-text-secondary"
                  >
                    Demonstration Video
                  </label>
                  <input
                    id="external-video"
                    type="url"
                    placeholder="https://"
                    value={form.demoVideoUrl}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, demoVideoUrl: e.target.value }))
                    }
                    className={glassInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Payment Information */
        <div className={`${glass} p-6 lg:p-8`}>
          <h2 className="relative font-display text-xl font-bold tracking-tight text-white">
            Payment Information
          </h2>
          <p className="relative mt-2 text-sm text-text-secondary">
            Before you can submit your product to this competition, please
            complete this payment first
          </p>

          <div className="relative mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Bank Account */}
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Bank Account
              </h3>
              <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white">
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