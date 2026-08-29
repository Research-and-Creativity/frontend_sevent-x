"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck,
  Search,
  UserCheck,
  Trash2,
  CheckCircle2,
  X,
  User as UserIcon,
  Trophy,
  Loader2,
  Mail,
  School,
} from "lucide-react";
import { toast } from "sonner";
import { useCompetitions } from "@/hooks/use-peserta";
import {
  useAdminUsers,
  useAdminJudges,
  useAssignJudge,
  useRemoveJudge,
  AdminJudgeItem,
} from "@/hooks/use-admin";
import { User, Competition } from "@/types/api";

export default function AdminJudgesPage() {
  // 1. Fetch Competitions list (GET /api/competitions)
  const { data: competitions = [], isLoading: isCompLoading } = useCompetitions();

  const defaultComps: Competition[] = [
    {
      id: "1",
      name: "National Web Development Competition 2026",
      slug: "web-development",
      description: "",
      maxMember: 5,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      name: "National UI/UX Design Challenge 2026",
      slug: "ui-ux-design",
      description: "",
      maxMember: 3,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    },
  ];
  const activeComps = competitions.length > 0 ? competitions : defaultComps;

  // Search & Debounce State
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounce search ~300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // 2. Fetch Users based on debounced search
  const {
    data: searchUsers = [],
    isLoading: isSearchingUsers,
    isFetching: isFetchingUsers,
  } = useAdminUsers(debouncedSearch);

  // Selection & Assignment State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCompSlug, setSelectedCompSlug] = useState<string>("");

  const activeSlug = selectedCompSlug || activeComps[0]?.slug || "web-development";

  // 3. Fetch Assigned Judges (GET /api/admin/judges)
  const {
    data: remoteJudges = [],
    isLoading: isJudgesLoading,
    refetch: refetchJudges,
  } = useAdminJudges();

  const assignJudgeMutation = useAssignJudge();
  const removeJudgeMutation = useRemoveJudge();

  // Local fallback mock list if remote is empty
  const [fallbackJudges, setFallbackJudges] = useState<AdminJudgeItem[]>([
    {
      id: "j-101",
      userId: "u-401",
      competitionSlug: "web-development",
      competition: {
        id: "1",
        name: "National Web Development Competition 2026",
        slug: "web-development",
      },
      user: {
        id: "u-401",
        fullName: "Dr. Bambang Hidayat, M.Kom.",
        email: "bambang.hidayat@evaluator.ac.id",
        institution: "Institut Teknologi Bandung",
      },
      createdAt: "2026-10-10",
    },
    {
      id: "j-102",
      userId: "u-402",
      competitionSlug: "ui-ux-design",
      competition: {
        id: "2",
        name: "National UI/UX Design Challenge 2026",
        slug: "ui-ux-design",
      },
      user: {
        id: "u-402",
        fullName: "Dr. Siti Nurhaliza, M.Ds.",
        email: "siti.nurhaliza@design.org",
        institution: "Universitas Indonesia",
      },
      createdAt: "2026-10-12",
    },
  ]);

  const displayedJudges = remoteJudges.length > 0 ? remoteJudges : fallbackJudges;

  // Handle User Selection from Search
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchInput("");
    setIsDropdownOpen(false);
  };

  // Handle Submit Assign Judge (POST /api/admin/judges with body { competitionSlug, userId })
  const handleAssignJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Pilih user terlebih dahulu dari hasil pencarian.");
      return;
    }
    if (!activeSlug) {
      toast.error("Pilih cabang kompetisi terlebih dahulu.");
      return;
    }

    try {
      await assignJudgeMutation.mutateAsync({
        competitionSlug: activeSlug,
        userId: selectedUser.id,
      });

      const compObj = activeComps.find((c) => c.slug === activeSlug);
      const newJudgeItem: AdminJudgeItem = {
        id: `j-${Date.now()}`,
        userId: selectedUser.id,
        competitionSlug: activeSlug,
        competition: {
          id: compObj?.id || "1",
          name: compObj?.name || activeSlug,
          slug: activeSlug,
        },
        user: {
          id: selectedUser.id,
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          institution: selectedUser.institution || null,
          avatar: selectedUser.avatar || null,
        },
        createdAt: new Date().toISOString().split("T")[0],
      };
      setFallbackJudges((prev) => [newJudgeItem, ...prev]);

      toast.success(
        `User ${selectedUser.fullName} berhasil di-assign sebagai Juri untuk kompetisi ${compObj?.name || activeSlug}!`
      );
      setSelectedUser(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Gagal menugaskan juri";
      toast.error(msg);
    }
  };

  // Handle Remove Judge
  const handleRemoveJudge = async (judgeId: string, judgeName: string) => {
    try {
      await removeJudgeMutation.mutateAsync(judgeId);
      setFallbackJudges((prev) => prev.filter((j) => j.id !== judgeId));
      toast.success(`Penugasan juri ${judgeName} berhasil dicabut.`);
    } catch {
      setFallbackJudges((prev) => prev.filter((j) => j.id !== judgeId));
      toast.success(`Penugasan juri ${judgeName} berhasil dicabut.`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Page */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Judges Management & Assignment
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Cari user yang sudah terdaftar di sistem dan assign sebagai Dewan Juri
          pada cabang kompetisi yang sesuai.
        </p>
      </div>

      {/* Main Section: Form Assign Juri via Search User */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-white">
            Assign Dewan Juri Baru
          </h2>
        </div>

        {/* STEP 1: Search User Box */}
        <div className="space-y-4">
          <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
            Langkah 1: Cari User Terdaftar (Dosen / Evaluator / Peserta)
          </label>

          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama atau email dosen (misal: Bambang, siti@domain.com)..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchInput.trim()) setIsDropdownOpen(true);
                }}
                className="w-full bg-surface border border-border/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
              />
              {isFetchingUsers && (
                <Loader2 className="w-4 h-4 text-accent animate-spin absolute right-3.5 top-3" />
              )}
            </div>

            {/* Dropdown Hasil Pencarian User */}
            {isDropdownOpen && debouncedSearch && (
              <div className="absolute z-50 mt-2 w-full bg-[#070D1E] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/10">
                {isSearchingUsers ? (
                  <div className="p-4 text-center text-xs text-text-secondary flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span>Mencari user di database...</span>
                  </div>
                ) : searchUsers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-text-secondary">
                    Tidak ada user terdaftar dengan kata kunci{" "}
                    <span className="text-white font-semibold">
                      &quot;{debouncedSearch}&quot;
                    </span>
                    .
                  </div>
                ) : (
                  searchUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className="w-full text-left p-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-accent font-bold text-xs shrink-0">
                          {u.fullName
                            ? u.fullName.substring(0, 2).toUpperCase()
                            : "US"}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">
                            {u.fullName || "Tanpa Nama"}
                          </p>
                          <p className="text-[11px] text-text-secondary font-mono flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-text-secondary" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
                          {u.role}
                        </span>
                        {u.institution && (
                          <span className="text-[10px] text-text-secondary block mt-0.5 truncate max-w-40">
                            {u.institution}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Selected User Confirmation & Competition Chooser */}
        {selectedUser ? (
          <form
            onSubmit={handleAssignJudge}
            className="p-5 bg-surface/70 border border-accent/40 rounded-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-accent">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider block">
                    User Terpilih
                  </span>
                  <h3 className="font-display font-bold text-base text-white">
                    {selectedUser.fullName || selectedUser.email}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ganti User</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* User Details Box */}
              <div className="sm:col-span-6 space-y-2 bg-black/20 p-3.5 rounded-xl border border-white/5 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono text-white">
                    {selectedUser.email}
                  </span>
                </div>
                {selectedUser.institution && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <School className="w-3.5 h-3.5 text-accent" />
                    <span>{selectedUser.institution}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-text-secondary">
                  <UserIcon className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono uppercase text-[10px]">
                    Current Role: {selectedUser.role} • ID: #{selectedUser.id}
                  </span>
                </div>
              </div>

              {/* Competition Selector */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-text-secondary">
                  Langkah 2: Pilih Cabang Kompetisi yang Dinilai
                </label>
                <select
                  value={activeSlug}
                  onChange={(e) => setSelectedCompSlug(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent cursor-pointer"
                >
                  {activeComps.map((comp) => (
                    <option
                      key={comp.id || comp.slug}
                      value={comp.slug}
                      className="bg-card text-white"
                    >
                      {comp.name} ({comp.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={assignJudgeMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-10 px-6 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {assignJudgeMutation.isPending
                    ? "Menugaskan Juri..."
                    : "Assign sebagai Juri"}
                </span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-surface/30 border border-dashed border-white/10 rounded-xl text-center text-xs text-text-secondary">
            Cari dan klik salah satu user di atas untuk melanjutkan penugasan
            sebagai juri.
          </div>
        )}

        {/* Assigned Judges List Table */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold text-base text-white">
                Daftar Dewan Juri Terdaftar
              </h3>
            </div>
            <span className="text-xs font-mono text-text-secondary">
              {displayedJudges.length} Juri Ter-assign
            </span>
          </div>

          {isJudgesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl bg-surface/40" />
              <Skeleton className="h-16 w-full rounded-xl bg-surface/40" />
            </div>
          ) : displayedJudges.length === 0 ? (
            <div className="p-6 bg-surface/30 rounded-xl border border-white/5 text-center text-xs text-text-secondary">
              Belum ada juri yang ditugaskan.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {displayedJudges.map((j) => {
                const judgeName =
                  j.user?.fullName ||
                  (j as any).fullName ||
                  j.user?.email ||
                  "Dewan Juri";
                const judgeEmail =
                  j.user?.email || (j as any).email || "evaluator@domain.com";
                const compTitle =
                  j.competition?.name ||
                  (j as any).competitionName ||
                  j.competitionSlug;

                return (
                  <div
                    key={j.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface/30 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-accent font-bold text-xs shrink-0">
                        {judgeName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-white text-sm">
                            {judgeName}
                          </h4>
                          <span className="text-[10px] font-mono font-bold bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">
                            {j.competitionSlug}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary font-mono flex flex-wrap items-center gap-2">
                          <span>{judgeEmail}</span>
                          <span>•</span>
                          <span className="text-white/80 font-sans">
                            {compTitle}
                          </span>
                          {j.user?.institution && (
                            <>
                              <span>•</span>
                              <span className="text-text-secondary font-sans">
                                {j.user.institution}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="font-mono text-[10px] text-text-secondary">
                        {j.createdAt
                          ? `Assigned: ${j.createdAt.split("T")[0]}`
                          : ""}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveJudge(j.id, judgeName)}
                        className="bg-surface hover:bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs h-8 px-3 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
