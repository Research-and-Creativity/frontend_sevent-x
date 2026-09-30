"use client";

// Ported from freebbonize (github.com/GithubFarelAlghazali/freebbonize)
// Original author: Farel Alghazali
// Adapted for SEVENT-X by: seventx team

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

const CANVAS_SIZE = 500;

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
    ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (userPhoto) {
      ctx?.save();
      ctx?.translate(
        CANVAS_SIZE / 2 + transform.x,
        CANVAS_SIZE / 2 + transform.y,
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
    if (frame.complete && frame.src) {
      ctx?.drawImage(frame, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
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
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className={`w-full max-w-[360px] aspect-square rounded-lg border border-white/10 bg-[#0B0F19] shadow-lg shadow-[#00E5FF]/10 ${isEditMode ? "cursor-grab active:cursor-grabbing" : ""}`}
    />
  );
}
