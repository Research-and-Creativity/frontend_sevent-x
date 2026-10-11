"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { User } from "@/types/api";
import { getErrorMessageWithDefault } from "@/lib/errors";

export default function AdminJudgesPage() {
  // 1. Fetch Competitions list (GET /api/competitions)
  const { data: competitions = [] } = useCompetitions();

  const activeComps = competitions;

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

  const activeSlug = selectedCompSlug || activeComps[0]?.slug || "";

  // 3. Fetch Assigned Judges (GET /api/admin/judges)
  const {
    data: remoteJudges = [],
    isLoading: isJudgesLoading,
  } = useAdminJudges();

  const assignJudgeMutation = useAssignJudge();
  const removeJudgeMutation = useRemoveJudge();

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

      toast.success(
        `User ${selectedUser.fullName} berhasil di-assign sebagai Juri untuk kompetisi ${compObj?.name || activeSlug}!`
      );
      setSelectedUser(null);
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal menugaskan juri"));
    }
  };

  // Handle Remove Judge
  const handleRemoveJudge = async (judgeId: string, judgeName: string) => {
    try {
      await removeJudgeMutation.mutateAsync(judgeId);
      toast.success(`Penugasan juri ${judgeName} berhasil dicabut.`);
    } catch (err: unknown) {
      toast.error(getErrorMessageWithDefault(err, "Gagal mencabut penugasan juri"));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 mb-6">
        <h1 className="font-display text-3xl font-bold">Judges</h1>
      </div>

      {/* Main Section: Form Assign Juri via Search User */}
      <div className="bg-[#15161A] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <ShieldCheck className="w-5 h-5 text-white/70" />
          <h2 className="font-display text-2xl font-bold">
            Assign Dewan Juri Baru
          </h2>
        </div>

        {/* STEP 1: Search User Box */}
        <div className="space-y-4">
          <label className="block text-sm text-white/70">
            Langkah 1: Cari User Terdaftar (Dosen / Evaluator / Peserta)
          </label>

          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
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
              className="w-full h-12 rounded-full border border-white/30 bg-transparent pl-12 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 transition-colors"
            />
            {isFetchingUsers && (
              <Loader2 className="w-4 h-4 text-white/40 animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
            )}

            {/* Dropdown Hasil Pencarian User */}
            {isDropdownOpen && debouncedSearch && (
              <div className="absolute z-50 mt-2 w-full bg-[#15161A] border border-white/15 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/10">
                {isSearchingUsers ? (
                  <div className="p-4 text-center text-sm text-white/40 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mencari user di database...</span>
                  </div>
                ) : searchUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-white/40">
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
                      className="w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#7FA7F5] font-bold text-xs shrink-0">
                          {u.fullName
                            ? u.fullName.substring(0, 2).toUpperCase()
                            : "US"}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-white">
                            {u.fullName || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-white/40 flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 text-white/60">
                          {u.role}
                        </span>
                        {u.institution && (
                          <span className="text-[11px] text-white/40 block mt-0.5 truncate max-w-40">
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
            className="p-5 bg-white/[0.03] border border-[#5B8DEF]/40 rounded-2xl space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5B8DEF]/10 border border-[#5B8DEF]/40 flex items-center justify-center text-[#7FA7F5]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block">
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
                className="text-sm text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ganti User</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* User Details Box */}
              <div className="sm:col-span-6 space-y-2 bg-black/20 p-4 rounded-2xl border border-white/5 text-sm">
                <div className="flex items-center gap-2 text-white/40">
                  <Mail className="w-3.5 h-3.5 text-[#7FA7F5]" />
                  <span className="text-white">{selectedUser.email}</span>
                </div>
                {selectedUser.institution && (
                  <div className="flex items-center gap-2 text-white/40">
                    <School className="w-3.5 h-3.5 text-[#7FA7F5]" />
                    <span>{selectedUser.institution}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/40">
                  <UserIcon className="w-3.5 h-3.5 text-[#7FA7F5]" />
                  <span className="uppercase text-[11px]">
                    Current Role: {selectedUser.role} • ID: #{selectedUser.id}
                  </span>
                </div>
              </div>

              {/* Competition Selector */}
              <div className="sm:col-span-6 space-y-1.5">
                <label className="block text-sm text-white/70">
                  Langkah 2: Pilih Cabang Kompetisi yang Dinilai
                </label>
                <select
                  value={activeSlug}
                  onChange={(e) => setSelectedCompSlug(e.target.value)}
                  className="w-full h-12 rounded-full border border-white/30 bg-transparent px-5 text-white focus:outline-none focus:border-white/60 cursor-pointer [&>option]:bg-[#15161A]"
                >
                  {activeComps.map((comp) => (
                    <option
                      key={comp.id || comp.slug}
                      value={comp.slug}
                    >
                      {comp.name} ({comp.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={assignJudgeMutation.isPending}
                className="flex items-center gap-2 bg-white text-[#5B6BBF] font-semibold text-sm px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-white/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {assignJudgeMutation.isPending
                    ? "Menugaskan Juri..."
                    : "Assign sebagai Juri"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-white/[0.03] border border-dashed border-white/15 rounded-2xl text-center text-sm text-white/40">
            Cari dan klik salah satu user di atas untuk melanjutkan penugasan
            sebagai juri.
          </div>
        )}

        {/* Assigned Judges List Table */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-white/70" />
              <h3 className="font-display font-bold text-base">
                Daftar Dewan Juri Terdaftar
              </h3>
            </div>
            <span className="text-xs text-white/40">
              {remoteJudges.length} Juri Ter-assign
            </span>
          </div>

          {isJudgesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 w-full rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : remoteJudges.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">
              Belum ada juri yang ditugaskan.
            </p>
          ) : (
            <div className="divide-y divide-white/10">
              {remoteJudges.map((j) => {
                // BE kadang mengirim field datar (tanpa relasi user/competition).
                const flat = j as AdminJudgeItem & {
                  fullName?: string;
                  email?: string;
                  competitionName?: string;
                };
                const judgeName =
                  j.user?.fullName ||
                  flat.fullName ||
                  j.user?.email ||
                  "Dewan Juri";
                const judgeEmail =
                  j.user?.email || flat.email || "evaluator@domain.com";
                const compTitle =
                  j.competition?.name ||
                  flat.competitionName ||
                  j.competitionSlug;

                return (
                  <div
                    key={j.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#7FA7F5] font-bold text-xs shrink-0">
                        {judgeName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-white text-sm">
                            {judgeName}
                          </h4>
                          <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-[#5B8DEF]/40 text-[#7FA7F5]">
                            {j.competitionSlug}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 flex flex-wrap items-center gap-2">
                          <span>{judgeEmail}</span>
                          <span>•</span>
                          <span className="text-white/70">
                            {compTitle}
                          </span>
                          {j.user?.institution && (
                            <>
                              <span>•</span>
                              <span className="text-white/40">
                                {j.user.institution}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="text-[11px] text-white/40">
                        {j.createdAt
                          ? `Assigned: ${j.createdAt.split("T")[0]}`
                          : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveJudge(j.id, judgeName)}
                        className="flex items-center gap-1 text-xs h-8 px-4 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}