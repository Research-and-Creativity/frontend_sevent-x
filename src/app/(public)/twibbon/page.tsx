"use client";

// Adapted from github.com/GithubFarelAlghazali/freebbonize

import { useState, useRef } from "react";
import TwibbonCanvas from "@/components/twibbon/twibbon-canvas";
import TwibbonUpload from "@/components/twibbon/twibbon-upload";
import TwibbonAdjust from "@/components/twibbon/twibbon-adjust";
import TwibbonDownload from "@/components/twibbon/twibbon-download";
import campaignData from "@/components/twibbon/campaign-data";
import type { TransformType, TwibbonStep } from "@/components/twibbon/types";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const STEP_LABELS: Record<TwibbonStep, string> = {
  upload: "Upload",
  adjust: "Sesuaikan",
  download: "Download",
};
const STEPS: TwibbonStep[] = ["upload", "adjust", "download"];

export default function TwibbonPage() {
  const [step, setStep] = useState<TwibbonStep>("upload");
  const [userPhoto, setUserPhoto] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<TransformType>({
    x: 0,
    y: 0,
    scale: 100,
    rotate: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handlePhotoSelected(img: HTMLImageElement) {
    setUserPhoto(img);
    setStep("adjust");
  }

  function handleReset() {
    setUserPhoto(null);
    setTransform({ x: 0, y: 0, scale: 100, rotate: 0 });
    setStep("upload");
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-b from-[#1B235E] via-[#10163A] to-[#05070D] text-text-primary">
      <Navbar />
      <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-4 w-full">
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Twibbon SEVENT-X
          </h1>
          <p className="text-white/50 text-sm md:text-base font-light">
            Upload foto terbaikmu, atur posisinya, dan bagikan semangat kompetisi.
          </p>
        </div>

        {/* Unified Glass Card Layout */}
        <div className="w-full max-w-4xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl shadow-black/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            {/* Left: Canvas Area */}
            <div className="flex justify-center md:justify-end">
              <div className="relative bg-[#05070D] rounded-xl overflow-hidden ring-1 ring-white/10">
                <TwibbonCanvas
                  isEditMode={step === "adjust"}
                  transform={transform}
                  setTransform={setTransform}
                  userPhoto={userPhoto}
                  frameSrc={campaignData.frameSrc}
                  canvasRef={canvasRef}
                />
              </div>
            </div>

            {/* Right: Interactive Panel */}
            <div className="flex flex-col justify-center">
              {step === "upload" && (
                <TwibbonUpload onPhotoSelected={handlePhotoSelected} />
              )}
              {step === "adjust" && (
                <TwibbonAdjust
                  transform={transform}
                  setTransform={setTransform}
                  onPhotoSelected={handlePhotoSelected}
                  onGenerate={() => setStep("download")}
                />
              )}
              {step === "download" && (
                <TwibbonDownload canvasRef={canvasRef} onReset={handleReset} />
              )}
            </div>
            
          </div>
        </div>

        <p className="mt-12 text-white/20 text-xs text-center">
          Powered by{" "}
          <a
            href="https://github.com/GithubFarelAlghazali/freebbonize"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00E5FF]/40 hover:text-[#00E5FF] transition-colors underline"
          >
            freebbonize
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
