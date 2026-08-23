import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "SEVENT X - Tech Competition National 2026",
  description:
    "Wadah kompetisi teknologi nasional terbesar untuk inovator muda Indonesia. Tunjukkan karya terbaikmu di bidang Web Dev, UI/UX, CP, dan AI.",
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
          <LenisProvider>
            {children}
            <Toaster position="top-right" richColors />
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}