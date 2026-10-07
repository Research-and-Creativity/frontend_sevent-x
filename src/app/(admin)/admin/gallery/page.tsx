"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function AdminGalleryPage() {
  const [search, setSearch] = useState("");
  const items = Array.from({ length: 9 });

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
            <a href="/admin/gallery/add" className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors">
              <span className="text-lg leading-none">+</span> Add
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((_, i) => (
            <Link key={i} href={`/admin/gallery/${i + 1}`} className="block aspect-[16/10] bg-neutral-200/90 rounded-lg hover:opacity-90 transition-opacity" />
          ))}
        </div>

        <div className="flex items-center justify-between pt-5 text-xs text-white/50">
          <span>Showing {items.length} data out of 100</span>
          <div className="flex items-center gap-3">
            <span>Show</span>
            <select className="bg-transparent border border-white/20 rounded-lg px-2 py-1"><option>10</option></select>
            <span>data per page</span>
            <button className="border border-white/20 rounded-lg p-1.5"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
            <button className="border border-white/20 rounded-lg p-1.5"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
}
