"use client";

import { useState } from "react";
import { NewsPost } from "@/types/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PesertaAnnouncementsPage() {
  // Pass 1: UI-only with mock data adhering 100% to NewsPost interface from src/types/api.ts
  const mockNews: NewsPost[] = [
    {
      id: "n-1",
      title: "Perpanjangan Deadline Submission",
      slug: "perpanjangan-deadline-submission",
      content:
        "Batas akhir pengumpulan karya tahap penyisihan diperpanjang hingga tanggal 10 Agustus 2024 pukul 23.59 WIB. Pastikan seluruh berkas terunggah lengkap.",
      excerpt:
        "Batas akhir pengumpulan karya tahap penyisihan diperpanjang hingga tanggal 10 Agustus 2024 pukul 23.59 WIB.",
      category: "important",
      authorId: "admin-1",
      author: {
        id: "admin-1",
        email: "panitia@seventx.id",
        name: "Panitia",
        role: "ADMIN",
        createdAt: "2024-08-01T00:00:00Z",
        updatedAt: "2024-08-01T00:00:00Z",
      },
      publishedAt: "2024-08-05T00:00:00Z",
      isPublished: true,
      createdAt: "2024-08-05T00:00:00Z",
      updatedAt: "2024-08-05T00:00:00Z",
    },
    {
      id: "n-2",
      title: "Jadwal Presentasi Final",
      slug: "jadwal-presentasi-final",
      content:
        "Presentasi final akan dilaksanakan secara hibrida pada tanggal 20 Agustus 2024. Detail urutan tampil dan link room Zoom dapat diakses melalui portal.",
      excerpt:
        "Presentasi final akan dilaksanakan secara hibrida pada tanggal 20 Agustus 2024.",
      category: "Info",
      authorId: "admin-1",
      author: {
        id: "admin-1",
        email: "panitia@seventx.id",
        name: "Panitia",
        role: "ADMIN",
        createdAt: "2024-08-01T00:00:00Z",
        updatedAt: "2024-08-01T00:00:00Z",
      },
      publishedAt: "2024-08-03T00:00:00Z",
      isPublished: true,
      createdAt: "2024-08-03T00:00:00Z",
      updatedAt: "2024-08-03T00:00:00Z",
    },
    {
      id: "n-3",
      title: "Update Format Laporan",
      slug: "update-format-laporan",
      content:
        "Telah diterbitkan pustaka template laporan terbaru v1.2. Harap mengunduh berkas pendukung revisi di halaman guidebook sebelum melakukan submit final.",
      excerpt:
        "Telah diterbitkan pustaka template laporan terbaru v1.2. Harap mengunduh berkas pendukung revisi.",
      category: "Update",
      authorId: "admin-1",
      author: {
        id: "admin-1",
        email: "panitia@seventx.id",
        name: "Panitia",
        role: "ADMIN",
        createdAt: "2024-08-01T00:00:00Z",
        updatedAt: "2024-08-01T00:00:00Z",
      },
      publishedAt: "2024-08-01T00:00:00Z",
      isPublished: true,
      createdAt: "2024-08-01T00:00:00Z",
      updatedAt: "2024-08-01T00:00:00Z",
    },
    {
      id: "n-4",
      title: "Pengumuman Hasil Seleksi Tahap 1",
      slug: "pengumuman-hasil-seleksi-tahap-1",
      content:
        "Selamat kepada 15 tim terbaik yang dinyatakan lolos ke babak semifinal SEVENT X 2024. Daftar peserta resmi dapat dilihat pada pengumuman ini.",
      excerpt:
        "Selamat kepada 15 tim terbaik yang dinyatakan lolos ke babak semifinal SEVENT X 2024.",
      category: "Info",
      authorId: "admin-1",
      author: {
        id: "admin-1",
        email: "panitia@seventx.id",
        name: "Panitia",
        role: "ADMIN",
        createdAt: "2024-08-01T00:00:00Z",
        updatedAt: "2024-08-01T00:00:00Z",
      },
      publishedAt: "2024-07-28T00:00:00Z",
      isPublished: true,
      createdAt: "2024-07-28T00:00:00Z",
      updatedAt: "2024-07-28T00:00:00Z",
    },
  ];

  // Active Filter State: "All" | "important" | "Update"
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Client-side filter
  const filteredNews = mockNews.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "important") return item.category === "important";
    if (activeFilter === "Update") return item.category === "Update";
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Filter Tabs Header */}
      <div className="flex items-center gap-2.5">
        {["All", "important", "Update"].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              variant={isActive ? "default" : "outline"}
              className={`px-5 h-9 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-primary hover:bg-primary-hover text-white shadow-sm"
                  : "bg-surface hover:bg-card-hover border-border text-text-secondary hover:text-white"
              }`}
            >
              {filter}
            </Button>
          );
        })}
      </div>

      {/* Announcement Cards List */}
      <div className="space-y-4">
        {filteredNews.map((item) => {
          const category = item.category;
          const isImportant = category === "important";
          const isInfo = category === "Info";
          const isUpdate = category === "Update";

          const formattedDate = new Date(item.publishedAt || item.createdAt).toLocaleDateString(
            "id-ID",
            { day: "numeric", month: "long", year: "numeric" }
          );

          const authorName = item.author?.name || "Panitia";

          return (
            <Card
              key={item.id}
              className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-sm transition-all hover:border-white/20"
            >
              {/* Top Row: Category Badge (Left) & Date (Right) */}
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border ${
                    isImportant
                      ? "bg-urgent-soft/40 border-urgent/40 text-urgent"
                      : isInfo
                      ? "bg-primary/20 border-primary/40 text-accent"
                      : isUpdate
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-card-hover border-border text-text-secondary"
                  }`}
                >
                  {category}
                </span>

                <span className="text-xs font-mono text-text-secondary">
                  {formattedDate}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display font-bold text-xl text-white tracking-tight">
                {item.title}
              </h2>

              {/* Description / Content Excerpt */}
              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 leading-relaxed">
                {item.excerpt || item.content}
              </p>

              {/* Footer: Posted By */}
              <div className="pt-2">
                <p className="text-xs font-mono text-text-secondary">
                  Diposting oleh <strong className="text-white font-semibold">{authorName}</strong>
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
