"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState([
    { id: "comp-1", name: "National Web Development Competition 2026", category: "Web Development", fee: "Rp 150.000", maxMembers: 5, status: "ACTIVE" },
    { id: "comp-2", name: "National UI/UX Design Challenge 2026", category: "UI/UX Design", fee: "Rp 150.000", maxMembers: 3, status: "ACTIVE" },
  ]);

  const [newCompName, setNewCompName] = useState("");
  const [newCompCategory, setNewCompCategory] = useState("Web Development");

  const handleAddCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) {
      toast.error("Nama kompetisi wajib diisi.");
      return;
    }
    const newComp = {
      id: `comp-${Date.now()}`,
      name: newCompName,
      category: newCompCategory,
      fee: "Rp 150.000",
      maxMembers: 5,
      status: "ACTIVE",
    };
    setCompetitions((prev) => [...prev, newComp]);
    setNewCompName("");
    toast.success("Cabang kompetisi baru berhasil ditambahkan!");
  };

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
          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Nama Cabang Lomba</label>
            <input
              type="text"
              placeholder="Misal: Mobile App Development Contest 2026"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Kategori Track</label>
            <select
              value={newCompCategory}
              onChange={(e) => setNewCompCategory(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="Web Development" className="bg-card text-white">Web Development</option>
              <option value="UI/UX Design" className="bg-card text-white">UI/UX Design</option>
              <option value="AI & Machine Learning" className="bg-card text-white">AI & Machine Learning</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </Button>
          </div>
        </form>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="font-display font-bold text-base text-white">Cabang Kompetisi Aktif</h3>
          {competitions.map((c) => (
            <div key={c.id} className="bg-surface/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">{c.name}</h4>
                <p className="text-xs text-text-secondary font-mono">Kategori: {c.category} • Biaya: {c.fee} • Maks: {c.maxMembers} Anggota</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-3 py-1 rounded-md shrink-0">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
