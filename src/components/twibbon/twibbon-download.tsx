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
  const [captionValues, setCaptionValues] = useState<CaptionValues>(() =>
    Object.fromEntries(captionProps.map((key) => [key, ""])),
  );
  const [isCopied, setIsCopied] = useState(false);

  const filledCaption = fillCaption(caption, captionValues);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ekspor ke JPEG (bukan PNG) agar ukuran file jauh lebih kecil
    // (PNG 4x menghasilkan ±10 MB, melebihi limit unggah dokumen 5 MB).
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "twibbon-seventx.jpg";
      link.click();
      // Revoke setelah unduhan mulai; kalau langsung, sebagian browser
      // membatalkan unduhannya.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/jpeg", 0.9);
  }

  function handleCopy() {
    navigator.clipboard.writeText(filledCaption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  }

  const fieldLabels: Record<string, string> = {
    nama: "Nama lengkap",
    institusi: "Institusi / Kampus",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-2">
          Langkah 3
        </p>
        <h2 className="font-display text-2xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
          Selesai!
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {captionProps.map((key) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs text-white/50">
              {fieldLabels[key] ?? key}
            </label>
            <input
              type="text"
              value={captionValues[key]}
              onChange={(e) =>
                setCaptionValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={fieldLabels[key] ?? key}
              className="w-full px-5 py-2.5 rounded-full bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="relative rounded-xl bg-white/5 border border-white/20 p-4">
        <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line pr-8">
          {filledCaption}
        </p>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors cursor-pointer"
          aria-label="Salin caption"
        >
          {isCopied ? (
            <ClipboardCheck className="w-4 h-4 text-white" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/20 text-white/60 text-xs hover:bg-white/5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Ulang
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#7C83BC] font-semibold text-sm hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(180,190,255,0.6)] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download PNG
        </button>
      </div>
    </div>
  );
}
