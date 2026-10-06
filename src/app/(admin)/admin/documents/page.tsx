"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, Search, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Team } from "@/types/api";

export default function AdminDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teams = [], isLoading, isError, refetch } = useQuery<Team[]>({
    queryKey: ["adminTeamsVerified"],
    queryFn: async () => {
      const res = await apiClient.get("/api/teams");
      const list = res.data?.data || res.data;
      return Array.isArray(list) ? list : [];
    },
  });

  const verifiedTeams = teams.filter((t) => {
    const pObj = t.paymentProof || (t as any).documents?.find((d: any) => d.type === "PAYMENT_PROOF" || d.type === "PAYMENT");
    const s = (pObj?.status || (t as any).status || "").toString().toUpperCase();
    return s.includes("APPROVE") || s.includes("VERIF") || s.includes("PAID");
  });

  const filtered = verifiedTeams.filter((t) => {
    const name = t.teamName || (t as any).name || "";
    const leader = t.members?.find((m) => m.role === "LEADER")?.user?.fullName || (t as any).leader || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || leader.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const timeLabel = (t: Team) => {
    const created = (t as any).createdAt || (t as any).registrationDate;
    if (!created) return "-";
    try { return new Date(created).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return String(created); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Good Morning, Admin</h1>
      </div>

      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Registered Team</h2>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-white/5" title="Filter">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z"/></svg>
            </button>
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 bg-transparent border border-white/20 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/50" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3"><Skeleton className="h-12 w-full rounded-xl bg-white/5" /><Skeleton className="h-16 w-full rounded-xl bg-white/5" /></div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Gagal memuat data tim</p>
            <Button size="sm" onClick={() => refetch()} className="bg-primary text-white text-xs h-8 rounded-lg">Coba Lagi</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2 bg-white/5 border border-dashed border-white/10 rounded-xl">
            <Users className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Belum ada tim yang verified</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
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
            <tbody className="divide-y divide-white/5">
              {filtered.map((t) => {
                const teamName = t.teamName || (t as any).name || "Unnamed Team";
                const leader = t.members?.find((m) => m.role === "LEADER")?.user?.fullName || (t as any).leader || "-";
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 pr-4">{teamName}</td>
                    <td className="py-5 pr-4">{leader}</td>
                    <td className="py-5 pr-4">{timeLabel(t)}</td>
                    <td className="py-5 pr-4"><span className="inline-block px-4 py-1.5 rounded-full border border-[#3CB578] text-[#63CFA0] text-xs font-semibold">Verified</span></td>
                    <td className="py-5 pr-4"><span className="inline-block px-4 py-1.5 rounded-full border border-[#3CB578] text-[#63CFA0] text-xs font-semibold">Paid</span></td>
                    <td className="py-5"><button className="text-white/60 hover:text-white"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="flex items-center justify-between pt-5 text-xs text-white/50">
          <span>Showing {filtered.length} data out of {verifiedTeams.length}</span>
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
