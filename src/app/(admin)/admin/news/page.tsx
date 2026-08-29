"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { NewsPost, NewsTag } from "@/types/api";

export default function AdminNewsPage() {
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<NewsTag>("IMPORTANT");

  // 1. Fetch News list from GET /api/news (global bulletin, no competitionSlug)
  const {
    data: newsList = [],
    isLoading: isNewsLoading,
    refetch,
  } = useQuery<NewsPost[]>({
    queryKey: ["adminNewsList", selectedTag],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/news", {
          params: selectedTag !== "ALL" ? { tag: selectedTag } : undefined,
        });
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Fallback mock data if backend returns empty
  const defaultNews: NewsPost[] = [
    {
      id: "n-1",
      title: "Pengumuman Jadwal Babak Penjurian SEVENT X 2026",
      content:
        "Jadwal resmi babak kualifikasi dan penjurian online bagi seluruh peserta terverifikasi.",
      tag: "IMPORTANT",
      authorId: "admin-1",
      createdAt: "2026-10-15T08:00:00Z",
      updatedAt: "2026-10-15T08:00:00Z",
    },
    {
      id: "n-2",
      title: "Panduan Teknis Upload Berkas Proposal & Video",
      content:
        "Petunjuk teknis pengunggahan proposal PDF dan link video demo karya di dashboard.",
      tag: "INFO",
      authorId: "admin-1",
      createdAt: "2026-10-18T10:00:00Z",
      updatedAt: "2026-10-18T10:00:00Z",
    },
    {
      id: "n-3",
      title: "Webinar Technical Meeting SEVENT X 2026",
      content:
        "Undangan sesi tanya jawab bersama panitia teknis pada tanggal 22 Oktober.",
      tag: "UPDATE",
      authorId: "admin-1",
      createdAt: "2026-10-20T14:00:00Z",
      updatedAt: "2026-10-20T14:00:00Z",
    },
  ];

  const displayedNews = newsList.length > 0 ? newsList : defaultNews;

  // Filter client-side if fallback is used
  const filteredNews =
    selectedTag === "ALL"
      ? displayedNews
      : displayedNews.filter(
          (n) => n.tag?.toUpperCase() === selectedTag.toUpperCase()
        );

  // 2. Mutation to publish news (POST /api/admin/news with title, tag, content)
  const addNewsMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      tag: NewsTag;
      content: string;
    }) => {
      const res = await apiClient.post("/api/admin/news", payload);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Artikel berita berhasil dipublikasikan!");
      setNewTitle("");
      setNewContent("");
      queryClient.invalidateQueries({ queryKey: ["adminNewsList"] });
      queryClient.invalidateQueries({ queryKey: ["newsAnnouncements"] });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal mempublikasikan berita";
      toast.error(msg);
    },
  });

  // 3. Mutation to delete news (DELETE /api/admin/news/:id)
  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/api/admin/news/${id}`);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      toast.success("Artikel berita berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["adminNewsList"] });
      queryClient.invalidateQueries({ queryKey: ["newsAnnouncements"] });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal menghapus artikel berita";
      toast.error(msg);
    },
  });

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Judul berita wajib diisi.");
      return;
    }
    addNewsMutation.mutate({
      title: newTitle.trim(),
      tag: newCategory,
      content: newContent.trim() || newTitle.trim(),
    });
  };

  const renderTagBadge = (tag: string) => {
    const upper = tag.toUpperCase();
    if (upper === "IMPORTANT") {
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
          IMPORTANT
        </span>
      );
    }
    if (upper === "INFO") {
      return (
        <span className="bg-primary/20 text-accent border border-primary/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
          INFO
        </span>
      );
    }
    return (
      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
        UPDATE
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            News & Article Publisher
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Publikasikan artikel pengumuman umum dan buletin resmi ke seluruh
            peserta & juri SEVENT X 2026.
          </p>
        </div>

        {/* Filter by Category Tag Only */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-text-secondary" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL" className="bg-card text-white">
              Semua Kategori Tag
            </option>
            <option value="IMPORTANT" className="bg-card text-white">
              Important (Merah)
            </option>
            <option value="INFO" className="bg-card text-white">
              Info (Biru)
            </option>
            <option value="UPDATE" className="bg-card text-white">
              Update (Hijau)
            </option>
          </select>
        </div>
      </div>

      {/* Main Card: Form Publish New Article */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Newspaper className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-white">
            Publish New Article
          </h2>
        </div>

        <form onSubmit={handleAddNews} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Judul Pengumuman / Berita
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Perubahan Batas Akhir Submission Karya..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                Tag Kategori
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as NewsTag)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="IMPORTANT" className="bg-card text-white">
                  IMPORTANT (Merah)
                </option>
                <option value="INFO" className="bg-card text-white">
                  INFO (Biru)
                </option>
                <option value="UPDATE" className="bg-card text-white">
                  UPDATE (Hijau)
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
              Isi Konten / Deskripsi Artikel
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan isi detail artikel atau pengumuman yang ingin disampaikan..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={addNewsMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold h-10 px-6 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {addNewsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>
                {addNewsMutation.isPending ? "Mempublikasikan..." : "Publish Article"}
              </span>
            </Button>
          </div>
        </form>

        {/* List of Published Articles */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white">
              Daftar Berita Terpublikasi
            </h3>
            <span className="text-xs font-mono text-text-secondary">
              {filteredNews.length} Artikel
            </span>
          </div>

          {filteredNews.map((n) => (
            <div
              key={n.id}
              className="bg-surface/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  {renderTagBadge(n.tag)}
                  <h4 className="font-bold text-white text-sm">{n.title}</h4>
                </div>
                <p className="text-xs text-text-secondary line-clamp-2">
                  {n.content}
                </p>
                <span className="font-mono text-[10px] text-text-secondary block">
                  Dipublish pada:{" "}
                  {n.createdAt ? n.createdAt.split("T")[0] : "2026-10-15"}
                </span>
              </div>

              <Button
                onClick={() => deleteNewsMutation.mutate(n.id)}
                disabled={deleteNewsMutation.isPending}
                variant="outline"
                className="bg-card text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs h-8 px-3 rounded-lg cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
