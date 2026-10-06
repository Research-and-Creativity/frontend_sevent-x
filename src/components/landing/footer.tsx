import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-4">
            <Image
              src="/assets/image/logo_putih.svg"
              alt="SEVENT X"
              width={34}
              height={44}
              className="w-8 h-auto"
            />
            <span className="font-display text-2xl font-extrabold text-white">
              SEVENT X
            </span>
          </Link>
          <p className="text-xs text-white/50 leading-relaxed">
            Himpunan Mahasiswa Software Engineering
            <br />
            Telkom University Purwokerto
            <br />
            Jl. D.I Pandjaitan, Banyumas, Jawa Tengah 53147
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm text-white/50">
            <li>
              <Link href="#hero" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="#about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="#competitions" className="hover:text-white">
                Competition
              </Link>
            </li>
            <li>
              <Link href="#timeline" className="hover:text-white">
                Timeline
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-2">Contact Us</h4>
          <ul className="space-y-1 text-sm text-white/50">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> (+62) 888 8888 8888
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> (+62) 888 8888 8888
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold text-white mb-2">Presented By</h4>
          <div className="flex items-center gap-3">
            {[
              "telkomUniversity.png",
              "softwareEngineering.png",
              "hima.png",
              "zenith.png",
            ].map((logo) => (
              <span
                key={logo}
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden"
              >
                <Image
                  src={`/assets/logo/${logo}`}
                  alt={logo}
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
