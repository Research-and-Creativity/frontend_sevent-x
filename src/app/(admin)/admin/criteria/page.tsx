"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessageWithDefault } from "@/lib/errors";
import type { Competition, ScoreCriteria } from "@/types/api";

const glass = "rounded-2xl border border-white/10 bg-white/[0.03] p-6";

interface CriteriaForm {
  competitionId: string;
  round: "PENYISIHAN" | "FINAL";
  name: string;
  description: string;
  group: string;
  weight: number;
  maxScore: number;
  order: number;
}

const emptyForm = (competitionId: string, round: "PENYISIHAN" | "FINAL"): CriteriaForm => ({
  competitionId,
  round,
  name: "",
  description: "",
  group: "",
  weight: 10,
  maxScore: 100,
  order: 0,
});

export default function AdminCriteriaPage() {
  const queryClient = useQueryClient();

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

  const [selectedCompId, setSelectedCompId] = useState<string>("");
  const [round, setRound] = useState<"PENYISIHAN" | "FINAL">("PENYISIHAN");

  // sync default selection once competitions load
  if (!selectedCompId && competitions.length > 0) {
    setSelectedCompId(competitions[0].id);
  }

  const { data: criteria = [] } = useQuery<ScoreCriteria[]>({
    queryKey: ["adminCriteria", selectedCompId, round],
    queryFn: async () => {
      if (!selectedCompId) return [];
      try {
        const res = await apiClient.get("/api/score-criteria", {
          params: { competitionId: selectedCompId, round },
        });
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedCompId,
  });

  const { data: summary } = useQuery({
    queryKey: ["adminCriteriaSummary", selectedCompId, round],
    queryFn: async () => {
      if (!selectedCompId) return null;
      try {
        const res = await apiClient.get("/api/score-criteria/summary", {
          params: { competitionId: selectedCompId, round },
        });
        return res.data?.data || res.data;
      } catch {
        return null;
      }
    },
    enabled: !!selectedCompId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScoreCriteria | null>(null);
  const [form, setForm] = useState<CriteriaForm>(emptyForm("", "PENYISIHAN"));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(selectedCompId, round));
    setIsModalOpen(true);
  };

  const openEdit = (c: ScoreCriteria) => {
    setEditing(c);
    setForm({
      competitionId: c.competitionId,
      round: c.round,
      name: c.name,
      description: c.description ?? "",
      group: c.group ?? "",
      weight: c.weight,
      maxScore: c.maxScore,
      order: c.order,
    });
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: CriteriaForm) => {
      const res = await apiClient.post("/api/admin/score-criteria", {
        ...payload,
        description: payload.description || null,
        group: payload.group || null,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Kriteria berhasil ditambahkan");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminCriteria", selectedCompId, round] });
      queryClient.invalidateQueries({ queryKey: ["adminCriteriaSummary", selectedCompId, round] });
    },
    onError: (err) => toast.error(getErrorMessageWithDefault(err, "Gagal menambahkan kriteria")),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CriteriaForm }) => {
      const res = await apiClient.put(`/api/admin/score-criteria/${id}`, {
        ...payload,
        description: payload.description || null,
        group: payload.group || null,
      });
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Kriteria berhasil diperbarui");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminCriteria", selectedCompId, round] });
      queryClient.invalidateQueries({ queryKey: ["adminCriteriaSummary", selectedCompId, round] });
    },
    onError: (err) => toast.error(getErrorMessageWithDefault(err, "Gagal memperbarui kriteria")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/score-criteria/${id}`);
    },
    onSuccess: () => {
      toast.success("Kriteria berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["adminCriteria", selectedCompId, round] });
      queryClient.invalidateQueries({ queryKey: ["adminCriteriaSummary", selectedCompId, round] });
    },
    onError: (err) => toast.error(getErrorMessageWithDefault(err, "Gagal menghapus kriteria")),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const totalWeight = summary?.totalWeight ?? criteria.reduce((a, c) => a + c.weight, 0);
  const isValid = summary?.isValid ?? totalWeight === 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-white">Kriteria Penilaian</h1>
        <button
          onClick={openCreate}
          disabled={!selectedCompId}
          className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Tambah Kriteria
        </button>
      </div>

      {/* Filters */}
      <div className={`${glass} flex flex-col sm:flex-row gap-4`}>
        <div className="flex-1 space-y-2">
          <label className="text-xs text-white/60">Kompetisi</label>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs text-white/60">Tahap</label>
          <div className="flex gap-2">
            {(["PENYISIHAN", "FINAL"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRound(r)}
                className={`flex-1 h-12 rounded-full border text-sm font-semibold transition-colors ${
                  round === r
                    ? "bg-white text-[#5B6BBF] border-white"
                    : "border-white/30 text-white/70 hover:bg-white/5"
                }`}
              >
                {r === "PENYISIHAN" ? "Penyisihan" : "Final"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total weight indicator */}
      <div className={`${glass} flex items-center justify-between`}>
        <div>
          <p className="text-xs text-white/60">Total Bobot</p>
          <p className={`font-display text-2xl font-bold ${isValid ? "text-[#63CFA0]" : "text-rose-400"}`}>
            {totalWeight}%
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isValid
              ? "border-[#3CB578]/40 text-[#63CFA0]"
              : "border-rose-500/40 text-rose-400"
          }`}
        >
          {isValid ? "Rubrik sah (100%)" : "Belum sah (wajib 100%)"}
        </span>
      </div>

      {/* Table */}
      <div className={`${glass} overflow-x-auto`}>
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-white uppercase border-b border-white/10">
            <tr>
              <th className="py-3 pr-4">#</th>
              <th className="py-3 pr-4">Nama</th>
              <th className="py-3 pr-4">Grup</th>
              <th className="py-3 pr-4 text-center">Bobot</th>
              <th className="py-3 pr-4 text-center">Max</th>
              <th className="py-3 pr-4">Deskripsi</th>
              <th className="py-3 pr-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {criteria
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-4 text-white/60">{c.order}</td>
                  <td className="py-3 pr-4 font-medium text-white">{c.name}</td>
                  <td className="py-3 pr-4 text-white/60">{c.group || "-"}</td>
                  <td className="py-3 pr-4 text-center text-white">{c.weight}%</td>
                  <td className="py-3 pr-4 text-center text-white/60">{c.maxScore}</td>
                  <td className="py-3 pr-4 text-white/50 max-w-xs truncate">
                    {c.description || "-"}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        className="p-2 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {criteria.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-white/40">
                  Belum ada kriteria untuk kompetisi & tahap ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#15161A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                {editing ? "Edit Kriteria" : "Tambah Kriteria"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-white/60">Nama Kriteria</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 rounded-xl border border-white/30 bg-transparent px-4 text-white focus:outline-none focus:border-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/60">Grup (opsional)</label>
                <input
                  value={form.group}
                  onChange={(e) => setForm({ ...form, group: e.target.value })}
                  placeholder="mis. Presentasi & Prototyping"
                  className="w-full h-11 rounded-xl border border-white/30 bg-transparent px-4 text-white focus:outline-none focus:border-white/60"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/60">Deskripsi (opsional)</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-white/30 bg-transparent px-4 py-3 text-white focus:outline-none focus:border-white/60 resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-white/60">Bobot %</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                    className="w-full h-11 rounded-xl border border-white/30 bg-transparent px-4 text-white focus:outline-none focus:border-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60">Max Score</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full h-11 rounded-xl border border-white/30 bg-transparent px-4 text-white focus:outline-none focus:border-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/60">Urutan</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full h-11 rounded-xl border border-white/30 bg-transparent px-4 text-white focus:outline-none focus:border-white/60"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/20 text-white/70 hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 rounded-full bg-white text-[#5B6BBF] font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {editing ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}