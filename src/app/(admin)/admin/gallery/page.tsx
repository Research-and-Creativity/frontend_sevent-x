"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAdminGallery } from "@/hooks/use-admin";

export default function AdminGalleryPage() {
  const [search, setSearch] = useState("");
  const { data: items = [], isLoading } = useAdminGallery();

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Gallery</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Gallery</h2>
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
            <Link
              href="/admin/gallery/add"
              className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors"
            >
              <span className="text-lg leading-none">+</span> Add
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] rounded-lg bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-white/40">
            {items.length === 0
              ? "Belum ada gambar pada galeri."
              : "Tidak ada gambar yang cocok dengan pencarian."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/admin/gallery/${item.id}`}
                className="group block overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
              >
                <div className="relative aspect-[16/10] bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                  />
                </div>
                <p className="truncate px-3 py-2 text-sm text-white/70">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <p className="pt-5 text-xs text-white/50">
            Showing {filtered.length} of {items.length} images
          </p>
        )}
      </div>
    </div>
  );
}
