"use client";
import { useEffect, useRef } from "react";

const ORIGINS = [
  { x: 0.15, y: 0.25, color: "#F4A024", delay: 0 },
  { x: 0.82, y: 0.55, color: "#5A9470", delay: 1200 },
  { x: 0.45, y: 0.8, color: "#4A90C4", delay: 2400 },
  { x: 0.7, y: 0.15, color: "#E8836A", delay: 600 },
  { x: 0.08, y: 0.72, color: "#F4A024", delay: 1800 },
  { x: 0.9, y: 0.88, color: "#5A9470", delay: 3000 },
];

const RIPPLE_DURATION = 4200;
const MAX_RINGS = 4;

export default function RippleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let disposed = false;
    let inView = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = rect.height;
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const draw = (now: number) => {
      if (disposed) return;

      rafRef.current = requestAnimationFrame(draw);

      if (!inView) return;

      ctx.clearRect(0, 0, W, H);

      ORIGINS.forEach((origin) => {
        const ox = origin.x * W;
        const oy = origin.y * H;

        for (let ring = 0; ring < MAX_RINGS; ring++) {
          const ringOffset = (ring / MAX_RINGS) * RIPPLE_DURATION;

          const elapsed =
            (now - startTime - origin.delay - ringOffset) % RIPPLE_DURATION;

          const progress = elapsed / RIPPLE_DURATION;

          if (progress < 0) continue;

          const maxRadius = Math.min(W, H) * 0.55;
          const radius = progress * maxRadius;

          const opacity = Math.sin(progress * Math.PI) * 0.18;

          const lineWidth = (1 - progress) * 2.5 + 0.5;

          ctx.beginPath();
          ctx.arc(ox, oy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(origin.color, opacity);
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }

        const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 28);
        glow.addColorStop(0, hexToRgba(origin.color, 0.18));
        glow.addColorStop(1, hexToRgba(origin.color, 0));

        ctx.beginPath();
        ctx.arc(ox, oy, 28, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}
