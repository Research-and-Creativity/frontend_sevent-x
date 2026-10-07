import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { WhatIsSeventSection } from "@/components/landing/what-is-sevent-section";
import { CompetitionsSection } from "@/components/landing/competitions-section";
import { TimelineSection } from "@/components/landing/timeline-section";
import { GallerySection } from "@/components/landing/gallery-section";
import { SponsorshipSection } from "@/components/landing/sponsorship-section";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { WelcomeOverlay } from "@/components/landing/welcome-overlay";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#05070D] text-text-primary overflow-x-hidden">
      <WelcomeOverlay />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <WhatIsSeventSection />
          <CompetitionsSection />
          <TimelineSection />
          <GallerySection />
          <div className="relative">
            <Image
              src="/assets/image/pattern-landing2.svg"
              alt=""
              width={1440}
              height={1712}
              className="absolute inset-x-0 top-0 w-full h-auto opacity-30 pattern-sway pointer-events-none"
            />
            <Image
              src="/assets/image/logo_putih.svg"
              alt=""
              width={1000}
              height={1262}
              className="absolute -left-32 top-[40%] w-[700px] h-auto opacity-[0.07] pointer-events-none"
            />
            <SponsorshipSection />
            <FaqSection />
            <CtaSection />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
