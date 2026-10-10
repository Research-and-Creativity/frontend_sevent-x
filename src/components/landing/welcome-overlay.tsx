"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";

const SEEN_KEY = "seventx-welcome-seen";
const SEEN_EVENT = "seventx-welcome-seen-change";

// Penanda "overlay sudah pernah tampil" hidup di sessionStorage, jadi dibaca lewat
// useSyncExternalStore. Dengan begitu render pertama di server dan client sama
// (tidak ada hydration mismatch) tanpa perlu setState di dalam effect.
function subscribe(onStoreChange: () => void) {
  window.addEventListener(SEEN_EVENT, onStoreChange);
  return () => window.removeEventListener(SEEN_EVENT, onStoreChange);
}

function getSnapshot() {
  return !sessionStorage.getItem(SEEN_KEY);
}

function getServerSnapshot() {
  return false;
}

function markSeen() {
  sessionStorage.setItem(SEEN_KEY, "1");
  window.dispatchEvent(new Event(SEEN_EVENT));
}

export function WelcomeOverlay() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [finished, setFinished] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!shouldShow) return;
    const t1 = setTimeout(() => setLeaving(true), 2200);
    const t2 = setTimeout(() => {
      setFinished(true);
      markSeen();
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shouldShow]);

  if (!shouldShow || finished) return null;

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
