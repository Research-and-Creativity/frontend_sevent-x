"use client";

import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "@/hooks/use-admin";
import { getErrorMessageWithDefault } from "@/lib/errors";
import { NewsTag } from "@/types/api";

const TAG_STYLE: Record<NewsTag, string> = {
  IMPORTANT: "border-[#E55353] text-[#F08080]",
  INFO: "border-[#5B8DEF] text-[#7FA7F5]",
  UPDATE: "border-[#3CB578] text-[#63CFA0]",
};

const TAGS: NewsTag[] = ["IMPORTANT", "INFO", "UPDATE"];

export default function AdminAnnouncementPage() {
  const [search, setSearch] = useState("");
  const { data: news = [], isLoading } = useAdminNews();
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const deleteMutation = useDeleteNews();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<NewsTag>("IMPORTANT");

  const filtered = news.filter((item) =>
    item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setTag("IMPORTANT");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const post = news.find((n) => n.id === id);
    if (!post) return;
    setEditingId(id);
    setTitle(post.title);
    setContent(post.content);
    setTag(post.tag);
    setShowForm(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Judul dan isi pengumuman wajib diisi.");
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          title: title.trim(),
          content: content.trim(),
          tag,
        });
        toast.success("Pengumuman berhasil diperbarui.");
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          tag,
        });
        toast.success("Pengumuman berhasil dibuat.");
      }
      resetForm();
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal menyimpan pengumuman"));
    }
  };

  const onDelete = async (id: string, postTitle: string) => {
    if (!confirm(`Hapus pengumuman "${postTitle}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Pengumuman berhasil dihapus.");
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal menghapus pengumuman"));
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Announcement</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Announcement List</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 bg-transparent border border-white/20 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={onSubmit}
            className="mb-6 space-y-4 rounded-2xl border border-white/15 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">
                {editingId ? "Edit Announcement" : "Create new Announcement"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-white/50 hover:text-white cursor-pointer"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-sm text-white/70">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul pengumuman"
                className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Isi pengumuman"
                className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as NewsTag)}
                className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer bg-white text-[#5B6BBF] font-semibold text-sm px-10 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </form>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="pb-3 font-semibold">Title</th>
              <th className="pb-3 font-semibold">Tag</th>
              <th className="pb-3 font-semibold">Created</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-4" colSpan={4}>
                    <div className="h-6 rounded bg-white/5 animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td className="py-10 text-center text-white/40" colSpan={4}>
                  {news.length === 0
                    ? "Belum ada pengumuman."
                    : "Tidak ada pengumuman yang cocok."}
                </td>
              </tr>
            ) : (
              filtered.map((post) => (
                <tr key={post.id} className="border-b border-white/5">
                  <td className="py-4 max-w-md">
                    <p className="truncate font-medium text-white">
                      {post.title}
                    </p>
                    <p className="truncate text-xs text-white/40">
                      {post.content}
                    </p>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${TAG_STYLE[post.tag]}`}
                    >
                      {post.tag}
                    </span>
                  </td>
                  <td className="py-4 text-white/60">
                    {new Date(post.createdAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(post.id)}
                        className="text-white/60 hover:text-white cursor-pointer"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(post.id, post.title)}
                        className="text-white/60 hover:text-rose-400 cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
