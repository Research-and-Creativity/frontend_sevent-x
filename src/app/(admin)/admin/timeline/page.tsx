"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function AdminTimelinePage() {
  const [timelines] = useState([
    { id: "tl-1", stage: "Tahap 1: Pendaftaran & Verifikasi Pembayaran", date: "1 - 15 Oktober 2026", status: "COMPLETED", description: "Verifikasi akun peserta, dokumen KTM/KTP, serta bukti pembayaran awal." },
    { id: "tl-2", stage: "Tahap 2: Submission Berkas Karya & Video Demo", date: "16 - 25 Oktober 2026", status: "ACTIVE", description: "Pengumpulan berkas proposal PDF, repository source code, dan tautan video demo." },
    { id: "tl-3", stage: "Tahap 3: Penjurian & Evaluasi Dewan Juri", date: "26 - 28 Oktober 2026", status: "UPCOMING", description: "Proses penilaian transparan oleh dewan juri menggunakan 4 kriteria utama." },
    { id: "tl-4", stage: "Tahap 4: Pengumuman Juara & Awarding Night", date: "30 Oktober 2026", status: "UPCOMING", description: "Pengumuman resmi pemenang kompetisi nasional SEVENT X 2026." },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Competition Timeline Stages
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Pengaturan milestone tahapan pendaftaran, batas submission karya, serta masa penjurian.
        </p>
      </div>

      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Calendar className="w-5 h-5 text-accent" />
          <h2 className="font-display text-xl font-bold text-white">Milestone Tahapan Lomba</h2>
        </div>

        <div className="space-y-4">
          {timelines.map((tl) => (
            <div key={tl.id} className="bg-surface/50 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-white text-base">{tl.stage}</h3>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${tl.status === "ACTIVE" ? "bg-accent/20 text-accent border border-accent/30 animate-pulse" : tl.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-surface text-text-secondary border border-border"}`}>
                    {tl.status}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">{tl.description}</p>
              </div>

              <span className="font-mono text-xs font-bold text-white bg-card border border-white/10 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
                {tl.date}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
