"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("seventx-welcome-seen");
    if (seen) return;
    setVisible(true);
    const t1 = setTimeout(() => setLeaving(true), 2200);
    const t2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("seventx-welcome-seen", "1");
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#05070D] flex flex-col items-center justify-center transition-opacity duration-700 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative w-28 h-36 animate-[pulse_2s_ease-in-out_infinite]">
        <Image
          src="/assets/image/logo_biru.svg"
          alt="SEVENT X"
          fill
          className="object-contain drop-shadow-[0_0_30px_rgba(59,91,255,0.6)]"
          priority
        />
      </div>
      <p className="mt-6 font-display text-2xl font-extrabold tracking-[0.3em] text-white animate-pulse">
        SEVENT X
      </p>
      <div className="mt-6 w-48 h-[2px] bg-white/10 overflow-hidden rounded-full">
        <div className="h-full bg-white/80 animate-[loading_2s_ease-in-out_forwards]" />
      </div>
    </div>
  );
}
