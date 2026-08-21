import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "../../globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Toaster } from "@/components/ui/sonner";
import NavbarDashboard from "@/components/dashboard/navbar";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Dashboard Peserta - SEVENT X",
  description:
    "Wadah kompetisi teknologi nasional terbesar untuk inovator muda Indonesia. Tunjukkan karya terbaikmu di bidang Web Dev, UI/UX, CP, dan AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} dark`}>
      <body className="min-h-screen overflow-x-hidden bg-background text-text-primary antialiased selection:bg-accent selection:text-background font-sans">
        <QueryProvider>
          <LenisProvider>
            <NavbarDashboard role="peserta">{children}</NavbarDashboard>
            <Toaster position="top-right" richColors />
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
