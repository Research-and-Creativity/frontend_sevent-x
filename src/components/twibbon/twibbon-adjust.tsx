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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-2">
          Langkah 2
        </p>
        <h2 className="font-display text-2xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
          Atur Posisi
        </h2>
      </div>

      <ul className="flex flex-col gap-4">
        {sliders.map(({ label, key, min, max, step }) => (
          <li key={key}>
            <div className="flex justify-between mb-2">
              <span className="text-xs tracking-wide text-white/50">{label}</span>
              <span className="font-mono text-xs text-white">{transform[key]}</span>
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
              className="w-full h-1 rounded-full appearance-none bg-white/10 accent-white cursor-pointer"
            />
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 mt-1">
        <label
          htmlFor="change-photo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white/60 text-xs hover:bg-white/5 transition-colors cursor-pointer"
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
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#7C83BC] font-semibold text-sm hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(180,190,255,0.6)] cursor-pointer"
        >
          Generate
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
