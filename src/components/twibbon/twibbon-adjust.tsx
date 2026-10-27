"use client";

import { useState } from "react";
import { Camera, ArrowRight } from "lucide-react";
import type { TransformType } from "./types";

type AdjustProps = {
  transform: TransformType;
  setTransform: React.Dispatch<React.SetStateAction<TransformType>>;
  onPhotoSelected: (img: HTMLImageElement) => void;
  onGenerate: () => void;
};

// Nilai di kanan label bisa diketik, bukan cuma dibaca. Draft lokal dipakai
// supaya React tidak menimpa "-" yang baru diketik dengan nilai lama sebelum
// angkanya valid (kalau langsung Number(raw), nilai negatif tak bisa diisi).
function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  function handleChange(raw: string) {
    setDraft(raw);
    const next = Number(raw);
    if (raw.trim() === "" || Number.isNaN(next)) return;
    onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next)));
  }

  return (
    <input
      type="number"
      step={1}
      aria-label={label}
      value={draft ?? String(Math.round(value))}
      onFocus={() => setDraft(String(Math.round(value)))}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => setDraft(null)}
      onWheel={(e) => e.currentTarget.blur()}
      className="w-16 bg-transparent text-right font-mono text-xs text-white border-b border-transparent focus:outline-none focus:border-white/40 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  );
}

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

  // Baris tanpa min/max (Posisi X & Y) tidak dapat slider: kontrol kasarnya
  // sudah ada lewat drag langsung di kanvas.
  const fields: { label: string; key: keyof TransformType; min?: number; max?: number }[] = [
    { label: "Ukuran", key: "scale", min: 10, max: 200 },
    { label: "Rotasi", key: "rotate", min: -180, max: 180 },
    { label: "Posisi X", key: "x" },
    { label: "Posisi Y", key: "y" },
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
        {fields.map(({ label, key, min, max }) => (
          <li key={key}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs tracking-wide text-white/50">{label}</span>
              <NumberField
                label={label}
                value={transform[key]}
                min={min}
                max={max}
                onChange={(value) =>
                  setTransform((prev) => ({ ...prev, [key]: value }))
                }
              />
            </div>
            {min !== undefined && max !== undefined && (
              <input
                type="range"
                aria-label={label}
                min={min}
                max={max}
                step={1}
                value={transform[key]}
                onChange={(e) =>
                  setTransform((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-full h-1 rounded-full appearance-none bg-white/10 accent-white cursor-pointer"
              />
            )}
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
