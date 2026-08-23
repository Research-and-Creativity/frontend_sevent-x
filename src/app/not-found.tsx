import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05070D] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 text-accent flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-accent tracking-widest uppercase">
            ERROR 404
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau alamat URL yang dimasukkan salah.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-6 h-10 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-md">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
