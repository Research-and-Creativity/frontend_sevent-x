"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, ExternalLink, CheckCircle2, XCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export default function AdminDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userDocs, setUserDocs] = useState([
    { id: "doc-1", userName: "Alex Septiadi", type: "KTM", teamName: "Team Alpha", fileUrl: "KTM_Alex_UI.pdf", status: "REVIEW" },
    { id: "doc-2", userName: "Sarah Amanda", type: "KTP", teamName: "Team Alpha", fileUrl: "KTP_Sarah.pdf", status: "APPROVE" },
    { id: "doc-3", userName: "Budi Santoso", type: "TWIBBON", teamName: "Nexus Innovators", fileUrl: "Twibbon_Budi.png", status: "REVIEW" },
    { id: "doc-4", userName: "Citra Dewi", type: "SHARE_STORY", teamName: "CyberCrafters", fileUrl: "ShareStory_Citra.png", status: "REVIEW" },
  ]);

  const handleVerifyDoc = async (id: string, newStatus: "APPROVE" | "REJECT") => {
    try {
      await apiClient.patch(`/api/admin/user-documents/${id}`, { status: newStatus });
    } catch {
      // Fallback state
    }
    setUserDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    toast.success(`Dokumen ${newStatus === "APPROVE" ? "disetujui" : "ditolak"}!`);
  };

  const filteredDocs = userDocs.filter((d) =>
    d.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            User Documents Verification
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Verifikasi berkas administrasi peserta (KTM, KTP, Twibbon, Share Story).
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama, tim, jenis berkas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-white">Pending Documents Queue</h2>
          </div>
          <span className="text-xs font-mono text-text-secondary">{filteredDocs.length} Documents Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                <th className="pb-3 font-semibold">User & Team</th>
                <th className="pb-3 font-semibold">Doc Type</th>
                <th className="pb-3 font-semibold">Submitted File</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((d) => (
                <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-white text-sm">{d.userName}</p>
                    <span className="text-[10px] text-text-secondary font-mono">{d.teamName}</span>
                  </td>
                  <td className="py-4 pr-4 font-mono font-bold text-accent">{d.type}</td>
                  <td className="py-4 pr-4">
                    <a href="#" className="text-text-secondary hover:text-white inline-flex items-center gap-1 font-mono text-[11px]">
                      <span>{d.fileUrl}</span>
                      <ExternalLink className="w-3 h-3 text-accent" />
                    </a>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${d.status === "APPROVE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    <Button onClick={() => handleVerifyDoc(d.id, "APPROVE")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-3 rounded-lg cursor-pointer">
                      Approve
                    </Button>
                    <Button onClick={() => handleVerifyDoc(d.id, "REJECT")} variant="outline" className="bg-surface text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px] h-7 px-3 rounded-lg cursor-pointer">
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
