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
      <div className="mb-4">
        <div className="text-[#00E5FF] font-mono text-xs tracking-wider mb-2 uppercase">Langkah 1</div>
        <h2 className="text-2xl font-bold text-white">
          Pilih Foto
        </h2>
      </div>

      <label
        htmlFor="photo-upload"
        className="group flex flex-col items-center justify-center gap-3 w-full h-40 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-[#00E5FF]/5 hover:border-[#00E5FF]/50 transition-all cursor-pointer"
      >
        <Upload className="w-8 h-8 text-white/30 group-hover:text-[#00E5FF] transition-colors" />
        <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
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
