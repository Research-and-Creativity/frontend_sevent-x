import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-4">
        <h1 className="font-display text-4xl font-bold text-white tracking-tight">
          404 - Halaman Tidak Ditemukan
        </h1>

        <p className="text-xs text-text-secondary leading-relaxed">
          Halaman yang Anda cari tidak tersedia atau alamat URL yang dimasukkan salah.
        </p>

        <div className="pt-2">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-6 h-10 rounded-xl cursor-pointer">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
