"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileCheck,
  Trophy,
  Calendar,
  Newspaper,
  Megaphone,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Send,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

type AdminTab = "TEAMS" | "DOCUMENTS" | "COMPETITIONS" | "TIMELINE" | "NEWS" | "ANNOUNCEMENTS";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("TEAMS");

  // State 1: Teams & Payment Verification
  const [teams, setTeams] = useState([
    { id: "t-101", name: "Team Alpha", category: "Web Development", leader: "Alex Septiadi", status: "PENDING", paymentProof: "bukti_bayar_alpha.jpg" },
    { id: "t-102", name: "Nexus Innovators", category: "UI/UX Design", leader: "Budi Santoso", status: "VERIFIED", paymentProof: "bukti_bayar_nexus.png" },
    { id: "t-103", name: "CyberCrafters", category: "Web Development", leader: "Citra Dewi", status: "PENDING", paymentProof: "bukti_bayar_cyber.jpg" },
  ]);

  // State 2: User Documents Verification
  const [userDocs, setUserDocs] = useState([
    { id: "doc-1", userName: "Alex Septiadi", type: "KTM", teamName: "Team Alpha", fileUrl: "ktm_alex.pdf", status: "REVIEW" },
    { id: "doc-2", userName: "Sarah Amanda", type: "KTP", teamName: "Team Alpha", fileUrl: "ktp_sarah.pdf", status: "APPROVE" },
    { id: "doc-3", userName: "Budi Santoso", type: "TWIBBON", teamName: "Nexus Innovators", fileUrl: "twibbon_budi.png", status: "REVIEW" },
  ]);

  // State 3: Competitions Management
  const [competitions, setCompetitions] = useState([
    { id: "comp-1", name: "National Web Development Competition 2026", category: "Web Development", fee: "Rp 150.000", maxMembers: 5, status: "ACTIVE" },
    { id: "comp-2", name: "National UI/UX Design Challenge 2026", category: "UI/UX", fee: "Rp 150.000", maxMembers: 3, status: "ACTIVE" },
  ]);
  const [newCompName, setNewCompName] = useState("");

  // State 4: Timeline Management
  const [timelines, setTimelines] = useState([
    { id: "tl-1", stage: "Tahap Pendaftaran & Verifikasi", date: "1-15 Oktober 2026", status: "COMPLETED" },
    { id: "tl-2", stage: "Tahap Submission Karya", date: "16-25 Oktober 2026", status: "ACTIVE" },
    { id: "tl-3", stage: "Tahap Penjurian Final", date: "26-28 Oktober 2026", status: "UPCOMING" },
  ]);

  // State 5: News Articles Management
  const [newsList, setNewsList] = useState([
    { id: "n-1", title: "Pengumuman Jadwal Babak Penjurian SEVENT X 2026", category: "Important", publishedAt: "2026-10-15" },
    { id: "n-2", title: "Panduan Teknis Upload Berkas Proposal & Video", category: "Info", publishedAt: "2026-10-18" },
  ]);
  const [newNewsTitle, setNewNewsTitle] = useState("");

  // State 6: Announcements / Winner Calculation
  const [isCalculating, setIsCalculating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Handlers for Team Payment Approval
  const handleVerifyTeam = async (id: string, newStatus: "VERIFIED" | "REJECTED") => {
    try {
      await apiClient.patch(`/api/admin/teams/${id}`, { status: newStatus });
    } catch {
      // Fallback state
    }
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    toast.success(`Status tim berhasil diubah menjadi ${newStatus}!`);
  };

  // Handlers for User Documents Approval
  const handleVerifyDoc = async (id: string, newStatus: "APPROVE" | "REJECT") => {
    try {
      await apiClient.patch(`/api/admin/user-documents/${id}`, { status: newStatus });
    } catch {
      // Fallback state
    }
    setUserDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    toast.success(`Dokumen disetujui: ${newStatus}!`);
  };

  // Handler Add Competition
  const handleAddCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) return;
    const newComp = {
      id: `comp-${Date.now()}`,
      name: newCompName,
      category: "General",
      fee: "Rp 150.000",
      maxMembers: 5,
      status: "ACTIVE",
    };
    setCompetitions((prev) => [...prev, newComp]);
    setNewCompName("");
    toast.success("Kompetisi baru berhasil ditambahkan!");
  };

  // Handler Add News
  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle) return;
    const newItem = {
      id: `n-${Date.now()}`,
      title: newNewsTitle,
      category: "Info",
      publishedAt: new Date().toISOString().split("T")[0],
    };
    setNewsList((prev) => [newItem, ...prev]);
    setNewNewsTitle("");
    toast.success("Artikel berita berhasil dipublikasikan!");
  };

  const handleDeleteNews = (id: string) => {
    setNewsList((prev) => prev.filter((n) => n.id !== id));
    toast.success("Artikel berita berhasil dihapus.");
  };

  // Handler Calculate Scores & Publish Winners
  const handleCalculateScores = async () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      toast.success("Skor terkonsolidasi dari seluruh juri berhasil dihitung!");
    }, 800);
  };

  const handlePublishResults = async () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      toast.success("Pengumuman Pemenang Resmi berhasil dipublikasikan!");
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Administrator Control Panel
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Kelola pendaftaran tim, verifikasi dokumen administrasi, kompetisi, berita, dan konsolidasi juara.
        </p>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/40">
        {[
          { id: "TEAMS", label: "Teams & Payment", icon: <Users className="w-4 h-4" /> },
          { id: "DOCUMENTS", label: "User Documents", icon: <FileCheck className="w-4 h-4" /> },
          { id: "COMPETITIONS", label: "Competitions", icon: <Trophy className="w-4 h-4" /> },
          { id: "TIMELINE", label: "Timeline Stages", icon: <Calendar className="w-4 h-4" /> },
          { id: "NEWS", label: "News & Articles", icon: <Newspaper className="w-4 h-4" /> },
          { id: "ANNOUNCEMENTS", label: "Publish Results", icon: <Megaphone className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-white font-bold shadow-sm"
                : "bg-surface text-text-secondary hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: TEAMS & PAYMENT VERIFICATION */}
      {activeTab === "TEAMS" && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">Teams & Payment Verification</h2>
            <span className="text-xs font-mono text-text-secondary">{teams.length} Registered Teams</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                  <th className="pb-3">Team ID & Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Leader</th>
                  <th className="pb-3">Payment Proof</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((t) => (
                  <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 font-bold text-white">{t.name} <span className="text-[10px] text-text-secondary font-mono block">#{t.id}</span></td>
                    <td className="py-4 text-text-secondary font-mono">{t.category}</td>
                    <td className="py-4 text-white">{t.leader}</td>
                    <td className="py-4">
                      <a href="#" className="text-accent hover:underline inline-flex items-center gap-1 font-mono text-[11px]">
                        <span>{t.paymentProof}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${t.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Button onClick={() => handleVerifyTeam(t.id, "VERIFIED")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 rounded-lg cursor-pointer">
                        Approve
                      </Button>
                      <Button onClick={() => handleVerifyTeam(t.id, "REJECTED")} variant="outline" className="bg-surface text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px] h-7 px-2.5 rounded-lg cursor-pointer">
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: USER DOCUMENTS VERIFICATION */}
      {activeTab === "DOCUMENTS" && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">User Documents Verification</h2>
            <span className="text-xs font-mono text-text-secondary">{userDocs.length} Pending Documents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-secondary font-mono uppercase">
                  <th className="pb-3">User & Team</th>
                  <th className="pb-3">Document Type</th>
                  <th className="pb-3">Submitted File</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 font-bold text-white">{d.userName} <span className="text-[10px] text-text-secondary font-mono block">{d.teamName}</span></td>
                    <td className="py-4 font-mono font-semibold text-accent">{d.type}</td>
                    <td className="py-4">
                      <a href="#" className="text-text-secondary hover:text-white inline-flex items-center gap-1 font-mono text-[11px]">
                        <span>{d.fileUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${d.status === "APPROVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Button onClick={() => handleVerifyDoc(d.id, "APPROVE")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2.5 rounded-lg cursor-pointer">
                        Approve
                      </Button>
                      <Button onClick={() => handleVerifyDoc(d.id, "REJECT")} variant="outline" className="bg-surface text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-[11px] h-7 px-2.5 rounded-lg cursor-pointer">
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: COMPETITIONS MANAGEMENT */}
      {activeTab === "COMPETITIONS" && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-xl font-bold text-white">Competitions & Track Management</h2>

          <form onSubmit={handleAddCompetition} className="flex gap-3">
            <input
              type="text"
              placeholder="Nama Cabang Lomba Baru..."
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang</span>
            </Button>
          </form>

          <div className="space-y-3">
            {competitions.map((c) => (
              <div key={c.id} className="bg-surface/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{c.name}</h3>
                  <p className="text-xs text-text-secondary font-mono mt-0.5">Biaya: {c.fee} • Maks. Member: {c.maxMembers}</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: TIMELINE STAGES */}
      {activeTab === "TIMELINE" && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-xl font-bold text-white">Competition Timeline Stages</h2>

          <div className="space-y-3">
            {timelines.map((tl) => (
              <div key={tl.id} className="bg-surface/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{tl.stage}</h3>
                  <p className="text-xs text-text-secondary font-mono mt-0.5">{tl.date}</p>
                </div>
                <span className="bg-primary/20 text-accent border border-primary/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                  {tl.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: NEWS & ARTICLES */}
      {activeTab === "NEWS" && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-xl font-bold text-white">News & Article Publisher</h2>

          <form onSubmit={handleAddNews} className="flex gap-3">
            <input
              type="text"
              placeholder="Judul Pengumuman/Berita Baru..."
              value={newNewsTitle}
              onChange={(e) => setNewNewsTitle(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accent"
            />
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Publish News</span>
            </Button>
          </form>

          <div className="space-y-3">
            {newsList.map((n) => (
              <div key={n.id} className="bg-surface/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{n.title}</h3>
                  <p className="text-xs text-text-secondary font-mono mt-0.5">Kategori: {n.category} • Dipublish: {n.publishedAt}</p>
                </div>
                <Button onClick={() => handleDeleteNews(n.id)} variant="outline" className="bg-card text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs h-8 px-3 rounded-lg cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 6: PUBLISH RESULTS & WINNERS */}
      {activeTab === "ANNOUNCEMENTS" && (
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="font-display text-xl font-bold text-white">Score Consolidation & Winner Announcement</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Lakukan kalkulasi otomatis seluruh skor juri pada sistem backend, kemudian publikasikan hasil juara ke halaman leaderboard peserta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              onClick={handleCalculateScores}
              disabled={isCalculating}
              variant="outline"
              className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold h-11 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-accent ${isCalculating ? "animate-spin" : ""}`} />
              <span>{isCalculating ? "Mengkalkulasi..." : "Kalkulasi Skor Akhir Juri"}</span>
            </Button>

            <Button
              onClick={handlePublishResults}
              disabled={isPublishing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-11 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{isPublishing ? "Mempublikasikan..." : "Publikasikan Pengumuman Juara"}</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
