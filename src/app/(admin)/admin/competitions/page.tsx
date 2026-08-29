"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Competition } from "@/types/api";

export default function AdminCompetitionsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch competitions list
  const { data: competitions = [], refetch } = useQuery<Competition[]>({
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

  const [newCompName, setNewCompName] = useState("");
  const [newCompSlug, setNewCompSlug] = useState("");
  const [newCompDesc, setNewCompDesc] = useState("");
  const [newMaxMember, setNewMaxMember] = useState<number>(3);

  // Edit State Modal
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMaxMember, setEditMaxMember] = useState<number>(3);

  // Create Competition Mutation (POST /api/competitions)
  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; slug: string; description: string; maxMember: number }) => {
      const res = await apiClient.post("/api/competitions", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Cabang kompetisi baru berhasil ditambahkan!");
      setNewCompName("");
      setNewCompSlug("");
      setNewCompDesc("");
      queryClient.invalidateQueries({ queryKey: ["adminCompetitionsList"] });
      queryClient.invalidateQueries({ queryKey: ["competitionsList"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Gagal menambahkan kompetisi");
    },
  });

  // Edit Competition Mutation (PUT /api/competitions/:slug)
  const editMutation = useMutation({
    mutationFn: async ({ slug, payload }: { slug: string; payload: Partial<Competition> }) => {
      const res = await apiClient.put(`/api/competitions/${slug}`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Data kompetisi berhasil diperbarui!");
      setEditingComp(null);
      queryClient.invalidateQueries({ queryKey: ["adminCompetitionsList"] });
      queryClient.invalidateQueries({ queryKey: ["competitionsList"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Gagal memperbarui kompetisi");
    },
  });

  const handleAddCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) {
      toast.error("Nama kompetisi wajib diisi.");
      return;
    }
    const slug = newCompSlug.trim() || newCompName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    createMutation.mutate({
      name: newCompName.trim(),
      slug,
      description: newCompDesc.trim(),
      maxMember: Number(newMaxMember) || 3,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp) return;
    editMutation.mutate({
      slug: editingComp.slug,
      payload: {
        name: editName.trim(),
        description: editDesc.trim(),
        maxMember: Number(editMaxMember) || 3,
      },
    });
  };

  const openEditModal = (comp: Competition) => {
    setEditingComp(comp);
    setEditName(comp.name);
    setEditDesc(comp.description || "");
    setEditMaxMember(comp.maxMember || 3);
  };

  const displayList = competitions.length > 0 ? competitions : [
    { id: "1", name: "National Web Development Competition 2026", slug: "web-development", description: "Kompetisi pembuatan aplikasi web inovatif.", maxMember: 5, isActive: true, createdAt: "", updatedAt: "" },
    { id: "2", name: "National UI/UX Design Challenge 2026", slug: "ui-ux-design", description: "Tantangan eksplorasi antarmuka dan pengalaman pengguna.", maxMember: 3, isActive: true, createdAt: "", updatedAt: "" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Competitions & Track Management
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pengaturan cabang kompetisi, kategori perlombaan, biaya pendaftaran, dan batasan kuota anggota.
        </p>
      </div>

      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Trophy className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-white">Tambah Cabang Lomba Baru</h2>
        </div>

        <form onSubmit={handleAddCompetition} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Nama Cabang Lomba</label>
            <input
              type="text"
              required
              placeholder="Misal: Mobile App Development"
              value={newCompName}
              onChange={(e) => {
                setNewCompName(e.target.value);
                if (!newCompSlug) {
                  setNewCompSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }
              }}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Slug URL</label>
            <input
              type="text"
              required
              placeholder="misal: mobile-app-dev"
              value={newCompSlug}
              onChange={(e) => setNewCompSlug(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Maks Anggota / Tim</label>
            <input
              type="number"
              min={1}
              max={10}
              value={newMaxMember}
              onChange={(e) => setNewMaxMember(Number(e.target.value))}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-10 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Deskripsi Kompetisi</label>
            <input
              type="text"
              placeholder="Deskripsi singkat mengenai kompetisi ini..."
              value={newCompDesc}
              onChange={(e) => setNewCompDesc(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? "Menyimpan..." : "Tambah"}</span>
            </Button>
          </div>
        </form>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="font-display font-bold text-base text-white">Cabang Kompetisi Aktif</h3>
          {displayList.map((c) => (
            <div key={c.id || c.slug} className="bg-surface/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-bold text-white text-sm">{c.name}</h4>
                  <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded">
                    slug: {c.slug}
                  </span>
                </div>
                <p className="text-xs text-text-secondary line-clamp-1">{c.description || "Tidak ada deskripsi."}</p>
                <p className="text-[10px] text-text-secondary font-mono">Maks: {c.maxMember || 3} Anggota</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-3 py-1 rounded-md">
                  {c.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(c)}
                  className="bg-card hover:bg-card-hover border-border text-white text-xs h-8 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL EDIT KOMPETISI (PUT /api/competitions/:slug) */}
      {editingComp && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-surface border border-border/80 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 relative">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Edit Kompetisi: {editingComp.name}
                </h3>
                <p className="font-mono text-xs text-accent mt-0.5">
                  PUT /api/competitions/{editingComp.slug}
                </p>
              </div>
              <button
                onClick={() => setEditingComp(null)}
                className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-card cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Nama Kompetisi</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Maks Anggota per Tim</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={editMaxMember}
                  onChange={(e) => setEditMaxMember(Number(e.target.value))}
                  className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Deskripsi</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-card border border-border/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingComp(null)}
                  className="bg-card border-border text-text-secondary text-xs h-9 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-9 rounded-xl px-4 cursor-pointer disabled:opacity-50"
                >
                  {editMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
