"use client";

import { Upload } from "lucide-react";

export default function TwibbonUpload({
  onPhotoSelected,
}: {
  onPhotoSelected: (img: HTMLImageElement) => void;
}) {
  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => onPhotoSelected(img);
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-2">
          Langkah 1
        </p>
        <h2 className="font-display text-2xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
          Pilih Foto
        </h2>
      </div>

      <label
        htmlFor="photo-upload"
        className="group flex flex-col items-center justify-center gap-3 w-full h-44 rounded-xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/40 transition-colors cursor-pointer"
      >
        <Upload className="w-8 h-8 text-white/30 group-hover:text-white transition-colors" />
        <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">
          Klik untuk pilih foto
        </span>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
