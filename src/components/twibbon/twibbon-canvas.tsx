"use client";

// Adaptasi dari freebbonize (github.com/GithubFarelAlghazali/freebbonize)

import { useEffect, useRef } from "react";
import type { TransformType } from "./types";

type CanvasProps = {
  isEditMode: boolean;
  transform: TransformType;
  setTransform: React.Dispatch<React.SetStateAction<TransformType>>;
  userPhoto: HTMLImageElement | null;
  frameSrc: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

// Ruang koordinat transform (nilai x/y/scale selalu dalam satuan ini). Jangan
// diubah tanpa menyesuaikan slider & input di panel "Atur Posisi".
const CANVAS_WIDTH= 1600;
const CANVAS_HEIGHT= 1200;
// Resolusi bitmap: 500 x 4 = 2000 px. Ini yang menentukan ketajaman hasil
// unduhan; geometri di layar tidak terpengaruh karena semua digambar lewat
// ctx.scale(EXPORT_SCALE). Samakan dengan resolusi frame resmi kalau nanti
// frame SVG ini diganti PNG beresolusi tetap.
const EXPORT_SCALE = 4;

export default function TwibbonCanvas({
  userPhoto,
  transform,
  frameSrc,
  isEditMode,
  setTransform,
  canvasRef,
}: CanvasProps) {
  const frameRef = useRef(new Image());

  function draw() {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    if (userPhoto) {
      ctx?.save();
      ctx?.scale(EXPORT_SCALE, EXPORT_SCALE);
      ctx?.translate(
        CANVAS_WIDTH / 2 + transform.x,
        CANVAS_HEIGHT / 2 + transform.y,
      );
      ctx?.rotate((transform.rotate * Math.PI) / 180);
      ctx?.scale(transform.scale / 100, transform.scale / 100);
      ctx?.drawImage(
        userPhoto,
        -userPhoto.width / 2,
        -userPhoto.height / 2,
        userPhoto.width,
        userPhoto.height,
      );
      ctx?.restore();
    }

    const frame = frameRef.current;
    if (frame.complete && frame.src && frame.naturalWidth > 0) {
      // Gambar frame memenuhi kanvas (cover) supaya tidak ada ruang kosong.
      // Jika rasio frame berbeda dari kanvas, bagian yang meluber akan terpotong.
      const scale = Math.max(
        canvas.width / frame.naturalWidth,
        canvas.height / frame.naturalHeight,
      );
      const w = frame.naturalWidth * scale;
      const h = frame.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx?.drawImage(frame, x, y, w, h);
    }
  }

  // Load frame image
  useEffect(() => {
    const frame = frameRef.current;
    frame.onload = draw;
    frame.src = frameSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameSrc]);

  // Redraw whenever photo or transform changes
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhoto, transform]);

  // Drag-to-reposition (only in edit mode)
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas || !isEditMode) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.offsetX;
      lastY = e.offsetY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.offsetX - lastX;
      const dy = e.offsetY - lastY;
      lastX = e.offsetX;
      lastY = e.offsetY;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    };
    const onMouseUp = () => { isDragging = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
    };
  }, [canvasRef, isEditMode, setTransform]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH * EXPORT_SCALE}
      height={CANVAS_HEIGHT * EXPORT_SCALE}
      className={`w-full max-w-[360px] aspect-[4/3] rounded-xl border border-white/15 bg-[#05070D] ${isEditMode ? "cursor-grab active:cursor-grabbing" : ""}`}
    />
  );
}
