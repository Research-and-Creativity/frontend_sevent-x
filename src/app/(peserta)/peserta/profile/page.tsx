"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useChangePassword,
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

function getErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return err instanceof Error ? err.message : fallback;
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
  const { data: documents = [] } = useUserDocuments();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const uploadDocumentMutation = useUploadUserDocument();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
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
    if (passwords.next.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
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

  const handleDocumentSelected = async (file: File | undefined) => {
    const type = activeDocType;
    setActiveDocType(null);
    if (!file || !type) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${formatBytes(5 * 1024 * 1024)}.`);
      return;
    }

    const payload = new FormData();
    payload.append("type", type);
    payload.append("file", file);
    try {
      await uploadDocumentMutation.mutateAsync(payload);
      toast.success("Dokumen terkirim dan menunggu review.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengunggah dokumen."));
    }
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
              Birth Date
            </label>
            <input
              id="profile-birth-date"
              type="date"
              value={form.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              className={glassInput}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-domicile"
              className="block text-sm text-text-secondary"
            >
              Domicile
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
              Institution/University/School
            </label>
            <input
              id="profile-institution"
              type="text"
              placeholder="Institution/University/School"
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
              Phone Number
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
              Discord ID
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

            return (
              <div key={doc.type} className="space-y-1.5">
                <label className="block text-sm text-text-secondary">
                  {doc.label}
                </label>
                <div className="flex h-12 items-center rounded-full border border-white/25 bg-white/[0.03] pl-5 pr-1.5 backdrop-blur-md transition-colors focus-within:border-[#7D8CFF]/70">
                  <span
                    className={`flex-1 truncate text-sm ${
                      uploaded ? "text-white" : "text-white/40"
                    }`}
                  >
                    {uploaded
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
                    <UploadCloud className="h-4 w-4" />
                  </button>
                </div>
                {uploaded?.status === "REJECT" && uploaded.rejectionReason && (
                  <p className="text-xs text-rose-400">
                    {uploaded.rejectionReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="relative mt-6 text-xs text-text-secondary">
          Dokumen menunggu persetujuan admin. Kamu baru bisa mengirim karya
          setelah keempat dokumen disetujui.
        </p>
      </div>
    </div>
  );
}