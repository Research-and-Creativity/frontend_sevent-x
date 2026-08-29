"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileCheck,
  Trophy,
  Calendar,
  Newspaper,
  Megaphone,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAdminOverview } from "@/hooks/use-admin";

export default function AdminOverviewDashboardPage() {
  const { data: stats, isLoading } = useAdminOverview();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>System Administrator Control Center</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Welcome back, Admin Panel
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-3xl leading-relaxed">
          Ringkasan status pendaftaran tim, verifikasi berkas administrasi, jadwal kompetisi, serta publikasi berita resmi SEVENT X 2026.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tim */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs text-text-secondary uppercase">Total Tim</span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 bg-surface/60 rounded-lg" />
          ) : (
            <p className="font-display text-3xl font-bold text-white">
              {stats?.totalTeams !== undefined ? stats.totalTeams : "-"}
            </p>
          )}
          <p className="text-xs text-text-secondary">Jumlah tim terdaftar</p>
        </Card>

        {/* Card 2: Total Peserta */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs text-text-secondary uppercase">Total Peserta</span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 bg-surface/60 rounded-lg" />
          ) : (
            <p className="font-display text-3xl font-bold text-accent">
              {stats?.totalPeserta !== undefined ? stats.totalPeserta : "-"}
            </p>
          )}
          <p className="text-xs text-text-secondary">Akun peserta terdaftar</p>
        </Card>

        {/* Card 3: Perlu Ditinjau */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs text-text-secondary uppercase">Perlu Ditinjau</span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 bg-surface/60 rounded-lg" />
          ) : (
            <p className="font-display text-3xl font-bold text-amber-400">
              {stats?.pendingReview !== undefined ? stats.pendingReview : "-"}
            </p>
          )}
          <p className="text-xs text-text-secondary">Pembayaran & berkas pending</p>
        </Card>

        {/* Card 4: Cabang Kompetisi */}
        <Card className="bg-card/90 border border-white/10 rounded-2xl p-5 space-y-2">
          <span className="font-mono text-xs text-text-secondary uppercase">Cabang Kompetisi</span>
          {isLoading ? (
            <Skeleton className="h-9 w-16 bg-surface/60 rounded-lg" />
          ) : (
            <p className="font-display text-3xl font-bold text-white">
              {stats?.totalCompetitions !== undefined ? stats.totalCompetitions : "-"}
            </p>
          )}
          <p className="text-xs text-text-secondary">Kategori perlombaan aktif</p>
        </Card>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="space-y-4 pt-2">
        <h2 className="font-display text-xl font-bold text-white tracking-tight">
          Admin Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/teams">
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-3 group hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors">
                Teams & Payment Verification
              </h3>
              <p className="text-xs text-text-secondary">
                Verifikasi pembayaran dan status pendaftaran tim peserta.
              </p>
            </Card>
          </Link>

          <Link href="/admin/documents">
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-3 group hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors">
                User Documents Verification
              </h3>
              <p className="text-xs text-text-secondary">
                Review dan approve dokumen KTM, KTP, dan Twibbon peserta.
              </p>
            </Card>
          </Link>

          <Link href="/admin/competitions">
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-3 group hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors">
                Competitions & Tracks
              </h3>
              <p className="text-xs text-text-secondary">
                Tambah dan kelola cabang kompetisi serta kuota anggota.
              </p>
            </Card>
          </Link>

          <Link href="/admin/timeline">
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-3 group hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors">
                Timeline Stages
              </h3>
              <p className="text-xs text-text-secondary">
                Atur jadwal dan milestone tahapan pendaftaran & penjurian.
              </p>
            </Card>
          </Link>

          <Link href="/admin/news">
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-3 group hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center">
                  <Newspaper className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors">
                News & Article Publisher
              </h3>
              <p className="text-xs text-text-secondary">
                Rilis pengumuman resmi dan artikel panduan untuk peserta.
              </p>
            </Card>
          </Link>

          <Link href="/admin/results">
            <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 space-y-3 group hover:border-white/20 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-accent transition-colors">
                Publish Results & Winners
              </h3>
              <p className="text-xs text-text-secondary">
                Hitung akumulasi skor juri & umumkan pemenang resmi.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
