import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

const description =
  "Buat twibbon SEVENT X secara online. Unggah foto, atur posisi, lalu unduh dan bagikan dukunganmu untuk Software Engineering Event.";

export const metadata: Metadata = {
  description,
  alternates: {
    canonical: new URL("/twibbon", SITE_URL),
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SEVENT X",
    title: "SEVENT X",
    description,
    url: new URL("/twibbon", SITE_URL),
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
    description,
    images: ["/opengraph-image"],
  },
};

export default function TwibbonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
