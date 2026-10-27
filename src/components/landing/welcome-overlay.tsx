"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const SEEN_KEY = "seventx-welcome-seen";
const SEEN_EVENT = "seventx-welcome-seen-change";

// Overlay terangkat mulai LEAVE_AT; terowongan tetap berjalan sampai waktu
// yang sama supaya intro terbaca sebagai satu kesatuan.
const LEAVE_AT = 2200;
const UNMOUNT_AT = 3000;

// Angka yang paling sering diutak-atik saat tuning intro.
const TUNNEL_RINGS = 5;
const TUNNEL_SPEED = 0.15;

// Titik hilang tetap gelap: cincin tidak boleh sampai ke tengah,
// dan rel mulai dari jarak ini alih-alih dari pusat.
const INNER_LIMIT = 0.15;
const RAIL_START = 0.12;

// Cincin berbentuk persegi panjang horizontal, bukan kotak.
const RING_ASPECT = 0.7;

// Satu cahaya lebar menyapu seluruh lorong: dari depan ke belakang,
// lalu balik lagi ke depan.
const PULSE_SIGMA = 0.28;
const PULSE_FLOOR = 0.18;
const SWAY_CENTER = 0.5;
const SWAY_SPAN = 0.5;
const SWAY_PERIOD = 20;

// Biru neon tema: glow lebar, lalu inti yang lebih terang.
const RING_GLOW = "46, 92, 255";
const RING_CORE = "120, 160, 255";

// Seberapa cepat cincin menyala saat mendekat. Makin besar, makin banyak
// lorong yang gelap.
const RING_BRIGHTNESS = 1.6;

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

// Dipakai hero landing: animasi masuknya dijalankan setelah intro selesai,
// supaya tidak terbuang di balik overlay.
export function onWelcomeDone(callback: () => void) {
  if (sessionStorage.getItem(SEEN_KEY)) {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(SEEN_EVENT, handler);
  return () => window.removeEventListener(SEEN_EVENT, handler);
}

export function WelcomeOverlay() {
  const shouldShow = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [finished, setFinished] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!shouldShow) return;
    const t1 = setTimeout(() => setLeaving(true), LEAVE_AT);
    const t2 = setTimeout(() => {
      setFinished(true);
      markSeen();
    }, UNMOUNT_AT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shouldShow]);

  // Intro: terowongan grid neon biru yang membentuk ilusi lorong 3D. Digambar
  // di canvas 2D supaya tidak perlu dependency WebGL.
  useEffect(() => {
    if (!shouldShow) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
    };

    const draw = (elapsed: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const maxSize = Math.hypot(width, height);
      const t = elapsed / 1000;

      // Bersihkan frame supaya tidak ada cahaya yang menumpuk.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Rel sudut tabung: mengikuti sudut persegi panjang cincin,
      // bukan 45°. Rel mulai dari jarak minimum supaya tidak ada
      // garis yang menyentuh titik hilang, dan memudar saat
      // mendekatinya.
      ctx.lineWidth = 1;
      const corner = Math.atan(RING_ASPECT);
      for (const angle of [
        corner,
        Math.PI - corner,
        Math.PI + corner,
        2 * Math.PI - corner,
      ]) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const startX = cx + cos * maxSize * RAIL_START;
        const startY = cy + sin * maxSize * RAIL_START;
        const endX = cx + cos * maxSize;
        const endY = cy + sin * maxSize;
        const rail = ctx.createLinearGradient(startX, startY, endX, endY);
        rail.addColorStop(0, `rgba(${RING_GLOW}, 0)`);
        rail.addColorStop(1, `rgba(${RING_GLOW}, 0.08)`);
        ctx.strokeStyle = rail;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Cincin: persegi panjang horizontal yang beredar keluar,
      // tetapi tidak sampai ke tengah supaya titik hilang tetap
      // gelap. Satu cahaya lebar menyapu seluruh lorong; cosinus
      // membuat intro dimulai dari depan.
      const travel =
        SWAY_CENTER + SWAY_SPAN * Math.cos((2 * Math.PI * t) / SWAY_PERIOD);
      for (let i = 0; i < TUNNEL_RINGS; i++) {
        const phase = (i / TUNNEL_RINGS + t * TUNNEL_SPEED) % 1;
        if (phase < INNER_LIMIT) continue;
        const size = maxSize * phase * phase;
        if (size < 1) continue;
        const depth = Math.pow(phase, RING_BRIGHTNESS);

        const dist = Math.abs(phase - travel);
        const gap = Math.min(dist, 1 - dist);
        const pulse = Math.exp(-(gap * gap) / (2 * PULSE_SIGMA * PULSE_SIGMA));
        const alpha = depth * (PULSE_FLOOR + (1 - PULSE_FLOOR) * pulse);
        const halfW = size / 2;
        const halfH = (size * RING_ASPECT) / 2;

        ctx.lineWidth = 3 + phase * 6;
        ctx.strokeStyle = `rgba(${RING_GLOW}, ${alpha * 0.06})`;
        ctx.strokeRect(cx - halfW, cy - halfH, size, size * RING_ASPECT);

        ctx.lineWidth = 1 + phase * 1.5;
        ctx.strokeStyle = `rgba(${RING_CORE}, ${alpha * 0.3})`;
        ctx.strokeRect(cx - halfW, cy - halfH, size, size * RING_ASPECT);
      }
    };

    resize();

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      draw(LEAVE_AT / 2);
      return;
    }

    window.addEventListener("resize", resize);

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      // Overlay sudah dilepas: berhenti tanpa menunggu unmount.
      if (!canvasRef.current) return;
      draw(now - start);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [shouldShow, canvasRef]);

  if (!shouldShow || finished) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-noise" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,transparent_22%,transparent_78%,#000_100%)] pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <p className="relative font-display text-3xl font-extrabold tracking-[0.3em] text-white drop-shadow-[0_0_14px_rgba(46,92,255,0.6)] animate-in fade-in-0 zoom-in-95 duration-700 ease-out motion-reduce:animate-none sm:text-5xl">
          SEVENT X
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-[text-flow_5s_linear_infinite] bg-[linear-gradient(100deg,#ffffff_0%,#2E5CFF_25%,#2DE4E0_50%,#2E5CFF_75%,#ffffff_100%)] bg-[length:200%_100%] bg-clip-text text-transparent motion-reduce:animate-none"
          >
            SEVENT X
          </span>
        </p>
      </div>
    </div>
  );
}
