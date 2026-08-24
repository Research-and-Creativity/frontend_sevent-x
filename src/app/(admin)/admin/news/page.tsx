"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState([
    { id: "n-1", title: "Pengumuman Jadwal Babak Penjurian SEVENT X 2026", category: "Important", publishedAt: "2026-10-15", excerpt: "Jadwal resmi babak kualifikasi dan penjurian online bagi seluruh peserta terverifikasi." },
    { id: "n-2", title: "Panduan Teknis Upload Berkas Proposal & Video", category: "Info", publishedAt: "2026-10-18", excerpt: "Petunjuk teknis pengunggahan proposal PDF dan link video demo karya di dashboard." },
    { id: "n-3", title: "Webinar Technical Meeting SEVENT X 2026", category: "Update", publishedAt: "2026-10-20", excerpt: "Undangan sesi tanya jawab bersama panitia teknis pada tanggal 22 Oktober." },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Important");

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) {
      toast.error("Judul berita wajib diisi.");
      return;
    }
    const newItem = {
      id: `n-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      publishedAt: new Date().toISOString().split("T")[0],
      excerpt: "Artikel berita resmi terbaru untuk peserta SEVENT X 2026.",
    };
    setNewsList((prev) => [newItem, ...prev]);
    setNewTitle("");
    toast.success("Artikel berita berhasil dipublikasikan!");
  };

  const handleDeleteNews = (id: string) => {
    setNewsList((prev) => prev.filter((n) => n.id !== id));
    toast.success("Artikel berita berhasil dihapus.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          News & Article Publisher
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Publikasikan artikel pengumuman resmi dan berita terbaru ke dashboard peserta.
        </p>
      </div>

      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Newspaper className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-white">Publish New Article</h2>
        </div>

        <form onSubmit={handleAddNews} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-7 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Judul Pengumuman/Berita</label>
            <input
              type="text"
              placeholder="Misal: Perubahan Batas Akhir Submission Karya..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">Tag Kategori</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="Important" className="bg-card text-white">Important (Merah)</option>
              <option value="Info" className="bg-card text-white">Info (Biru)</option>
              <option value="Update" className="bg-card text-white">Update (Hijau)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Publish</span>
            </Button>
          </div>
        </form>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="font-display font-bold text-base text-white">Daftar Berita Terpublikasi</h3>

          {newsList.map((n) => (
            <div key={n.id} className="bg-surface/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${n.category === "Important" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : n.category === "Info" ? "bg-primary/20 text-accent border border-primary/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                    {n.category}
                  </span>
                  <h4 className="font-bold text-white text-sm">{n.title}</h4>
                </div>
                <p className="text-xs text-text-secondary line-clamp-1">{n.excerpt}</p>
                <span className="font-mono text-[10px] text-text-secondary block">Dipublish pada: {n.publishedAt}</span>
              </div>

              <Button onClick={() => handleDeleteNews(n.id)} variant="outline" className="bg-card text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs h-8 px-3 rounded-lg cursor-pointer shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
