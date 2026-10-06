"use client";

import { useState } from "react";
import { Users, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const rows = [
  { team: "Tim Anomali", leader: "Yanto", time: "19.23 | 12 Oct 2026", doc: { label: "Need Review", cls: "border-[#5B8DEF] text-[#7FA7F5]" }, pay: { label: "Not Paid", cls: "border-[#E55353] text-[#F08080]" } },
  { team: "Coba coba saja", leader: "Azmi", time: "19.23 | 12 Oct 2026", doc: { label: "Revise", cls: "border-[#E5B33C] text-[#F0C969]" }, pay: { label: "Need Review", cls: "border-[#5B8DEF] text-[#7FA7F5]" } },
  { team: "Adalah pokoknya", leader: "Wifakul", time: "19.23 | 12 Oct 2026", doc: { label: "Approved", cls: "border-[#3CB578] text-[#63CFA0]" }, pay: { label: "Paid", cls: "border-[#3CB578] text-[#63CFA0]" } },
];

export default function AdminOverviewDashboardPage() {
  const [page, setPage] = useState(1);
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h1 className="font-display text-3xl font-bold">Good Morning, Admin</h1>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">REGISTERED TEAM</span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">547</p>
        </div>
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">TIME REMAINING</span>
            <Clock className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">02d : 14h : 45m</p>
          <p className="text-xs text-white/50 mt-2">Registration</p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "NEED REVIEW", value: 547 },
          { label: "NEED REVISE", value: 282 },
          { label: "APPROVED PROFILE", value: 282 },
          { label: "APPROVED PAYMENT", value: 282 },
        ].map((c) => (
          <div key={c.label} className="bg-[#15161A] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-widest text-white/60">{c.label}</span>
              <Users className="w-5 h-5 text-white/70" />
            </div>
            <p className="font-display text-4xl font-bold text-[#A9B7FF]">{c.value} <span className="text-sm text-white/40 font-normal">/ 1001</span></p>
            <div className="mt-4 h-1.5 rounded-full bg-[#2A3568] overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-[#7D8CFF]" />
            </div>
          </div>
        ))}
      </div>

      {/* Registered Team table */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-bold mb-6">Registered Team</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="pb-3 font-semibold">Team</th>
              <th className="pb-3 font-semibold">Team Leader Name</th>
              <th className="pb-3 font-semibold">Time Registration</th>
              <th className="pb-3 font-semibold">Status Document</th>
              <th className="pb-3 font-semibold">Status Payment</th>
              <th className="pb-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.team} className="border-b border-white/5">
                <td className="py-4">{r.team}</td>
                <td className="py-4">{r.leader}</td>
                <td className="py-4">{r.time}</td>
                <td className="py-4"><span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${r.doc.cls}`}>{r.doc.label}</span></td>
                <td className="py-4"><span className={`inline-block px-4 py-1.5 rounded-full border text-xs font-semibold ${r.pay.cls}`}>{r.pay.label}</span></td>
                <td className="py-4"><button className="text-white/60 hover:text-white"><Eye className="w-5 h-5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between pt-5 text-xs text-white/50">
          <span>Showing 10 data out of 100</span>
          <div className="flex items-center gap-3">
            <span>Show</span>
            <select className="bg-transparent border border-white/20 rounded-lg px-2 py-1"><option>10</option></select>
            <span>data per page</span>
            <button onClick={() => setPage(Math.max(1, page - 1))} className="border border-white/20 rounded-lg p-1.5"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(page + 1)} className="border border-white/20 rounded-lg p-1.5"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
