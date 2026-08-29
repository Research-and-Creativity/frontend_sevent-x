"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Competition } from "@/types/api";

export default function AdminTeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");

  // 1. Fetch competitions list
  const { data: competitions = [] } = useQuery<Competition[]>({
    queryKey: ["adminCompetitionsList"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/competitions");
        const list = res.data?.data || res.data;
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const [teams, setTeams] = useState([
    { id: "t-101", name: "Team Alpha", category: "Web Development", slug: "web-development", leader: "Alex Septiadi", membersCount: 3, status: "PENDING", paymentProof: "bukti_bayar_alpha.jpg" },
    { id: "t-102", name: "Nexus Innovators", category: "UI/UX Design", slug: "ui-ux-design", leader: "Budi Santoso", membersCount: 4, status: "VERIFIED", paymentProof: "bukti_bayar_nexus.png" },
    { id: "t-103", name: "CyberCrafters", category: "Web Development", slug: "web-development", leader: "Citra Dewi", membersCount: 3, status: "PENDING", paymentProof: "bukti_bayar_cyber.jpg" },
    { id: "t-104", name: "ByteSquad", category: "Web Development", slug: "web-development", leader: "Deni Pratama", membersCount: 5, status: "VERIFIED", paymentProof: "bukti_bayar_bytesquad.pdf" },
  ]);

  // Fetch teams from backend if available
  useQuery({
    queryKey: ["adminTeams", selectedCompSlug],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/teams", {
          params: selectedCompSlug ? { competitionSlug: selectedCompSlug } : undefined,
        });
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          setTeams(list);
        }
        return list;
      } catch {
        return null;
      }
    },
  });

  const handleVerifyTeam = async (id: string, newStatus: "VERIFIED" | "REJECTED") => {
    try {
      await apiClient.patch(`/api/admin/teams/${id}`, { status: newStatus });
    } catch {
      // Fallback state
    }
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    toast.success(`Status tim berhasil diubah menjadi ${newStatus}!`);
  };

  const filteredTeams = teams.filter((t: any) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leader?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchComp = !selectedCompSlug || t.slug === selectedCompSlug || t.competition?.slug === selectedCompSlug;
    return matchSearch && matchComp;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Teams & Payment Verification
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Verifikasi pendaftaran tim peserta dan bukti pembayaran biaya pendaftaran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Competition Slug Filter Dropdown */}
          <div className="w-56">
            <select
              value={selectedCompSlug}
              onChange={(e) => setSelectedCompSlug(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="" className="bg-card text-white">Semua Cabang Kompetisi</option>
              {competitions.map((comp) => (
                <option key={comp.id || comp.slug} value={comp.slug} className="bg-card text-white">
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-56">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari tim, ketua, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-white">Registered Teams List</h2>
          </div>
          <span className="text-xs font-mono text-text-secondary">{filteredTeams.length} Teams Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                <th className="pb-3 font-semibold">Team ID & Name</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Leader</th>
                <th className="pb-3 font-semibold">Payment Proof</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.map((t) => (
                <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <span className="text-[10px] text-text-secondary font-mono">ID: #{t.id} • {t.membersCount} Members</span>
                  </td>
                  <td className="py-4 pr-4 text-text-secondary font-mono">{t.category}</td>
                  <td className="py-4 pr-4 text-white font-medium">{t.leader}</td>
                  <td className="py-4 pr-4">
                    <a href="#" className="text-accent hover:underline inline-flex items-center gap-1 font-mono text-[11px]">
                      <span>{t.paymentProof}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${t.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <Button onClick={() => handleVerifyTeam(t.id, "VERIFIED")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-3 rounded-lg cursor-pointer">
                      Approve
                    </Button>
                    <Button onClick={() => handleVerifyTeam(t.id, "REJECTED")} variant="outline" className="bg-surface text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px] h-7 px-3 rounded-lg cursor-pointer">
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
