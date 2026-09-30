"use client";

// Twibbon page for SEVENT-X
// Canvas editor ported from freebbonize (github.com/GithubFarelAlghazali/freebbonize)
// Original author: Farel Alghazali
// Integrated & adapted for SEVENT-X by: seventx team

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
      <main className="flex-1 flex flex-col items-center pt-28 pb-12 px-4">
        {/* Page header */}
        <div className="text-center mb-10 max-w-xl">
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            <span className="text-white">Twibbon </span>
            <span className="text-[#00E5FF]">SEVENT-X</span>
          </h1>
          <p className="text-white/40 text-sm">
            Tunjukkan semangat kompetisimu! Upload foto, sesuaikan posisi, lalu download dan bagikan.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  i === stepIndex
                    ? "bg-[#00E5FF] text-[#0B0F19]"
                    : i < stepIndex
                    ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                    : "bg-white/5 text-white/30"
                }`}
              >
                <span className="font-mono">{i + 1}</span>
                <span>{STEP_LABELS[s]}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 h-px ${i < stepIndex ? "bg-[#00E5FF]/40" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main editor layout */}
        <div className="w-full max-w-3xl flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Canvas */}
          <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-auto">
            <TwibbonCanvas
              isEditMode={step === "adjust"}
              transform={transform}
              setTransform={setTransform}
              userPhoto={userPhoto}
              frameSrc={campaignData.frameSrc}
              canvasRef={canvasRef}
            />
          </div>

          {/* Sidebar panels */}
          <div className="flex-1 w-full lg:max-w-xs bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
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

        {/* Credit */}
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
