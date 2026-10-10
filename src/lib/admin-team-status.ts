import type { Team } from "@/types/api";

type StatusInfo = { label: string; cls: string };

// Kolom "Status Document" memakai agregasi dokumen anggota dari BE
// (documentStatus). Fallback ke status tim untuk data lama.
export function docStatusInfo(t: Team): StatusInfo {
  const s = (t.documentStatus || t.status || "").toUpperCase();
  if (s.includes("APPROV") || s.includes("VERIF")) {
    return { label: "Approved", cls: "border-[#3CB578] text-[#63CFA0]" };
  }
  if (s.includes("REJECT") || s.includes("REVISE")) {
    return { label: "Revise", cls: "border-[#E5B33C] text-[#F0C969]" };
  }
  return { label: "Need Review", cls: "border-[#5B8DEF] text-[#7FA7F5]" };
}

export function payStatusInfo(t: Team): StatusInfo {
  const s = (t.paymentProof?.status || "").toUpperCase();
  if (s.includes("APPROV") || s.includes("PAID") || s.includes("VERIF")) {
    return { label: "Paid", cls: "border-[#3CB578] text-[#63CFA0]" };
  }
  if (s.includes("REJECT") || s.includes("UNPAID") || s === "NOT PAID") {
    return { label: "Not Paid", cls: "border-[#E55353] text-[#F08080]" };
  }
  return { label: "Need Review", cls: "border-[#5B8DEF] text-[#7FA7F5]" };
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
