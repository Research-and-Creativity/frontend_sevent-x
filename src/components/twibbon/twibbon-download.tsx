"use client";

import { useState } from "react";
import { Download, Clipboard, ClipboardCheck, RotateCcw } from "lucide-react";
import campaignData from "./campaign-data";
import type { CaptionValues } from "./types";

const { caption, props: captionProps } = campaignData;

function fillCaption(template: string, values: CaptionValues) {
  return template.replace(/\[(\w+)\]/g, (_, key) => values[key]?.trim() || `[${key}]`);
}

type DownloadProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onReset: () => void;
};

export default function TwibbonDownload({ canvasRef, onReset }: DownloadProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [captionValues, setCaptionValues] = useState<CaptionValues>(() =>
    Object.fromEntries(captionProps.map((key) => [key, ""])),
  );
  const [isCopied, setIsCopied] = useState(false);

  const filledCaption = fillCaption(caption, captionValues);

  function handleDownload() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "twibbon-seventx.png";
    link.click();
  }

  function handleCopy() {
    navigator.clipboard.writeText(filledCaption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  }

  const fieldLabels: Record<string, string> = {
    nama: "Nama lengkap",
    institusi: "Institusi / Kampus",
    // fallback for unmapped keys
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="mb-2">
        <h2 className="font-display text-3xl font-bold text-white">
          Download &amp; <span className="text-[#00E5FF]">Share</span>
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {captionProps.map((key) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs text-white/40">
              {fieldLabels[key] ?? key}
            </label>
            <input
              type="text"
              value={captionValues[key]}
              onChange={(e) =>
                setCaptionValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={fieldLabels[key] ?? key}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00E5FF]/50 transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="relative rounded-lg bg-white/5 border border-white/10 p-3">
        <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line pr-8">
          {filledCaption}
        </p>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 text-white/30 hover:text-[#00E5FF] transition-colors"
          aria-label="Salin caption"
        >
          {isCopied ? (
            <ClipboardCheck className="w-4 h-4 text-[#00E5FF]" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ulang
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00E5FF] text-[#0B0F19] font-bold text-sm hover:bg-[#00E5FF]/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
}
