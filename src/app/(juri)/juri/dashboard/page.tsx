"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUserMe } from "@/hooks/use-peserta";

const topScores = [
  { team: "Tim Anomali", product: "Product", leader: "Yanto", date: "21 October 2026" },
  { team: "Coba coba saja", product: "Product", leader: "Azmi", date: "22 October 2026" },
  { team: "Adalah pokoknya", product: "Product", leader: "Wifakul", date: "23 October 2026" },
];

export default function JuriDashboardPage() {
  const storeUser = useAuthStore((state) => state.user);
  const { data: userMe } = useUserMe();
  const currentUser = userMe || storeUser;
  const name = currentUser?.fullName || "Mr. Yanto Hary";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h1 className="font-display text-3xl font-bold">Good Morning, {name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">ALREADY SUBMITTED</span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">547 <span className="text-lg text-white/40 font-normal">/ 1001</span></p>
          <div className="mt-4 h-1.5 rounded-full bg-[#2A3568] overflow-hidden">
            <div className="h-full w-[55%] rounded-full bg-[#7D8CFF]" />
          </div>
        </div>

        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">JUDGED</span>
            <Users className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">282 <span className="text-lg text-white/40 font-normal">/ 1001</span></p>
          <div className="mt-4 h-1.5 rounded-full bg-[#2A3568] overflow-hidden">
            <div className="h-full w-[28%] rounded-full bg-[#7D8CFF]" />
          </div>
        </div>

        <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs tracking-widest text-white/60">TIME REMAINING</span>
            <Clock className="w-5 h-5 text-white/70" />
          </div>
          <p className="font-display text-5xl font-bold">02d : 14h : 45m</p>
          <p className="text-xs text-white/50 mt-2">Until last judgement time</p>
        </div>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-bold mb-6">Top 3 Highest Score</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-left text-white/70 border-b border-white/10">
              <th className="pb-3 font-semibold">Team</th>
              <th className="pb-3 font-semibold">Product Name</th>
              <th className="pb-3 font-semibold">Team Leader Name</th>
              <th className="pb-3 font-semibold">Submitted Date</th>
              <th className="pb-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topScores.map((t) => (
              <tr key={t.team} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-5 pr-4">{t.team}</td>
                <td className="py-5 pr-4">{t.product}</td>
                <td className="py-5 pr-4">{t.leader}</td>
                <td className="py-5 pr-4">{t.date}</td>
                <td className="py-5">
                  <Link href="/juri/team" className="text-white/60 hover:text-white">
                    <Eye className="w-5 h-5" />
                  </Link>
                </td>
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
            <button className="border border-white/20 rounded-lg p-1.5"><ChevronLeft className="w-4 h-4" /></button>
            <button className="border border-white/20 rounded-lg p-1.5"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
