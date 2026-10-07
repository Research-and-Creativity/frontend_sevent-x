"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminAnnouncementCreatePage() {
  const [status, setStatus] = useState("");
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Announcement</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-8">
        <h2 className="font-display text-2xl font-bold mb-8">Create new Announcement</h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-white/70">Title</label>
              <input type="text" placeholder="0" className="mt-2 w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60" />
            </div>
            <div>
              <label className="text-sm text-white/70">Status</label>
              <div className="relative mt-2">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white/80 focus:outline-none focus:border-white/60 appearance-none">
                  <option value="" className="bg-[#15161A]">Status</option>
                  <option value="published" className="bg-[#15161A]">Published</option>
                  <option value="not_published" className="bg-[#15161A]">Not Published</option>
                </select>
                <svg className="w-4 h-4 text-white/60 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Information</label>
            <textarea placeholder="Notes" rows={5} className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/60" />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-white text-[#5B6BBF] font-semibold text-sm px-10 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
