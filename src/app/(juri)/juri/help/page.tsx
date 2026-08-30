"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface JuriFAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function JuriFAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const juriFaqList: JuriFAQItem[] = [
    {
      id: "j-faq-1",
      question: "Bagaimana cara mengakses daftar submission yang di-assign kepada saya?",
      answer:
        "Anda dapat melihat daftar seluruh karya tim yang ditugaskan melalui menu 'Overview' atau 'Team' di sidebar kiri. Setiap card/baris karya menyajikan status penilaian ('Scored' atau 'Pending') dan tombol untuk masuk ke Evaluation Console.",
    },
    {
      id: "j-faq-2",
      question: "Apa perbedaan antara tombol 'Save Draft' dan 'Submit Score'?",
      answer:
        "Tombol 'Save Draft' menyimpan skor sementara dan catatan komentar di perangkat lokal Anda sehingga Anda dapat kembali melanjutkan penilaian nanti. Sedangkan tombol 'Submit Score' akan mengirimkan nilai secara permanen ke sistem backend panitia.",
    },
    {
      id: "j-faq-3",
      question: "Apakah skor yang sudah di-submit masih bisa diubah kembali?",
      answer:
        "Sesuai ketentuan penjurian transparan, skor yang sudah di-submit bersifat permanen dan form akan dikunci secara otomatis. Jika terdapat kesalahan input nilai yang sangat mendesak, silakan hubungi Administrator Sistem untuk pembukaan kunci revisi.",
    },
    {
      id: "j-faq-4",
      question: "Bagaimana cara menghitung Total Score terkonsolidasi pada karya?",
      answer:
        "Sistem Evaluation Console menghitung Total Score secara live real-time dari rata-rata matematis 4 indikator kriteria (Innovation, Technical Complexity, Feasibility, dan Design/UX). Setiap perubahan nilai kriteria (+5/-5 atau slider) langsung memperbarui skor total.",
    },
    {
      id: "j-faq-5",
      question: "Kapan batas akhir (deadline) pemberian penilaian untuk tahap ini?",
      answer:
        "Batas akhir penjurian Babak 1 (Round 1 Scoring) adalah tanggal 25 Oktober 2026 pukul 23:59 WIB. Pastikan seluruh karya bermerek 'Pending' di-evaluasi sebelum tenggat waktu tersebut.",
    },
    {
      id: "j-faq-6",
      question: "Apa yang harus dilakukan jika ditemukan berkas karya atau link repository yang rusak/broken?",
      answer:
        "Apabila berkas proposal PDF atau tautan repository GitHub tidak dapat diakses, Anda dapat mencantumkan catatan pada kotak 'Evaluation Comments' dan memberikan nilai sesuai kelengkapan berkas yang dapat dibuka, kemudian laporkan ID Tim ke admin.",
    },
    {
      id: "j-faq-7",
      question: "Siapa yang harus dihubungi jika terjadi kendala pada sistem scoring console?",
      answer:
        "Tim teknis panitia siap membantu melalui WhatsApp Panitia Juri di +62 812-9876-5432 atau email juri@seventx.id.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-border/40">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Jury Platform FAQ & Guidelines
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Panduan teknis alur penilaian, aturan penguncian skor, serta bantuan dewan juri SEVENT X 2026.
        </p>
      </div>

      {/* Accordion Card */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <HelpCircle className="w-5 h-5 text-accent" />
          <h2 className="font-display text-lg font-bold text-white tracking-tight">
            Pertanyaan Populer seputar Penjurian
          </h2>
        </div>

        <div className="space-y-3">
          {juriFaqList.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.id}
                className="bg-surface/50 border border-white/10 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/80 transition-colors"
                >
                  <span className="font-display font-bold text-white text-sm sm:text-base pr-2">
                    {item.question}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-card border border-white/10 flex items-center justify-center text-text-secondary shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-text-secondary leading-relaxed border-t border-white/5 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Rubric PDF Banner */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-white text-base">
            Rubrik & Bobot Penilaian Resmi
          </h3>
          <p className="text-xs text-text-secondary">
            Unduh dokumen rubrik resmi untuk pedoman pemberian poin pada setiap kriteria.
          </p>
        </div>

        {process.env.NEXT_PUBLIC_GUIDEBOOK_URL ? (
          <Link
            href={process.env.NEXT_PUBLIC_GUIDEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-2 cursor-pointer shrink-0"
            >
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Unduh Rubrik Juri (PDF)</span>
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            disabled
            title="Rubrik belum tersedia"
            className="bg-surface border-border/40 text-text-secondary text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-2 cursor-not-allowed opacity-50 shrink-0"
          >
            <BookOpen className="w-4 h-4 text-text-secondary" />
            <span>Rubrik Belum Tersedia</span>
          </Button>
        )}
      </Card>
    </div>
  );
}
