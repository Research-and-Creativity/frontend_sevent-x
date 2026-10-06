"use client";

import { useState } from "react";
import { Search } from "lucide-react";

const rows = [
  { title: "Adalah pokoknya", time: "19.23 | 12 Oct 2026", published: true },
  { title: "Adalah pokoknya", time: "19.23 | 12 Oct 2026", published: false },
  { title: "Adalah pokoknya", time: "19.23 | 12 Oct 2026", published: false },
  { title: "Adalah pokoknya", time: "19.23 | 12 Oct 2026", published: true },
];

export default function AdminAnnouncementPage() {
  const [search, setSearch] = useState("");
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Announcement</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Announcement List</h2>
          <div className="flex items-center gap-3">
            <button title="Filter" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/></svg>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-72 bg-transparent border border-white/20 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50" />
            </div>
            <a href="/admin/announcement/create" className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors">
              <span className="text-lg leading-none">+</span> Create
            </a>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="pb-3 font-semibold">Title</th>
              <th className="pb-3 font-semibold">Time Created</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-5 pr-4">{r.title}</td>
                <td className="py-5 pr-4">{r.time}</td>
                <td className="py-5 pr-4">
                  <span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${r.published ? "border-[#3CB578] text-[#63CFA0]" : "border-[#E55353] text-[#F08080]"}`}>
                    {r.published ? "Published" : "Not Published"}
                  </span>
                </td>
                <td className="py-5">
                  <button className="text-white/60 hover:text-white"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between pt-5 text-xs text-white/50">
          <span>Showing {rows.length} data out of 100</span>
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
