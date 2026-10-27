"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isPasswordStrong } from "@/lib/password";
import { getErrorMessage } from "@/lib/errors";
import {
  PROFILE_REQUIRED_FIELDS,
  useChangePassword,
  useProfileComplete,
  useUpdateProfile,
  useUploadUserDocument,
  useUserDocuments,
  useUserMe,
} from "@/hooks/use-peserta";
import type { UserDocumentItem } from "@/hooks/use-peserta";

// Style glass yang sama dengan halaman peserta lainnya
const glass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] " +
  "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl " +
  "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent";

// Input pill gelap sesuai desain
const glassInput =
  "h-12 w-full rounded-full px-5 bg-white/[0.03] border border-white/25 backdrop-blur-md " +
  "text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7D8CFF]/70 transition-colors";

// Input read-only (email akun)
const glassInputReadOnly =
  "h-12 w-full rounded-full px-5 bg-white/[0.02] border border-white/15 backdrop-blur-md " +
  "text-sm text-white/70 focus:outline-none cursor-not-allowed";

// Tombol Save pill putih sesuai desain
const pillButton =
  "cursor-pointer bg-white text-[#1B235E] hover:bg-white/80 rounded-full px-6 h-9 text-xs font-semibold shadow-sm";

// Keempat slot ini mengikuti syarat dokumen di backend.
const VERIFICATION_DOCS = [
  { type: "TWIBBON", label: "Twibbon" },
  { type: "SHARE_STORY", label: "Post Story" },
  { type: "KTM", label: "Student ID" },
  { type: "INSTAGRAM_FOLLOW", label: "Follow Instagram Sevent.tup" },
] as const;

const DOCUMENT_STATUS_LABEL: Record<string, string> = {
  REVIEW: "Under review",
  APPROVE: "Approved",
  REJECT: "Rejected",
};

function formatBytes(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

interface ProfileForm {
  fullName: string;
  birthDate: string;
  domicile: string;
  institution: string;
  phone: string;
  discordId: string;
}

export default function PesertaProfilePage() {
  const { data: user, isLoading: userLoading } = useUserMe();
  const {
    isComplete: isProfileComplete,
    missingFields,
    isLoading: profileLoading,
  } = useProfileComplete();
  const { data: documents = [] } = useUserDocuments();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadDocumentMutation = useUploadUserDocument();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
  // File yang sudah dipilih tapi belum dikirim. Upload baru terjadi saat tombol
  // "Kirim" ditekan, supaya peserta bisa cek dulu sebelum mengirim.
  // File yang sudah dipilih tapi belum dikirim, per tipe dokumen.
  const [pendingDocs, setPendingDocs] = useState<Record<string, File>>({});
  const [passwords, setPasswords] = useState({ current: "", next: "" });

  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    birthDate: "",
    domicile: "",
    institution: "",
    phone: "",
    discordId: "",
  });
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  // Isi form sekali setelah data profil datang. Penyesuaian dilakukan saat
  // render, bukan effect, supaya tidak ada flash form kosong.
  if (user && loadedUserId !== user.id) {
    setLoadedUserId(user.id);
    setForm({
      fullName: user.fullName ?? "",
      birthDate: user.birthDate ? user.birthDate.slice(0, 10) : "",
      domicile: user.domicile ?? "",
      institution: user.institution ?? "",
      // Nomor telepon disimpan tanpa awalan negara; UI menampilkannya dengan +62.
      phone: user.phone?.replace(/^\+?62/, "") ?? "",
      discordId: user.discordId ?? "",
    });
  }

  const documentsByType = new Map<string, UserDocumentItem>(
    documents.map((doc) => [doc.type, doc]),
  );

  const updateField = (field: keyof ProfileForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveProfile = async () => {
    if (!form.fullName.trim()) {
      toast.error("Nama lengkap tidak boleh kosong.");
      return;
    }
    if (!form.institution.trim()) {
      toast.error("Nama institusi tidak boleh kosong.");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        fullName: form.fullName.trim(),
        institution: form.institution.trim(),
        domicile: form.domicile.trim() || null,
        discordId: form.discordId.trim() || null,
        phone: form.phone.trim() ? `+62${form.phone.trim()}` : null,
        // Kirim tanggal mentah. Mengubahnya jadi Date lebih dulu akan menggeser
        // tanggal satu hari pada zona waktu diahead UTC.
        birthDate: form.birthDate || null,
      });
      toast.success("Profil berhasil disimpan.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan profil."));
    }
  };

  const handleSavePassword = async () => {
    if (!passwords.current || !passwords.next) {
      toast.error("Isi password lama dan password baru.");
      return;
    }
    if (!isPasswordStrong(passwords.next)) {
      toast.error(
        "Password minimal 8 karakter dan harus memuat huruf besar, huruf kecil, serta angka.",
      );
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: "", next: "" });
      toast.success("Password berhasil diubah.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengubah password."));
    }
  };

  const handlePickDocument = (type: string) => {
    setActiveDocType(type);
    fileInputRef.current?.click();
  };

  const handleDocumentSelected = (file: File | undefined) => {
    const type = activeDocType;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (!file || !type) {
      setActiveDocType(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${formatBytes(5 * 1024 * 1024)}.`);
      setActiveDocType(null);
      return;
    }

    // Simpan file yang dipilih; upload baru terjadi saat "Kirim Semua" ditekan.
    setPendingDocs((prev) => ({ ...prev, [type]: file }));
    setActiveDocType(null);
  };

  const handleSendAllDocuments = async () => {
    const pendingTypes = Object.keys(pendingDocs);
    if (pendingTypes.length === 0) {
      toast.error("Pilih file dokumen terlebih dahulu.");
      return;
    }

    // Validasi: semua dokumen wajib sudah ada (sudah terunggah atau baru dipilih).
    const missing = VERIFICATION_DOCS.filter(
      (doc) =>
        !documentsByType.get(doc.type) && !pendingDocs[doc.type],
    );
    if (missing.length > 0) {
      toast.error(
        `Lengkapi semua dokumen terlebih dahulu: ${missing
          .map((d) => d.label)
          .join(", ")}.`,
      );
      return;
    }

    // Upload semua file yang pending secara berurutan.
    for (const type of pendingTypes) {
      const file = pendingDocs[type];
      const payload = new FormData();
      payload.append("type", type);
      payload.append("file", file);
      try {
        await uploadDocumentMutation.mutateAsync(payload);
      } catch (err) {
        toast.error(getErrorMessage(err, `Gagal mengunggah ${type}.`));
        return;
      }
    }
    toast.success("Semua dokumen terkirim dan menunggu review.");
    setPendingDocs({});
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
          Profile
        </h1>
      </div>

      {/* Kelengkapan profil: daftar & sumbernya sama dengan gerbang di halaman
          Competition dan Dashboard (satu hook), jadi tidak ada dua versi syarat. */}
      {!profileLoading && (
        <div className={`${glass} p-6 lg:p-8`}>
          <div className="relative flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              {isProfileComplete ? "Profil sudah lengkap" : "Profil belum lengkap"}
            </h2>
            <span
              className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${isProfileComplete
                ? "border-success/40 bg-success/10 text-success"
                : "border-white/15 bg-white/[0.05] text-white/70"
                }`}
            >
              {PROFILE_REQUIRED_FIELDS.length - missingFields.length}/
              {PROFILE_REQUIRED_FIELDS.length} terisi
            </span>
          </div>
          <p className="relative mt-1.5 text-sm text-text-secondary">
            {isProfileComplete
              ? "Kelima field wajib sudah terisi, jadi kamu sudah bisa mendaftar kompetisi."
              : "Lengkapi field bertanda * di bawah, lalu klik Save. Kelimanya dipakai sebagai syarat untuk mendaftar kompetisi."}
          </p>
          <ul className="relative mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {PROFILE_REQUIRED_FIELDS.map((field) => {
              const filled = !missingFields.includes(field.label);
              return (
                <li key={field.key} className="flex items-center gap-2.5 text-sm">
                  {filled ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-white/25" aria-hidden />
                  )}
                  <span className={filled ? "text-white" : "text-text-secondary"}>
                    {field.label}
                  </span>
                  <span className="sr-only">
                    {filled ? "sudah terisi" : "belum terisi"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* General Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-6">
          General Information
        </h2>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name"
              className="block text-sm text-text-secondary"
            >
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              placeholder="Name"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              disabled={userLoading}
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-birth-date"
              className="block text-sm text-text-secondary"
            >
              Birth Date <span className="text-[#7D8CFF]">*</span>
            </label>
            <input
              id="profile-birth-date"
              type="date"
              value={form.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              className={`${glassInput} text-white accent-white [color-scheme:dark]`}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-domicile"
              className="block text-sm text-text-secondary"
            >
              Domicile <span className="text-[#7D8CFF]">*</span>
            </label>
            <input
              id="profile-domicile"
              type="text"
              placeholder="Domicile"
              value={form.domicile}
              onChange={(e) => updateField("domicile", e.target.value)}
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-institution"
              className="block text-sm text-text-secondary"
            >
              Institution/University/School{" "}
              <span className="text-[#7D8CFF]">*</span>
            </label>
            <input
              id="profile-institution"
              type="text"
              placeholder="Institution/University/School"
              required
              value={form.institution}
              onChange={(e) => updateField("institution", e.target.value)}
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-phone"
              className="block text-sm text-text-secondary"
            >
              Phone Number <span className="text-[#7D8CFF]">*</span>
            </label>
            <div className="flex h-12 items-center rounded-full border border-white/25 bg-white/[0.03] pl-5 pr-5 backdrop-blur-md transition-colors focus-within:border-[#7D8CFF]/70">
              <span className="text-sm text-white/60">+62</span>
              <input
                id="profile-phone"
                type="tel"
                placeholder="812-3456-7890"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="ml-2 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-discord"
              className="block text-sm text-text-secondary"
            >
              Discord ID <span className="text-[#7D8CFF]">*</span>
            </label>
            <input
              id="profile-discord"
              type="text"
              placeholder="Discord ID"
              value={form.discordId}
              onChange={(e) => updateField("discordId", e.target.value)}
              className={glassInput}
            />
          </div>
        </div>

        <div className="relative mt-8 flex justify-end">
          <Button
            type="button"
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            className={`${pillButton} disabled:opacity-60`}
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Account Information */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-6">
          Account Information
        </h2>

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="profile-email"
              className="block text-sm text-text-secondary"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email ?? ""}
              readOnly
              className={glassInputReadOnly}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-password"
              className="block text-sm text-text-secondary"
            >
              New Password
            </label>
            <input
              id="profile-password"
              type="password"
              placeholder="••••••••"
              value={passwords.next}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, next: e.target.value }))
              }
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-current-password"
              className="block text-sm text-text-secondary"
            >
              Current Password
            </label>
            <input
              id="profile-current-password"
              type="password"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, current: e.target.value }))
              }
              className={glassInput}
            />
          </div>
        </div>

        <div className="relative mt-8 flex justify-end">
          <Button
            type="button"
            onClick={handleSavePassword}
            disabled={changePasswordMutation.isPending}
            className={`${pillButton} disabled:opacity-60`}
          >
            {changePasswordMutation.isPending ? "Updating..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Verification Document */}
      <div className={`${glass} p-6 lg:p-8`}>
        <h2 className="relative font-display text-xl font-bold tracking-tight text-white mb-6">
          Verification Document
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.zip,.rar"
          className="hidden"
          onChange={(e) => handleDocumentSelected(e.target.files?.[0])}
        />

        <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2">
          {VERIFICATION_DOCS.map((doc) => {
            const uploaded = documentsByType.get(doc.type);
            const status = uploaded?.status;
            // Indikator hanya menempel di baris yang sedang diunggah, bukan
            // mematikan tampilan seluruh daftar dokumen sekaligus.
            const isUploading =
              uploadDocumentMutation.isPending && activeDocType === doc.type;
            const isPendingForThis = Boolean(pendingDocs[doc.type]);

            return (
              <div key={doc.type} className="space-y-1.5">
                <label className="block text-sm text-text-secondary">
                  {doc.label}
                </label>
                <div className="flex h-12 items-center rounded-full border border-white/25 bg-white/[0.03] pl-5 pr-1.5 backdrop-blur-md transition-colors focus-within:border-[#7D8CFF]/70">
                  <span
                    className={`flex-1 truncate text-sm ${isUploading || uploaded || isPendingForThis ? "text-white" : "text-white/40"
                      }`}
                  >
                    {isUploading
                      ? "Mengunggah..."
                      : isPendingForThis
                        ? pendingDocs[doc.type]?.name
                        : uploaded
                          ? DOCUMENT_STATUS_LABEL[status ?? ""] ?? status
                          : "Upload File"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePickDocument(doc.type)}
                    aria-label={`Upload ${doc.label}`}
                    disabled={uploadDocumentMutation.isPending}
                    className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#7D8CFF] transition-colors hover:bg-white/80 disabled:opacity-60"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {uploaded?.status === "REJECT" && uploaded.rejectionReason && (
                  <p className="text-xs text-rose-400">
                    {uploaded.rejectionReason}
                  </p>
                )}
                {doc.type === "TWIBBON" && !uploaded && (
                  <Link
                    href="/twibbon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#7D8CFF] transition-colors hover:text-white"
                  >
                    Belum punya twibbon? Bikin di sini →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSendAllDocuments}
            disabled={
              uploadDocumentMutation.isPending ||
              Object.keys(pendingDocs).length === 0
            }
            className="cursor-pointer rounded-full bg-white px-6 h-10 text-xs font-semibold text-[#1B235E] shadow-[0_0_30px_rgba(46,92,255,0.45)] hover:bg-white/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploadDocumentMutation.isPending
              ? "Mengirim..."
              : "Kirim Semua Dokumen"}
          </button>
          {Object.keys(pendingDocs).length > 0 && (
            <p className="text-xs text-text-secondary">
              {Object.keys(pendingDocs).length} file siap dikirim.
            </p>
          )}
        </div>

        <p className="relative mt-6 text-xs text-text-secondary">
          Dokumen menunggu persetujuan admin. Kamu baru bisa mengirim karya
          setelah keempat dokumen disetujui.
        </p>
      </div>
    </div>
  );
}