import type { Team } from "@/types/api";

type StatusInfo = { label: string; cls: string };

// Kolom "Status Document" memakai agregasi dokumen anggota dari BE
// (documentStatus). Fallback ke status tim untuk data lama.
export function docStatusInfo(t: Team): StatusInfo {
  const s = (t.documentStatus || t.status || "").toUpperCase();
  if (s.includes("APPROV") || s.includes("VERIF")) {
    return { label: "Approved", cls: "border-white/10 bg-white/[0.03] text-emerald-400" };
  }
  if (s.includes("REJECT") || s.includes("REVISE")) {
    return { label: "Revise", cls: "border-white/10 bg-white/[0.03] text-rose-300" };
  }
  return { label: "Need Review", cls: "border-white/10 bg-white/[0.03] text-white/70" };
}

export function payStatusInfo(t: Team): StatusInfo {
  const s = (t.paymentProof?.status || "").toUpperCase();
  if (s.includes("APPROV") || s.includes("PAID") || s.includes("VERIF")) {
    return { label: "Paid", cls: "border-white/10 bg-white/[0.03] text-emerald-400" };
  }
  if (s.includes("REJECT") || s.includes("UNPAID") || s === "NOT PAID") {
    return { label: "Not Paid", cls: "border-white/10 bg-white/[0.03] text-rose-300" };
  }
  return { label: "Need Review", cls: "border-white/10 bg-white/[0.03] text-white/70" };
}

/**
 * Tim dianggap "sudah verified" bila SEMUA syarat berikut terpenuhi:
 *   1. Dokumen seluruh anggota berstatus Approved (keempat dokumen wajib), DAN
 *   2. Bukti pembayaran tim berstatus Paid.
 *   3. Untuk cabang Software Development, tim harus beranggotakan minimal 3 orang.
 *
 * Dua syarat ini persis yang ditampilkan di kolom Status Document & Status
 * Payment, sehingga filter tidak pernah bertentangan dengan badge di layar.
 *
 * Dipakai untuk memisahkan dua halaman admin:
 *   /admin/teams      -> tim yang BELUM verified (antrean kerja: tombol Revise &
 *                        Verification tersedia)
 *   /admin/documents  -> tim yang SUDAH verified (arsip, read-only)
 */
export function isVerifiedTeam(t: Team): boolean {
  // Tim software-development harus memiliki minimal 3 anggota untuk bisa diverifikasi
  const isSoftdev =
    t.competition?.slug === "software-development" ||
    t.competition?.name?.toLowerCase().includes("software");

  if (isSoftdev && (t.members?.length ?? 0) < 3) {
    return false;
  }

  return (
    docStatusInfo(t).label === "Approved" && payStatusInfo(t).label === "Paid"
  );
}

export function formatRegistrationDate(iso?: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function teamLeaderName(t: Team): string {
  return t.members?.find((m) => m.role === "LEADER")?.user?.fullName || "-";
}
