"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Competition, TimelineStage } from "@/types/api";
import { getErrorMessageWithDefault } from "@/lib/errors";
import { toast } from "sonner";

// Bentuk timeline dari BE sebelum dinormalisasi (BE juga menyertakan `name`).
type TimelineResponseItem = {
  id: string;
  phase: string;
  stageName?: string | null;
  name?: string | null;
  startDate: string;
  endDate: string;
  description?: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "border-[#5B8DEF] text-[#7FA7F5]",
  COMPLETED: "border-[#3CB578] text-[#63CFA0]",
  UPCOMING: "border-white/20 text-white/40",
};

export default function AdminTimelinePage() {
  const queryClient = useQueryClient();

  // 1. Fetch Competitions List
  const { data: competitions = [], isLoading: isCompLoading } = useQuery<Competition[]>({
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

  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");

  // Default active competition slug
  const activeSlug = selectedCompSlug || competitions[0]?.slug || "";

  // 2. Fetch Timeline Stages for Selected Competition (GET /api/competitions/:slug/timeline)
  const {
    data: timelineStages = [],
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useQuery<TimelineStage[]>({
    queryKey: ["adminCompetitionTimeline", activeSlug],
    queryFn: async () => {
      if (!activeSlug) return [];
      try {
        const res = await apiClient.get(`/api/competitions/${activeSlug}/timeline`);
        const list = res.data?.data || res.data;
        const timelines: TimelineResponseItem[] = Array.isArray(list)
          ? list
          : [];
        const now = Date.now();
        return timelines.map((t) => ({
          id: t.id,
          stageName: t.stageName || t.name || "Milestone",
          phase: t.phase,
          startDate: t.startDate,
          endDate: t.endDate,
          description: t.description || "",
          isCompleted: new Date(t.endDate).getTime() < now,
          isActive:
            new Date(t.startDate).getTime() <= now &&
            now <= new Date(t.endDate).getTime(),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!activeSlug,
  });

  // Form State to add new timeline milestone
  const [newStageName, setNewStageName] = useState("");
  const [newPhase, setNewPhase] = useState("REGISTRATION");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 3. Mutation to add/update stage (POST /api/competitions/:slug/timeline)
  const addStageMutation = useMutation({
    mutationFn: async (payload: {
      stageName: string;
      phase: string;
      startDate: string;
      endDate: string;
      description: string;
    }) => {
      if (!activeSlug) throw new Error("Pilih kompetisi terlebih dahulu");
      const res = await apiClient.post(`/api/competitions/${activeSlug}/timeline`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Milestone tahapan lomba berhasil ditambahkan!");
      setNewStageName("");
      setNewStartDate("");
      setNewEndDate("");
      setNewDescription("");
      queryClient.invalidateQueries({ queryKey: ["adminCompetitionTimeline", activeSlug] });
      queryClient.invalidateQueries({ queryKey: ["competitionTimeline", activeSlug] });
      queryClient.invalidateQueries({ queryKey: ["publicCompetitionTimeline", activeSlug] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessageWithDefault(
        err,
        "Gagal menambahkan timeline stage"
      );
      toast.error(msg);
    },
  });

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) {
      toast.error("Nama tahapan wajib diisi.");
      return;
    }
    if (!activeSlug) {
      toast.error("Pilih cabang kompetisi terlebih dahulu.");
      return;
    }
    addStageMutation.mutate({
      stageName: newStageName.trim(),
      phase: newPhase,
      startDate: newStartDate || new Date().toISOString(),
      endDate: newEndDate || new Date().toISOString(),
      description: newDescription.trim(),
    });
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return "Segera Diumumkan";
    try {
      const s = start ? new Date(start).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";
      const e = end ? new Date(end).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";
      if (s && e) return `${s} - ${e}`;
      return s || e;
    } catch {
      return `${start} - ${end}`;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Timeline</h1>
      </div>

      {/* Filter / Selector Cabang Kompetisi */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/70">Pilih Cabang Kompetisi</p>
          <p className="text-xs text-white/40 mt-1">
            Kelola timeline khusus untuk cabang lomba yang dipilih.
          </p>
        </div>

        <select
          value={activeSlug}
          onChange={(e) => setSelectedCompSlug(e.target.value)}
          className="w-full sm:w-72 h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
        >
          {competitions.length === 0 && (
            <option value="">Memuat kompetisi...</option>
          )}
          {competitions.map((c) => (
            <option key={c.id || c.slug} value={c.slug}>
              {c.name} ({c.slug})
            </option>
          ))}
        </select>
      </div>

      {/* Form Tambah Milestone */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Calendar className="w-5 h-5 text-white/70" />
          <h2 className="font-display text-2xl font-bold">Tambah Milestone Tahapan Baru</h2>
        </div>

        <form onSubmit={handleAddStage} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <label className="text-sm text-white/70">Judul Milestone (Wajib)</label>
            <input
              type="text"
              required
              placeholder="Misal: Pendaftaran & Registrasi Tim..."
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Fase (Phase)</label>
            <select
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
            >
              <option value="REGISTRATION">REGISTRATION</option>
              <option value="UPLOAD_KARYA">UPLOAD_KARYA</option>
              <option value="PENJURIAN">PENJURIAN</option>
              <option value="FINAL">FINAL</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/70">Tanggal Mulai (Wajib)</label>
            <input
              type="date"
              required
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Tanggal Selesai (Wajib)</label>
            <input
              type="date"
              required
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 [color-scheme:dark]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-white/70">Deskripsi Milestone (Opsional)</label>
            <textarea
              rows={2}
              placeholder="Deskripsi kegiatan atau instruksi tahapan resmi..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 resize-none"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={addStageMutation.isPending}
              className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{addStageMutation.isPending ? "Menyimpan..." : "Tambah Milestone"}</span>
            </button>
          </div>
        </form>

        {/* List Milestone Tahapan Terdaftar */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base">
              Daftar Milestone ({activeSlug || "Pilih Kompetisi"})
            </h3>
            <button
              onClick={() => refetchTimeline()}
              className="text-xs text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {isTimelineLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 w-full rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : isTimelineError ? (
            <div className="py-12 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-sm text-rose-300">
                Gagal memuat tahapan timeline untuk kompetisi ini.
              </p>
            </div>
          ) : timelineStages.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/40">
              Belum ada tahapan timeline yang ditambahkan untuk kompetisi ini.
            </p>
          ) : (
            timelineStages.map((stage) => {
              const status = stage.isActive ? "ACTIVE" : stage.isCompleted ? "COMPLETED" : "UPCOMING";
              return (
                <div
                  key={stage.id}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-bold text-white text-base">{stage.stageName}</h4>
                      <span
                        className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${STATUS_STYLE[status]}`}
                      >
                        {status}
                      </span>
                      {stage.phase && (
                        <span className="text-[11px] text-white/40 px-3 py-1 rounded-full bg-white/5">
                          {stage.phase}
                        </span>
                      )}
                    </div>
                    {stage.description && (
                      <p className="text-xs text-white/40">{stage.description}</p>
                    )}
                  </div>

                  <span className="text-sm text-white/70 font-semibold bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                    {formatDateRange(stage.startDate, stage.endDate)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}