import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "SEVENT X",
  description:
    "SEVENT X adalah kompetisi Software Engineering nasional untuk siswa SMA/sederajat dan mahasiswa. Ikuti kategori Software Development atau UI/UX Design dengan tema SDGs.",
  applicationName: "SEVENT X",
  category: "education",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SEVENT X",
    title: "SEVENT X",
    description:
      "Kompetisi Software Engineering nasional untuk siswa SMA/sederajat dan mahasiswa. Kembangkan inovasi digital di kategori Software Development atau UI/UX Design.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SEVENT X — Software Engineering Event",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEVENT X",
    description:
      "Kompetisi Software Engineering nasional untuk siswa SMA/sederajat dan mahasiswa. Kembangkan inovasi digital di kategori Software Development atau UI/UX Design.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} dark`}
    >
      <body className="min-h-screen overflow-x-hidden bg-background text-text-primary antialiased selection:bg-accent selection:text-background font-sans">
        <QueryProvider>
          <SessionProvider>
            <LenisProvider>
              {children}
              <Toaster position="top-right" richColors />
            </LenisProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}