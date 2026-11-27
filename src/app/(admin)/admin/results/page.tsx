"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Competition, TieBreakerInfo } from "@/types/api";
import { TablePagination, paginateItems } from "@/components/shared/table-pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalculatedRankItem {
  rank: number;
  winnerRank?: number | null;
  teamId: string;
  teamName: string;
  projectTitle: string;
  category: string;
  finalScore: number;
  isFinalist: boolean;
  submittedAt?: string | null;
  hasSubmission?: boolean;
  isFullyScored?: boolean;
  scoredJudgeCount?: number;
  expectedJudgeCount?: number;
  tieBreaker?: TieBreakerInfo | null;
}

function formatSubmitTimeWib(iso: string | null | undefined) {
  if (!iso) return "-";
  return (
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso)) + " WIB"
  );
}

type CachedCalculation = {
  rankings: CalculatedRankItem[];
  isPublished: boolean;
};

type PersistedResultsState = {
  activeSlug: string;
  roundName: "PENYISIHAN" | "FINAL";
  entries: Record<string, CachedCalculation>;
};

const RESULTS_STORAGE_KEY = "adminResultsState";

function calcEntryKey(slug: string, round: string) {
  return `${slug}::${round}`;
}

function subscribeToResultsStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getResultsStorageSnapshot() {
  try {
    return sessionStorage.getItem(RESULTS_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parsePersistedResults(raw: string): PersistedResultsState | null {
  if (!raw) return null;

  try {
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return null;
    const state = saved as Record<string, unknown>;

    const activeSlug = typeof state.activeSlug === "string" ? state.activeSlug : "";
    const roundName = state.roundName === "FINAL" ? "FINAL" : "PENYISIHAN";
    const rawEntries = state.entries;
    const entries: Record<string, CachedCalculation> = {};

    if (rawEntries && typeof rawEntries === "object" && !Array.isArray(rawEntries)) {
      for (const [k, v] of Object.entries(rawEntries as Record<string, unknown>)) {
        if (v && typeof v === "object") {
          const item = v as Record<string, unknown>;
          entries[k] = {
            rankings: Array.isArray(item.rankings)
              ? (item.rankings as CalculatedRankItem[])
              : [],
            isPublished: item.isPublished === true,
          };
        }
      }
    } else if (state.hasCalculated === true && activeSlug) {
      // Migrasi format cache tunggal lama ke format per-kompetisi+round
      entries[calcEntryKey(activeSlug, roundName)] = {
        rankings: Array.isArray(state.rankings)
          ? (state.rankings as CalculatedRankItem[])
          : [],
        isPublished: state.isPublished === true,
      };
    }

    return { activeSlug, roundName, entries };
  } catch {
    return null;
  }
}

export default function AdminResultsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch competitions list
  const { data: competitions = [] } = useQuery<Competition[]>({
    queryKey: ["adminCompetitionsList"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/competitions");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const persistedRaw = useSyncExternalStore(
    subscribeToResultsStorage,
    getResultsStorageSnapshot,
    () => "",
  );
  const persistedState = useMemo(
    () => parsePersistedResults(persistedRaw),
    [persistedRaw],
  );

  const [selectedCompSlug, setSelectedCompSlug] = useState<string | null>(null);
  const activeSlug =
    selectedCompSlug ?? persistedState?.activeSlug ?? competitions[0]?.slug ?? "";

  const [roundNameOverride, setRoundName] = useState<
    PersistedResultsState["roundName"] | null
  >(null);
  const roundName =
    roundNameOverride ?? persistedState?.roundName ?? "PENYISIHAN";
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSwitchingRound, setIsSwitchingRound] = useState(false);
  const [pendingTargetRound, setPendingTargetRound] = useState<"PENYISIHAN" | "FINAL" | null>(null);
  const activeComp = useMemo(
    () => competitions.find((c) => c.slug === activeSlug),
    [competitions, activeSlug],
  );
  const currentActiveJudgeRound = activeComp?.activeRound ?? "PENYISIHAN";

  const handleSwitchActiveRound = async (targetRound: "PENYISIHAN" | "FINAL") => {
    if (!activeSlug || isSwitchingRound || targetRound === currentActiveJudgeRound) {
      setPendingTargetRound(null);
      return;
    }
    setIsSwitchingRound(true);
    try {
      await apiClient.put(`/api/competitions/${activeSlug}`, {
        activeRound: targetRound,
      });
      await queryClient.invalidateQueries({ queryKey: ["adminCompetitionsList"] });
      toast.success(
        `Babak aktif penilaian juri untuk ${activeComp?.name ?? activeSlug} diatur ke ${targetRound === "FINAL" ? "Final" : "Penyisihan"}.`,
      );
      setPendingTargetRound(null);
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Gagal mengubah babak aktif juri.");
    } finally {
      setIsSwitchingRound(false);
    }
  };
  const [entriesOverride, setEntriesOverride] = useState<
    Record<string, CachedCalculation> | null
  >(null);

  const effectiveEntries = useMemo(
    () => entriesOverride ?? persistedState?.entries ?? {},
    [entriesOverride, persistedState?.entries],
  );
  const currentKey = activeSlug ? calcEntryKey(activeSlug, roundName) : "";
  const currentEntry = currentKey ? effectiveEntries[currentKey] : undefined;
  const hasCalculated = Boolean(currentEntry);
  const isPublished = currentEntry?.isPublished ?? false;
  const rankings = useMemo(
    () => currentEntry?.rankings ?? [],
    [currentEntry?.rankings],
  );

  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasRowSubmission = (r: CalculatedRankItem) =>
    r.hasSubmission ??
    Boolean(
      (r.projectTitle && r.projectTitle.trim().length > 0) ||
        (r.scoredJudgeCount ?? 0) > 0 ||
        r.finalScore > 0
    );

  const submittedTeams = useMemo(
    () => rankings.filter(hasRowSubmission),
    [rankings]
  );

  const incompleteEvaluated = useMemo(
    () => submittedTeams.filter((r) => r.isFullyScored === false),
    [submittedTeams]
  );
  const canPublish =
    hasCalculated &&
    !isPublished &&
    submittedTeams.length > 0 &&
    incompleteEvaluated.length === 0;

  useEffect(() => {
    if (Object.keys(effectiveEntries).length === 0) return;
    try {
      sessionStorage.setItem(
        RESULTS_STORAGE_KEY,
        JSON.stringify({
          activeSlug,
          roundName,
          entries: effectiveEntries,
        } satisfies PersistedResultsState),
      );
    } catch {
      // ignore
    }
  }, [activeSlug, roundName, effectiveEntries]);

  const handleExportCsv = async () => {
    if (!activeSlug) {
      toast.error("Pilih Kompetisi terlebih dahulu.");
      return;
    }
    setIsExporting(true);
    try {
      const res = await apiClient.get("/api/export/scores", {
        params: { competitionSlug: activeSlug, round: roundName },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nilai-${activeSlug}-${roundName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export CSV berhasil.");
    } catch {
      toast.error("Gagal export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  // BE mengembalikan array datar sesuai CalculatedRankItem.
  const handleCalculateScores = async () => {
    if (!activeSlug) {
      toast.error("Pilih Kompetisi terlebih dahulu.");
      return;
    }

    const targetSlug = activeSlug;
    const targetRound = roundName;
    const key = calcEntryKey(targetSlug, targetRound);

    setIsCalculating(true);
    try {
      const res = await apiClient.post("/api/admin/announcements/calculate", {
        competitionSlug: targetSlug,
        round: targetRound,
      });
      const data = res.data?.data || res.data;
      const list: CalculatedRankItem[] = Array.isArray(data) ? data : [];
      setEntriesOverride((prev) => ({
        ...(prev ?? persistedState?.entries ?? {}),
        [key]: { rankings: list, isPublished: false },
      }));
      setPage(1);

      if (list.length === 0) {
        toast.info("Belum ada tim yang bisa dihitung pada kompetisi ini.");
      } else {
        toast.success("Kalkulasi skor akumulasi juri berhasil dihitung!");
      }
    } catch (err) {
      setEntriesOverride((prev) => ({
        ...(prev ?? persistedState?.entries ?? {}),
        [key]: { rankings: [], isPublished: false },
      }));
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Gagal menghitung skor akumulasi juri.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Handler: Publish Results (mengubah publishedAt di BE; diblokir bila juri belum lengkap)
  const handlePublishResults = async () => {
    if (!canPublish) return;
    const key = calcEntryKey(activeSlug, roundName);
    setIsPublishing(true);
    try {
      await apiClient.patch("/api/admin/announcements/publish", {
        competitionSlug: activeSlug,
        round: roundName,
      });
      setEntriesOverride((prev) => {
        const base = prev ?? persistedState?.entries ?? {};
        const prevEntry = base[key] ?? { rankings, isPublished: false };
        return {
          ...base,
          [key]: { ...prevEntry, isPublished: true },
        };
      });
      toast.success("Pengumuman Pemenang Resmi Berhasil Dipublikasikan!");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Gagal mempublikasikan hasil.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Results</h1>
        <p className="mt-1 text-sm text-white/50">
          Kalkulasi akumulasi nilai dewan juri dan publikasi pengumuman babak.
        </p>
      </div>

      {/* Selector Controls Bar: Pilih Kompetisi, Round, & Tombol Aksi */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Dropdown Pilih Kompetisi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/70">
              Pilih Kompetisi
            </label>
            <select
              value={activeSlug}
              onChange={(e) => {
                setSelectedCompSlug(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-sm text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
            >
              {competitions.map((comp) => (
                <option key={comp.id || comp.slug} value={comp.slug}>
                  {comp.name}
                </option>
              ))}
              {competitions.length === 0 && (
                <option value="">Memuat kompetisi...</option>
              )}
            </select>
          </div>

          {/* Dropdown Round */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white/70">
              Tahap / Babak
            </label>
            <select
              value={roundName}
              onChange={(e) => {
                setRoundName(e.target.value as PersistedResultsState["roundName"]);
                setPage(1);
              }}
              className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-sm text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
            >
              <option value="PENYISIHAN">Penyisihan (Finalis)</option>
              <option value="FINAL">Final (Pemenang)</option>
            </select>
          </div>

          {/* Tombol Hitung Skor */}
          <div>
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculateScores}
              className="w-full flex items-center justify-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm h-12 px-6 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCalculating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCalculating ? "Mengkalkulasi..." : "Hitung Akumulasi Skor Juri"}
            </button>
          </div>

          {/* Tombol Export CSV */}
          <div>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportCsv}
              className="w-full flex items-center justify-center gap-2 border border-white/20 text-white font-semibold text-sm h-12 px-6 rounded-full hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isExporting ? "Mengekspor..." : "Export CSV"}
            </button>
          </div>
        </div>

        {activeComp && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <span className="text-white/70">Babak Aktif Penilaian Juri:</span>
              <span className="inline-flex items-center rounded-full border border-[#7D8CFF]/40 bg-[#7D8CFF]/10 px-3 py-0.5 text-xs font-semibold text-[#A9B7FF]">
                {currentActiveJudgeRound === "FINAL" ? "Babak Final" : "Babak Penyisihan"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSwitchingRound || currentActiveJudgeRound === "PENYISIHAN"}
                onClick={() => setPendingTargetRound("PENYISIHAN")}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default ${
                  currentActiveJudgeRound === "PENYISIHAN"
                    ? "border-[#7D8CFF]/50 bg-[#7D8CFF]/15 text-[#A9B7FF]"
                    : "border-white/15 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                Penyisihan
              </button>
              <button
                type="button"
                disabled={isSwitchingRound || currentActiveJudgeRound === "FINAL"}
                onClick={() => setPendingTargetRound("FINAL")}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default ${
                  currentActiveJudgeRound === "FINAL"
                    ? "border-[#7D8CFF]/50 bg-[#7D8CFF]/15 text-[#A9B7FF]"
                    : "border-white/15 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                Final
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hasil Kalkulasi Tabel Ranking */}
      {hasCalculated && (
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="space-y-0.5">
              <h2 className="font-display text-2xl font-bold text-white">
                Hasil Ranking Skor Akumulasi
              </h2>
              <p className="text-xs text-white/40">
                Babak {roundName === "FINAL" ? "Final" : "Penyisihan"} - Total {rankings.length} tim terhitung
                {hasCalculated && (
                  <>
                    {" - "}
                    <span className="text-emerald-400 font-semibold">
                      {rankings.filter((r) => r.isFinalist).length} Finalis
                    </span>
                    {" / "}
                    <span className="text-white/60">
                      {rankings.filter((r) => !r.isFinalist).length} Tidak Lolos
                    </span>
                  </>
                )}
              </p>
            </div>

            {isPublished && (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-xs font-medium text-emerald-400">
                Sudah Dipublikasikan
              </span>
            )}
          </div>

          {/* Banner Transisi Babak Final Setelah Penyisihan Dipublikasi */}
          {isPublished && roundName === "PENYISIHAN" && currentActiveJudgeRound === "PENYISIHAN" && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  Hasil Penyisihan Telah Dipublikasikan
                </p>
                <p className="text-xs text-white/60 leading-relaxed max-w-xl">
                  5 tim teratas telah resmi ditetapkan sebagai finalis. Untuk membuka antrean penilaian babak final bagi dewan juri, aktifkan Babak Final.
                </p>
              </div>
              <button
                type="button"
                disabled={isSwitchingRound}
                onClick={() => setPendingTargetRound("FINAL")}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#7D8CFF]/50 bg-[#7D8CFF]/15 px-4 py-2 text-xs font-semibold text-[#A9B7FF] hover:bg-[#7D8CFF]/25 transition-colors cursor-pointer disabled:opacity-50"
              >
                Aktifkan Babak Final untuk Juri →
              </button>
            </div>
          )}

          {/* Banner Status Penilaian Juri (Clean Obsidian Theme) */}
          {incompleteEvaluated.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80">
                  Penilaian Juri Belum Lengkap
                </span>
                <span className="text-xs text-white/50">
                  {incompleteEvaluated.length} dari {submittedTeams.length} tim belum selesai dinilai
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Hasil pengumuman belum dapat dipublikasikan karena masih terdapat tim yang belum selesai dinilai atau dikunci oleh seluruh dewan juri pada babak ini. Tombol publikasi akan otomatis aktif setelah seluruh penilaian juri tersimpan dan terkunci.
              </p>
              <p className="text-xs text-white/40">
                Apabila ada juri yang berhalangan tetap, Anda dapat menyesuaikan penugasan melalui menu{" "}
                <Link href="/admin/judges" className="text-[#7D8CFF] hover:underline">
                  Manajemen Juri
                </Link>
                .
              </p>
            </div>
          )}

          {/* Table (Desktop) / Cards (Mobile) */}
          {(() => {
            const { pageItems: pagedRankings } = paginateItems(rankings, page, pageSize);
            return (
              <>
                <div className="lg:overflow-x-auto">
                  <table className="block w-full text-left text-sm lg:table">
                    <thead className="hidden lg:table-header-group">
                      <tr className="border-b border-white/10 text-white/70">
                        <th className="pb-3 font-semibold text-center w-16">Rank</th>
                        <th className="pb-3 font-semibold">Nama Tim & Proyek</th>
                        <th className="pb-3 font-semibold">Kategori</th>
                        <th className="pb-3 font-semibold text-center">Skor Akhir</th>
                        <th className="pb-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="block space-y-3 lg:table-row-group lg:space-y-0 lg:divide-y lg:divide-white/5">
                      {pagedRankings.map((item) => (
                        <tr
                          key={item.teamId}
                          className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 lg:table-row lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:space-y-0 lg:hover:bg-white/[0.03] transition-colors"
                        >
                          {/* Rank Number */}
                          <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:py-4 lg:text-center font-bold text-sm">
                            <span className="text-xs font-normal text-white/50 lg:hidden">Rank</span>
                            <span
                              className={
                                item.rank <= (roundName === "FINAL" ? 2 : 5)
                                  ? "text-[#7D8CFF]"
                                  : "text-white/40"
                              }
                            >
                              #{item.rank}
                            </span>
                          </td>

                          {/* Team & Project */}
                          <td className="block py-0.5 lg:table-cell lg:py-4 lg:pr-4">
                            <p className="font-bold text-white text-sm">{item.teamName}</p>
                            <p className="text-xs text-white/40 truncate max-w-md">
                              {item.projectTitle}
                            </p>
                          </td>

                          {/* Category */}
                          <td className="flex items-center justify-between gap-3 py-0.5 lg:table-cell lg:py-4 lg:pr-4 text-white/40">
                            <span className="text-xs text-white/50 shrink-0 lg:hidden">Kategori</span>
                            <span className="min-w-0 text-right lg:text-left break-words">{item.category}</span>
                          </td>

                          {/* Final Score */}
                          <td className="flex items-start justify-between gap-3 py-0.5 lg:table-cell lg:py-4 lg:text-center font-bold text-sm text-white">
                            <span className="text-xs font-normal text-white/50 shrink-0 lg:hidden">Skor Akhir</span>
                            <div className="text-right lg:text-center">
                              <p className="font-bold text-sm text-white">
                                {item.finalScore.toFixed(2)}{" "}
                                <span className="text-xs text-white/40 font-normal">/ 100</span>
                              </p>
                              {!hasRowSubmission(item) ? (
                                <p className="mt-1 font-normal text-[11px] text-white/40">
                                  Belum kirim karya
                                </p>
                              ) : item.isFullyScored === false ? (
                                <p className="mt-1 font-normal text-[11px] text-white/50">
                                  Belum dinilai penuh
                                  {typeof item.scoredJudgeCount === "number" &&
                                  typeof item.expectedJudgeCount === "number"
                                    ? ` (${item.scoredJudgeCount}/${item.expectedJudgeCount} juri)`
                                    : ""}
                                </p>
                              ) : null}
                              {item.tieBreaker && (
                                <p
                                  className={`mt-1 font-normal text-[11px] ${
                                    item.tieBreaker.status === "WON"
                                      ? "text-[#7D8CFF]"
                                      : "text-white/50"
                                  }`}
                                >
                                  {item.tieBreaker.status === "WON"
                                    ? item.tieBreaker.rule === "CRITERIA_SCORE" && item.tieBreaker.criteriaName
                                      ? `Seri - Unggul nilai "${item.tieBreaker.criteriaName}" (${item.tieBreaker.criteriaScore})`
                                      : `Seri - Unggul submit (${formatSubmitTimeWib(item.tieBreaker.submittedAt)})`
                                    : item.tieBreaker.rule === "CRITERIA_SCORE" && item.tieBreaker.criteriaName
                                    ? `Seri - Kalah nilai "${item.tieBreaker.criteriaName}" (${item.tieBreaker.criteriaScore})`
                                    : `Seri - Kalah submit (${formatSubmitTimeWib(item.tieBreaker.submittedAt)})`}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 lg:border-t-0 lg:table-cell lg:py-4 lg:text-right lg:whitespace-nowrap">
                            <span className="text-xs text-white/50 shrink-0 lg:hidden">Status</span>
                            {roundName === "FINAL" ? (
                              item.winnerRank === 1 ? (
                                <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                                  Juara 1 (Pemenang)
                                </span>
                              ) : item.winnerRank === 2 ? (
                                <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                                  Juara 2 (Pemenang)
                                </span>
                              ) : item.winnerRank === 3 ? (
                                <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                                  Juara 3 (Pemenang)
                                </span>
                              ) : (
                                <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-xs font-medium text-white/70">
                                  Finalis
                                </span>
                              )
                            ) : item.isFinalist ? (
                              <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-xs font-medium text-emerald-400">
                                Lolos Finalis
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 text-xs font-medium text-white/60">
                                Tidak Lolos
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rankings.length > 0 && (
                  <TablePagination
                    totalItems={rankings.length}
                    currentPage={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    className="pb-2"
                  />
                )}
              </>
            );
          })()}

          {/* Action Bar: Publikasikan Hasil */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              {isPublished
                ? `Pengumuman ${roundName === "FINAL" ? "pemenang" : "finalis"} telah resmi dipublikasikan ke peserta.`
                : incompleteEvaluated.length > 0
                ? "Publikasi dapat dilakukan setelah seluruh juri menyelesaikan dan mengunci penilaian."
                : submittedTeams.length === 0
                ? "Belum ada tim dengan karya terkirim untuk dipublikasikan."
                : `Seluruh tim telah selesai dinilai. Klik tombol di kanan untuk mempublikasikan pengumuman ${roundName === "FINAL" ? "pemenang" : "finalis"} ke peserta.`}
            </p>

            <button
              type="button"
              disabled={isPublishing || isPublished || !canPublish}
              onClick={handlePublishResults}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 h-12 rounded-full hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPublished
                ? "Sudah Dipublikasikan"
                : isPublishing
                ? "Mempublikasikan..."
                : roundName === "FINAL"
                ? "Publikasikan Hasil Final"
                : "Publikasikan Hasil Penyisihan"}
            </button>
          </div>
        </div>
      )}

      {/* State Info Card before Calculation */}
      {!hasCalculated && (
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-8 text-center space-y-2">
          <h3 className="font-display text-lg font-bold text-white">
            Belum Ada Data Kalkulasi
          </h3>
          <p className="text-sm text-white/50 max-w-md mx-auto">
            Pilih cabang kompetisi dan tahap di atas, lalu klik{" "}
            <span className="text-white font-medium">&quot;Hitung Skor&quot;</span>{" "}
            untuk melihat akumulasi peringkat dewan juri.
          </p>
        </div>
      )}

      {/* Modal Konfirmasi Ganti Babak Aktif Juri (SEVENT X Obsidian Theme) */}
      <Dialog
        open={Boolean(pendingTargetRound)}
        onOpenChange={(open) => {
          if (!open && !isSwitchingRound) setPendingTargetRound(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-3xl border border-white/20 bg-[#1A1D24]/90 p-8 text-white shadow-[0_0_60px_rgba(125,140,255,0.25)] backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-white">
              Ganti Babak Aktif Juri
            </DialogTitle>
            <button
              type="button"
              disabled={isSwitchingRound}
              onClick={() => setPendingTargetRound(null)}
              className="cursor-pointer w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-white/80">
              <span>{currentActiveJudgeRound === "FINAL" ? "Babak Final" : "Babak Penyisihan"}</span>
              <span className="text-white/40">➔</span>
              <span className="text-[#A9B7FF] font-semibold">
                {pendingTargetRound === "FINAL" ? "Babak Final" : "Babak Penyisihan"}
              </span>
            </div>

            <DialogDescription className="text-sm text-white/70 leading-relaxed">
              {pendingTargetRound === "FINAL" ? (
                <>
                  Anda akan mengalihkan antrean penilaian dewan juri untuk kompetisi{" "}
                  <strong className="text-white">{activeComp?.name ?? activeSlug}</strong> ke{" "}
                  <strong className="text-[#A9B7FF]">Babak Final</strong>. Dewan juri akan
                  otomatis menilai 5 tim finalis menggunakan rubrik kriteria babak final.
                </>
              ) : (
                <>
                  Anda akan mengembalikan antrean penilaian dewan juri untuk kompetisi{" "}
                  <strong className="text-white">{activeComp?.name ?? activeSlug}</strong> ke{" "}
                  <strong className="text-[#A9B7FF]">Babak Penyisihan</strong>. Dewan juri akan
                  kembali diarahkan ke seluruh tim terkirim dengan kriteria babak penyisihan.
                </>
              )}
            </DialogDescription>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              disabled={isSwitchingRound}
              onClick={() => setPendingTargetRound(null)}
              className="cursor-pointer rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSwitchingRound}
              onClick={() => {
                if (pendingTargetRound) handleSwitchActiveRound(pendingTargetRound);
              }}
              className="cursor-pointer rounded-full bg-white px-7 py-2.5 text-xs font-bold text-[#3B5BFF] shadow-[0_0_30px_rgba(59,91,255,0.35)] hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSwitchingRound && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSwitchingRound
                ? "Mengubah..."
                : pendingTargetRound === "FINAL"
                ? "Ya, Aktifkan Babak Final"
                : "Ya, Kembalikan ke Penyisihan"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}