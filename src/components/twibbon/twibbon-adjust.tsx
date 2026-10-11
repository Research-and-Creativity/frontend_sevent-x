"use client";

import { Camera, ArrowRight } from "lucide-react";
import type { TransformType } from "./types";

type AdjustProps = {
  transform: TransformType;
  setTransform: React.Dispatch<React.SetStateAction<TransformType>>;
  onPhotoSelected: (img: HTMLImageElement) => void;
  onGenerate: () => void;
};

export default function TwibbonAdjust({
  transform,
  setTransform,
  onPhotoSelected,
  onGenerate,
}: AdjustProps) {
  function handleChangePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => onPhotoSelected(img);
    img.src = URL.createObjectURL(file);
  }

  const sliders: { label: string; key: keyof TransformType; min: number; max: number; step: number }[] = [
    { label: "Ukuran", key: "scale", min: 10, max: 200, step: 1 },
    { label: "Rotasi", key: "rotate", min: -180, max: 180, step: 1 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="mb-4">
        <div className="text-[#00E5FF] font-mono text-xs tracking-wider mb-2 uppercase">Langkah 2</div>
        <h2 className="text-2xl font-bold text-white">
          Atur Posisi
        </h2>
      </div>

      <ul className="flex flex-col gap-3">
        {sliders.map(({ label, key, min, max, step }) => (
          <li key={key}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/50">{label}</span>
              <span className="text-xs text-[#00E5FF] font-mono">{transform[key]}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={transform[key]}
              onChange={(e) =>
                setTransform((prev) => ({ ...prev, [key]: Number(e.target.value) }))
              }
              className="w-full h-1 rounded-full appearance-none bg-white/10 accent-[#00E5FF] cursor-pointer"
            />
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-1">
        <label
          htmlFor="change-photo"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/60 text-xs cursor-pointer transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Ganti Foto
          <input
            id="change-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChangePhoto}
          />
        </label>

        <button
          onClick={onGenerate}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#00E5FF] text-[#0B0F19] font-bold text-sm hover:bg-[#00E5FF]/90 transition-colors"
        >
          Generate
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
