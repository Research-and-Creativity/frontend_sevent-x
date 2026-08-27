import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { CompetitionsSection } from "@/components/landing/competitions-section";
import { TimelineSection } from "@/components/landing/timeline-section";
import { AppraisersSection } from "@/components/landing/appraisers-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-b from-[#1B235E] via-[#10163A] to-[#05070D] text-text-primary">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CompetitionsSection />
        <TimelineSection />
        <AppraisersSection />
      </main>
      <Footer />
    </div>
  );
}