"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "REGISTRATION" | "SUBMISSION" | "JUDGING" | "GENERAL";
}

export default function PesertaFAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqList: FAQItem[] = [
    {
      id: "faq-1",
      category: "REGISTRATION",
      question: "Bagaimana alur pendaftaran SEVENT X 2026?",
      answer:
        "Peserta membuat akun individu terlebih dahulu, kemudian membuat tim baru atau bergabung ke tim yang sudah ada menggunakan Kode Invite. Selanjutnya, ketua tim wajib mengunggah bukti pembayaran dan dokumen administrasi anggota tim untuk diverifikasi oleh admin.",
    },
    {
      id: "faq-2",
      category: "REGISTRATION",
      question: "Berapa jumlah maksimal anggota dalam 1 tim?",
      answer:
        "Setiap tim terdiri dari 3 hingga 5 orang anggota dari perguruan tinggi yang sama atau berbeda (sesuai ketentuan cabang kompetisi Web Development dan UI/UX Design).",
    },
    {
      id: "faq-3",
      category: "REGISTRATION",
      question: "Apakah peserta diperbolehkan mendaftar lebih dari satu cabang kompetisi?",
      answer:
        "Setiap individu hanya diperbolehkan menjadi Ketua Tim pada 1 cabang kompetisi, namun dapat menjadi anggota pada maksimal 2 cabang kompetisi berbeda yang tidak bersamaan jadwalnya.",
    },
    {
      id: "faq-4",
      category: "SUBMISSION",
      question: "Kapan batas akhir pengumpulan karya (submission deadline)?",
      answer:
        "Pengumpulan karya tahap kualifikasi ditutup pada tanggal 20 Oktober 2026 pukul 23:59 WIB. Pengiriman karya setelah batas waktu tidak akan diproses oleh sistem.",
    },
    {
      id: "faq-5",
      category: "SUBMISSION",
      question: "Format berkas dan link apa saja yang wajib dilampirkan saat submit karya?",
      answer:
        "Peserta wajib melampirkan berkas proposal/pitch deck format PDF (maks. 20 MB), link repository source code (GitHub/GitLab), dan link video demo/presentasi (YouTube/Vimeo).",
    },
    {
      id: "faq-6",
      category: "JUDGING",
      question: "Bagaimana kriteria dan bobot penilaian oleh dewan juri?",
      answer:
        "Penilaian dilakukan berdasarkan 4 indikator utama: Inovasi & Kebaruan Ide (25%), Arsitektur Kode & Kualitas Teknis (30%), Desain UI/UX (25%), serta Dampak Solusi & Penyelesaian Masalah (20%).",
    },
    {
      id: "faq-7",
      category: "GENERAL",
      question: "Apakah ada biaya pendaftaran dan bagaimana konfirmasinya?",
      answer:
        "Biaya pendaftaran sebesar Rp 150.000 / tim. Pembayaran dilakukan via transfer bank atau e-wallet resmi panitia yang tertera pada halaman Tim, kemudian upload bukti pembayaran pada dashboard.",
    },
    {
      id: "faq-8",
      category: "GENERAL",
      question: "Siapa yang harus dihubungi jika terjadi kendala teknis pada platform?",
      answer:
        "Anda dapat menghubungi Helpdesk Sekretariat via WhatsApp di +62 812-3456-7890 atau mengirimkan email ke support@seventx.id yang aktif 24/7 selama periode kompetisi.",
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
          Frequently Asked Questions (FAQ)
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Temukan jawaban cepat seputar pendaftaran tim, ketentuan karya, hingga alur babak penjurian SEVENT X 2026.
        </p>
      </div>

      {/* Accordion List Card */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border/40">
          <HelpCircle className="w-5 h-5 text-accent" />
          <h2 className="font-display text-lg font-bold text-white tracking-tight">
            Panduan & Pertanyaan Populer
          </h2>
        </div>

        <div className="space-y-3">
          {faqList.map((item, idx) => {
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

      {/* Contact Support Banner */}
      <Card className="bg-card/90 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-white text-base">
            Masih memiliki pertanyaan lain?
          </h3>
          <p className="text-xs text-text-secondary">
            Tim panitia SEVENT X 2026 siap membantu menjawab pertanyaan Anda melalui saluran resmi.
          </p>
        </div>

        <Link href="/guidebook.pdf" target="_blank">
          <Button
            variant="outline"
            className="bg-surface hover:bg-card-hover border-border text-white text-xs font-semibold px-4 h-9 rounded-xl flex items-center gap-2 cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4 text-accent" />
            <span>Unduh Guidebook (PDF)</span>
          </Button>
        </Link>
      </Card>
    </div>
  );
}
