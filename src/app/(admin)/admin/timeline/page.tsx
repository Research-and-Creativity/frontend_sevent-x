"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Competition, TimelineStage } from "@/types/api";
import { toast } from "sonner";

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
        const timelines = Array.isArray(list) ? list : [];
        const now = Date.now();
        return timelines.map((t: any) => ({
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
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Gagal menambahkan timeline stage";
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
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Competition Timeline Stages
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pengaturan milestone tahapan pendaftaran, batas submission karya, serta masa penjurian per kompetisi.
        </p>
      </div>

      {/* Filter / Selector Cabang Kompetisi */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase text-text-secondary">
              Pilih Cabang Kompetisi
            </span>
            <p className="text-xs text-text-secondary">
              Kelola timeline khusus untuk cabang lomba yang dipilih:
            </p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={activeSlug}
              onChange={(e) => setSelectedCompSlug(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              {competitions.length === 0 && (
                <option value="" className="bg-card text-white">Memuat kompetisi...</option>
              )}
              {competitions.map((c) => (
                <option key={c.id || c.slug} value={c.slug} className="bg-card text-white">
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Form Tambah Milestone */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Calendar className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-white">Tambah Milestone Tahapan Baru</h2>
        </div>

        <form onSubmit={handleAddStage} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Judul Milestone (Wajib)
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Pendaftaran & Registrasi Tim..."
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Fase (Phase)
              </label>
              <select
                value={newPhase}
                onChange={(e) => setNewPhase(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="REGISTRATION" className="bg-card text-white">REGISTRATION</option>
                <option value="UPLOAD_KARYA" className="bg-card text-white">UPLOAD_KARYA</option>
                <option value="PENJURIAN" className="bg-card text-white">PENJURIAN</option>
                <option value="FINAL" className="bg-card text-white">FINAL</option>
              </select>
            </div>

            <div className="sm:col-span-6 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Tanggal Mulai (Wajib)
              </label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-6 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Tanggal Selesai (Wajib)
              </label>
              <input
                type="date"
                required
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-12 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Deskripsi Milestone (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Deskripsi kegiatan atau instruksi tahapan resmi..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={addStageMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{addStageMutation.isPending ? "Menyimpan..." : "Tambah Milestone"}</span>
            </Button>
          </div>
        </form>

        {/* List Milestone Tahapan Terdaftar */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Daftar Milestone ({activeSlug || "Pilih Kompetisi"})
            </h3>
            <button
              onClick={() => refetchTimeline()}
              className="text-xs text-text-secondary hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {isTimelineLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl bg-surface/50" />
              <Skeleton className="h-20 w-full rounded-2xl bg-surface/50" />
            </div>
          ) : isTimelineError ? (
            <div className="bg-surface/50 border border-rose-500/30 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300">Gagal memuat tahapan timeline untuk kompetisi ini.</p>
            </div>
          ) : timelineStages.length === 0 ? (
            <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 text-center text-xs text-text-secondary">
              Belum ada tahapan timeline yang ditambahkan untuk kompetisi ini.
            </div>
          ) : (
            timelineStages.map((stage) => {
              const status = stage.isActive ? "ACTIVE" : stage.isCompleted ? "COMPLETED" : "UPCOMING";
              return (
                <div
                  key={stage.id}
                  className="bg-surface/50 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-base">{stage.stageName}</h4>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
                          status === "ACTIVE"
                            ? "bg-accent/20 text-accent border border-accent/30 animate-pulse"
                            : status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-surface text-text-secondary border border-border"
                        }`}
                      >
                        {status}
                      </span>
                      {stage.phase && (
                        <span className="text-[10px] font-mono text-text-secondary px-2 py-0.5 bg-card rounded">
                          {stage.phase}
                        </span>
                      )}
                    </div>
                    {stage.description && (
                      <p className="text-xs text-text-secondary">{stage.description}</p>
                    )}
                  </div>

                  <span className="font-mono text-xs font-bold text-white bg-card border border-white/10 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                    {formatDateRange(stage.startDate, stage.endDate)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
