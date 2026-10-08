import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#05070D] p-6">
      {/* Pola background yang sama dengan halaman dashboard peserta/juri/admin */}
      <Image
        src="/assets/image/pattern-landing2.svg"
        alt=""
        width={1440}
        height={1712}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.12]"
        priority
      />

      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* Logo */}
        <div className="relative h-10 w-auto">
          <Image
            src="/assets/image/logo-putih.png"
            alt="SEVENT X"
            width={1000}
            height={1262}
            className="h-full w-auto object-contain drop-shadow-[0_0_24px_rgba(125,140,255,0.45)]"
            priority
          />
        </div>

        {/* Glass card */}
        <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.025] px-8 py-10 backdrop-blur-xl">
          <p className="font-display text-6xl font-extrabold tracking-tight text-white">
            404
          </p>

          <h1 className="mt-3 font-display text-xl font-bold tracking-tight text-white">
            Halaman Tidak Ditemukan
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Halaman yang Anda cari tidak tersedia atau alamat URL yang dimasukkan
            salah.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-[#1B235E] shadow-[0_0_30px_rgba(46,92,255,0.35)] transition-colors hover:bg-white/90"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
