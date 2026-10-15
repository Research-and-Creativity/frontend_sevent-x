"use client";

// Adaptasi dari freebbonize (github.com/GithubFarelAlghazali/freebbonize)

import { useState, useRef } from "react";
import Image from "next/image";
import TwibbonCanvas from "@/components/twibbon/twibbon-canvas";
import TwibbonUpload from "@/components/twibbon/twibbon-upload";
import TwibbonAdjust from "@/components/twibbon/twibbon-adjust";
import TwibbonDownload from "@/components/twibbon/twibbon-download";
import campaignData from "@/components/twibbon/campaign-data";
import type { TransformType, TwibbonStep } from "@/components/twibbon/types";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

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

  return (
    <div className="relative min-h-screen flex flex-col bg-[#05070D] text-text-primary overflow-hidden">
      {/* overflow-hidden, bukan overflow-x-hidden: satu sumbu non-visible membuat
          overflow-y jadi auto sehingga div ini jadi scroll container, dan gambar
          hiasan di <main> yang meluber ke bawah memicu scrollbar kedua. */}
      <Navbar />
      <main className="relative flex-1 flex flex-col items-center pt-32 pb-24 px-4 w-full">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#1E3A8A]/30 rounded-full blur-[140px] pointer-events-none" />
        <Image
          src="/assets/image/logo_putih.svg"
          alt=""
          width={1000}
          height={1262}
          className="absolute right-[-30%] top-[6%] w-[70vw] max-w-[1200px] h-auto opacity-[0.06] pointer-events-none"
        />

        <div className="relative text-center mb-14 max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
            Twibbon SEVENT-X
          </h1>
          <p className="text-white/50 text-sm md:text-base">
            Upload foto terbaikmu, atur posisinya, dan bagikan semangat kompetisi.
          </p>
        </div>

        <div className="relative w-full max-w-4xl border border-white/15 rounded-xl bg-white/[0.02] p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center">
            <div className="flex justify-center md:justify-end">
              <TwibbonCanvas
                isEditMode={step === "adjust"}
                transform={transform}
                setTransform={setTransform}
                userPhoto={userPhoto}
                frameSrc={campaignData.frameSrc}
                canvasRef={canvasRef}
              />
            </div>

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

        <p className="relative mt-12 text-white/20 text-xs text-center">
          Powered by{" "}
          <a
            href="https://github.com/GithubFarelAlghazali/freebbonize"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors underline"
          >
            freebbonize
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
}
