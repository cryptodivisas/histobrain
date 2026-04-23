"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Props {
  trigger: number; // increment to fire a burst
  origin?: { x: number; y: number } | null; // relative to viewport
  colors?: string[];
  count?: number;
  reduceMotion?: boolean;
}

export default function Particles({
  trigger,
  origin,
  colors,
  count = 36,
  reduceMotion = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTriggerRef = useRef<number>(trigger);

  const palette = colors && colors.length > 0
    ? colors
    : ["#00ffa3", "#ffcc00", "#ff6ec7", "#b28cff", "#ffffff"];

  useEffect(() => {
    if (trigger === lastTriggerRef.current) return;
    lastTriggerRef.current = trigger;
    if (reduceMotion) return;

    const cx = origin?.x ?? window.innerWidth / 2;
    const cy = origin?.y ?? window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 40 + Math.floor(Math.random() * 30),
        size: 4 + Math.floor(Math.random() * 6),
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
    startLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, reduceMotion]);

  const startLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    if (canvas.width === 0) resize();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life++;
        p.vy += 0.25; // gravity
        p.x += p.vx;
        p.y += p.vy;
        const a = 1 - p.life / p.maxLife;
        if (a > 0) {
          ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          const sz = Math.max(2, Math.floor(p.size * (0.6 + a * 0.4)));
          ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz);
          alive.push(p);
        }
      }
      particlesRef.current = alive;
      ctx.globalAlpha = 1;
      if (alive.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ imageRendering: "pixelated" }}
      aria-hidden
    />
  );
}
